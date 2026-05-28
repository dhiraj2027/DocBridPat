import crypto from 'node:crypto'

// Generate 6-digit OTP
export const generateOTP = () => {
    // Generate a secure random 6-digit number
    const otp = crypto.randomInt(100000, 999999).toString()
    return otp
}

// OTP expiry: 10 minutes from now
export const getOTPExpiry = () => {
    return new Date(Date.now() + 10 * 60 * 1000)
}

// Check if OTP is expired
export const isOTPExpired = (expiresAt) => {
    return new Date() > new Date(expiresAt)
}