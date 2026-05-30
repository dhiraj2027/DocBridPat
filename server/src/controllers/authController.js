import bcrypt from 'bcrypt'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import { generateOTP, getOTPExpiry, isOTPExpired } from '../utils/otpUtils.js'
import { sendWelcomeEmail, sendOTPEmail, sendResendOTPEmail } from '../utils/emailService.js'


const SALT_ROUNDS = 10

const isStrongPassword = (password) => {
    return (
        password.length >= 8 && 
        /[A-Z]/.test(password) && 
        /[a-z]/.test(password) && 
        /[0-9]/.test(password) && 
        /[^A-Za-z0-9]/.test(password)
    )
}

export const register = async (req, res, next) => {
    try {
        
        const { name, email, password, role } = req.body

        if(!name  || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required'
            })
        }

        if(!isStrongPassword) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters and contain uppercase, lowercase, number and special character.'
            })
        }

        const existingUser = await User.findOne({ email })

        if(existingUser) {
            return res.status(409).json({
                message: 'Email is already registered'
            })
        }

        const hashedpassword = await bcrypt.hash(password, SALT_ROUNDS)

        // Generate OTP
        const otp = generateOTP()
        const otpExpiry = getOTPExpiry()

        const user = await User.create({
            name,
            email,
            password: hashedpassword,
            role: role || 'patient',
            isVerified: false,
            otp: {
                code: otp,
                expiresAt: otpExpiry
            }
        })

        // Send OTP email
        await sendOTPEmail(user, otp)

        res.status(201).json({
            message: 'Registration successful. Please verify your email.',
            userId: user._id,
            email: user.email
        })

    } catch (error) {
        next(error)
    }
}


export const verifyOTP = async (req, res, next) => {
    try {
        
        const { userId, otp } = req.body

        if(!userId || !otp) {
            return res.status(400).json({
                message: 'User ID and OTP are required'
            })
        }

        const user = await User.findById(userId)

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        if(user.isVerified) {
            return res.status(400).json({

                message: 'Email already verified'
            })
        }

        if(!user.otp?.code) {
            return res.status(400).json({
                message: 'No OTP found. Please request a new one.'
            })
        }

        if(isOTPExpired(user.otp.expiresAt)) {
            return res.status(400).json({
                message: 'OTP has expired. Please request a new one.'
            })
        }

        if(user.otp.code !== otp.toString().trim()) {
            return res.status(400).json({
                message: 'Invalid OTP. Please try again.'
            })
        }

        // Mark verified and clear OTP
        user.isVerified = true
        user.otp = { code: null, expiresAt: null }
        await user.save()

        // Send welcome email after verification
        sendWelcomeEmail(user)

        // Generate JWT token
        const token = generateToken(user._id.toString(), user.role)

        res.json({
            message: 'Email verified successfully.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isOnboarded: user.isOnboarded,
                isVerified: user.isVerified,
                credits: user.credits
            }
        })

    } catch (error) {
        next(error)
    }
}


export const resendOTP = async (req, res, next) => {
    try {
        
        const { userId } = req.body

        if(!userId) {
            return res.status(400).json({
                message: 'User ID is required'
            })
        }

        const user = await User.findById(userId)

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        if(user.isVerified) {
            return res.status(400).json({
                message: 'Email is already verified'
            })
        }

        // Generate new OTP
        const otp = generateOTP()
        const otpExpiry = getOTPExpiry()

        user.otp = { code: otp, expiresAt: otpExpiry}
        await user.save()

        // Send new OTP email
        await sendResendOTPEmail(user, otp)

        res.json({
            message: 'New OTP sent to your email.',
            userId: user._id
        })

    } catch (error) {
        next(error)
    }
}


export const login = async (req, res, next) => {
    try {
        
        const { email, password } = req.body

        if(!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            })
        }

        const user = await User.findOne({ email })

        if(!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch) {
            return res.status(401).json({
                message: 'Invalid credentials'
            })
        }

        // Block login if email not verified
        if(!user.isVerified) {

            // Generate new OTP so they can verify
            const otp = generateOTP()
            const otpExpiry = getOTPExpiry()

            user.otp = { code: otp, expiresAt: otpExpiry}
            await user.save()

            await sendOTPEmail(user, otp)

            return res.status(200).json({
                message: 'Email not verified. A new OTP has been sent to your email.',
                userId: user._id,
                email: user.email,
                requiresVerification: true
            })
        }

        const token = generateToken(user._id.toString(), user.role)

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isOnboarded: user.isOnboarded,
                isVerified: user.isVerified,
                credits: user.credits
            }
        })

    } catch (error) {
        next(error)
    }
}


export const getCurrentUser = async (req, res, next) => {
    try {
        
        const userId = req.user.id
        const user = await User.findById(userId).select('-password')

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        res.json(user)

    } catch (error) {
        next(error)
    }
}