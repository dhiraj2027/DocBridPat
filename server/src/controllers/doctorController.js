import User from "../models/User.js"
import DoctorProfile from "../models/DoctorProfile.js"

export const applyAsDoctor = async (req, res, next) => {
    try {
        
        const userId = req.user.id
        const {
            specialization,
            about,
            experienceYears,
            consultationFee,
            clinicName,
            clinicAddress
        } = req.body

        if(!specialization) {
            return res.status(400).json({
                message: 'Specialization is required'
            })
        }

        const user = await User.findById(userId)

        if(!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        if(user.role !== 'doctor') {
            user.role = 'doctor'
            await user.save()
        }

        const existingProfile = await DoctorProfile.findOne({ user: userId })

        if(existingProfile) {
            existingProfile.specialization = specialization
            existingProfile.about = about
            existingProfile.experienceYears = experienceYears ?? existingProfile.experienceYears
            existingProfile.consultationFee = consultationFee ?? existingProfile.consultationFee
            existingProfile.clinicName = clinicName ?? existingProfile.clinicName
            existingProfile.clinicAddress = clinicAddress ?? existingProfile.clinicAddress
            existingProfile.isApproved = false
            
            await existingProfile.save()
            
            return res.json({
                message: 'Doctor profile updated and pending approval',
                profile: existingProfile
            })
        }

        const profile = await DoctorProfile.create({
            user: userId,
            specialization,
            about,
            experienceYears,
            consultationFee,
            clinicName,
            clinicAddress
        })

        res.status(201).json({
            message: 'Doctor application submitted and pending approval',
            profile
        })

    } catch (error) {
        next(error)
    }
}


export const getMyDoctorProfile = async (req, res, next) => {
    try {
        
        const userId = req.user.id

        const profile = await DoctorProfile.findOne({ user: userId }).populate('user', 'name email')

        if(!profile) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            })
        }

        res.json(profile)

    } catch (error) {
        next(error)
    }
}


export const getApprovedDoctors = async (req, res, next) => {
    try {
        
        const { specialization } = req.query

        const query = { isApproved: true }

        if(specialization) {
            query.specialization = specialization
        }

        const doctors = await DoctorProfile.find(query).populate('user', 'name email')

        res.json(doctors)

    } catch (error) {
        next(error)
    }
}

export const getDoctorById = async (req, res, next) => {
    try {
        
        const { id } = req.params
        const doctor = await DoctorProfile.findById(id)
            .populate('user', 'name email')

        if(!doctor || !doctor.isApproved) {
            return res.status(404).json({
                message: 'Doctor not found'
            })
        }

        res.json(doctor)

    } catch (error) {
        next(error)
    }
}