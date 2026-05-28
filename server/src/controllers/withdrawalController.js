import DoctorProfile from "../models/DoctorProfile.js"
import WithdrawalRequest from "../models/WithdrawalRequest.js"


export const createWithdrawalRequest = async (req, res, next) => {
    try {
        
        const userId = req.user.id
        const { amount } = req.body

        if(!amount || amount<=0) {
            return res.status(400).json({
                message: 'Valid amount is required'
            })
        }

        const doctorProfile = await DoctorProfile.findOne({ user: userId })

        if(!doctorProfile) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            })
        }

        const request = await WithdrawalRequest.create({
            doctor: doctorProfile._id,
            amount
        })

        res.status(201).json({
            message: 'Withdrawal request submtted',
            request
        })

    } catch (error) {
        next(error)
    }
}



export const getMyWithdrawalRequests = async (req, res, next) => {
    try {
        
        const userId = req.user.id

        const doctorProfile = await DoctorProfile.findOne({ user: userId })

        if(!doctorProfile) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            })
        }

        const requests = await WithdrawalRequest.find({ doctor: doctorProfile._id }).sort({ createdAt: -1 })

        res.json(requests)

    } catch (error) {
        next(error)
    }
}