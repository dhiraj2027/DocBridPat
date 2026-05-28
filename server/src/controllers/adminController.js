import DoctorProfile from "../models/DoctorProfile.js"
import WithdrawalRequest from '../models/WithdrawalRequest.js'
import User from "../models/User.js"
import { sendDoctorApprovedEmail, sendWithdrawalStatusEmail } from "../utils/emailService.js"


export const getPendingDoctors = async (req, res, next) => {
    try {
        
        const doctors = await DoctorProfile.find({ isApproved: false }).populate('user', 'name email')

        res.json(doctors)

    } catch (error) {
        next(error)
    }
}



export const approveDoctor = async (req, res, next) => {
    try {
        
        const { id } = req.params

        const doctor = await DoctorProfile.findById(id).populate('user', 'name email')

        if(!doctor) {
            return res.status(404).json({
                mesage: 'Doctor profile not found'
            })
        }

        doctor.isApproved = true
        await doctor.save()

        // Send approval email
        const doctorUser = await User.findById(doctor.user)
        if(doctorUser) {
            sendDoctorApprovedEmail(doctorUser)
        }

        res.json({
            message: 'Doctor approved',
            doctor
        })

    } catch (error) {
        next(error)
    }
}



export const getWithdrawalRequests = async (req, res, next) => {
    try {
        
        const { status } = req.query

        const query = {}

        if(status) {
            query.status = status
        }

        const requests = await WithdrawalRequest.find(query)
                        .populate({
                            path: 'doctor',
                            populate: {
                                path: 'user',
                                select: 'name email'
                            }
                        })
                        .sort({ createdAt: -1 })
        
        res.json(requests)

    } catch (error) {
        next(error)
    }
}



export const processWithdrawalRequest = async (req, res, next) => {
    try {
        
        const { id } = req.params
        const { status, notes } = req.body

        if(!['approved', 'rejected', 'paid'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status'
            })
        }

        const request = await WithdrawalRequest.findById(id)

        if(!request) {
            return res.status(404).json({
                message: 'Withdrawal request not found'
            })
        }

        request.status = status
        request.notes = notes
        request.processedAt = new Date()

        await request.save()

        // Send withdrawal status email
        const populatedRequest = await WithdrawalRequest.findById(request._id)
            .populate({
                path: 'doctor',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })

        if(populatedRequest?.doctor?.user) {
            sendWithdrawalStatusEmail(populatedRequest.doctor.user, request)
        }

        res.json({
            message: 'Withdrawal request updated',
            request
        })

    } catch (error) {
        next(error)
    }
}