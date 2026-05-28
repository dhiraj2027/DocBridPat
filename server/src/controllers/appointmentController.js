import Availability from "../models/Availability.js"
import Appointment from "../models/Appointment.js"
import DoctorProfile from "../models/DoctorProfile.js"
import User from "../models/User.js"
import { sendAppointmentConfirmationEmail, sendNewAppointmentNotificationEmail, sendCancellationEmail, sendAppointmentConfirmedEmail, sendDoctorMissedEmail, sendAppointmentCompletedEmail } from "../utils/emailService.js"



export const bookAppointment = async (req, res, next) => {
    try {
        
        const patientId = req.user.id
        const { availabilityId, reasonForVisit } = req.body
        
        if(!availabilityId) {
            return res.status(400).json({
                message: 'Availability slot id is required'
            })
        }
        
        const patient = await User.findById(patientId)
        
        if(!patient) {
            return res.status(404).json({
                message: 'Patient not found'
            })
        }
        
        if(patient.role !== 'patient') {
            return res.status(403).json({
                message: 'Only patients can book appointments'
            })
        }

        if(patient.credits <= 0) {
            return res.status(400).json({
                message: 'Not enough credits to book appointment'
            })
        }
        
        const slot = await Availability.findById(availabilityId)
        
        if(!slot) {
            return res.status(404).json({
                message: 'Availability slot not found'
            })
        }
        
        if(slot.isBooked) {
            return res.status(400).json({
                message: 'This slot is already booked'
            })
        }
        
        const doctorProfile = await DoctorProfile.findById(slot.doctor)
        
        if(!doctorProfile || !doctorProfile.isApproved) {
            return res.status(400).json({
                message: 'Doctor is not approved'
            })
        }
        
        const now = new Date()
        const slotDateTime = new Date(`${slot.date}T${slot.startTime}:00`)
        
        if(slotDateTime < now) {
            return res.status(400).json({
                message: 'Cannot book appointment in the past'
            })
        }
        
        const session = await Appointment.startSession()
        session.startTransaction()
        
        try {
            
            const freshSlot = await Availability.findOne(
                { _id: availabilityId, isBooked: false },
                null,
                { session }
            )

            if(!freshSlot) {
                await session.abortTransaction()
                session.endSession()

                return res.status(400).json({
                    message: 'Slot just got booked, please choose another one'
                })
            }
            
            freshSlot.isBooked = true
            await freshSlot.save({ session })
            
            patient.credits -= 1
            await patient.save({ session })
            
            const [appointment] = await Appointment.create(
                [
                    {
                        patient: patient._id,
                        doctor: doctorProfile._id,
                        availabilitySlot: freshSlot._id,
                        date: freshSlot.date,
                        startTime: freshSlot.startTime,
                        endTime: freshSlot.endTime,
                        status: 'pending',
                        reasonForVisit
                    }
                ],
                { session }
            )
            
            await session.commitTransaction()
            session.endSession()
            
            // Fetch doctor user for email
            const doctorUser = await User.findById(doctorProfile.user)
            
            // send emails non-blocking
            sendAppointmentConfirmationEmail(patient, {
                ...doctorProfile.toObject(),
                user: doctorUser
            }, appointment)
            
            sendNewAppointmentNotificationEmail(doctorUser, patient, appointment)
            
            
            res.status(201).json({
                message: 'Appointment booked successfully',
                appointment: appointment[0]
            })
            
        } catch (innerError) {
            await session.abortTransaction()
            session.endSession()
            
            throw innerError
        }

    } catch (error) {
        next(error)
    }
}



export const getMyAppointments = async (req, res, next) => {
    try {
        
        const patientId = req.user.id
        
        const appointments = await Appointment.find({ patient: patientId })
        .populate({
            path: 'doctor',
            populate: {
                path: 'user',
                    select: 'name email'
                }
            })
            .populate('availabilitySlot')
            .sort({ date: 1, startTime: 1 })
            
        res.json(appointments)
            
    } catch (error) {
        next(error)
    }
}
    
    
    
export const getDoctorAppointments = async (req, res, next) => {
    try {
        
        const userId = req.user.id
        
        const doctorProfile = await DoctorProfile.findOne({ user: userId })
        
        if(!doctorProfile) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            })
        }
    
        const appointments = await Appointment.find({ doctor: doctorProfile._id })
        .populate('patient', 'name email')
        .populate('availabilitySlot')
        .sort({ date: 1, startTime: 1 })
        
        res.json(appointments)
        
    } catch (error) {
        next(error)
    }
}



export const cancelAppointment = async (req, res, next) => {
    try {
        
        const userId = req.user.id
        const { id } = req.params
        
        const appointment = await Appointment.findById(id)
        .populate('patient')
        .populate('availabilitySlot')
        
        if(!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            })
        }
        
        if(appointment.patient._id.toString() !== userId) {
            return res.status(403).json({
                message: 'You can only cancel your own appointments'
            })
        }
        
        if(appointment.status === 'completed' || appointment.status === 'cancelled') {
            return res.status(400).json({
                message: `Cannot cancel an appointment with status "${appointment.status}"`
            })
        }
        
        // Block cancellation if appointment has already started
        const now = new Date()
        const appointmentStart = new Date(`${appointment.date}T${appointment.startTime}:00`)
        
        if(now >= appointmentStart) {
            return res.status(400).json({
                message: 'Cannot cancel an appointment that has already started or passed'
            })
        }
        
        
        // Check 24h window for refund eligibility
        const hoursUntilStart = (appointmentStart.getTime() - now.getTime()) / (1000 * 60 * 60)
        
        const isRefundEligible = hoursUntilStart >= 24
        
        const session = await Appointment.startSession()
        session.startTransaction()
        
        try {
            
            // Mark the slot as available regardless of refund
            const slot = appointment.availabilitySlot
            slot.isBooked = false
            await slot.save({ session })
            
            //Update appointment
            appointment.status = 'cancelled'
            appointment.cancelledBy = 'patient'
            appointment.cancelledAt = now
            await appointment.save({ session })
            
            // Only refund credit if inside the free cancellation window
            if(isRefundEligible) {
                const patientToRefund = await User.findById(appointment.patient._id).session(session)
                patientToRefund.credits += 1
                await patientToRefund.save({ session })
            }
            
            await session.commitTransaction()
            session.endSession()
            
            // Send cancellation email non-blocking
            const patientUser = await User.findById(appointment.patient._id)
            if(patientUser) {
                sendCancellationEmail(patientUser, appointment, isRefundEligible)
            }

            res.json({
                message: isRefundEligible
                ? 'Appointment cancelled. Your credit has been refunded.'
                : 'Appointment cancelled. No refund applied (cancelled less than 24 hours before appointment.)',
                appointment
            })
            
        } catch (innerError) {
            await session.abortTransaction()
            session.endSession()
            
            throw innerError
        }
        
    } catch (error) {
        next(error)
    }
}



export const completeAppointment = async (req, res, next) => {
    try {
        
        const userId = req.user.id
        const { id } = req.params
        const { notes } = req.body
        
        const doctorProfile = await DoctorProfile.findOne({ user: userId })
        
        if(!doctorProfile) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            })
        }
        
        const appointment = await Appointment.findById(id)
        
        if(!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            })
        }
        
        if(appointment.doctor.toString() !== doctorProfile._id.toString()) {
            return res.status(403).json({
                message: 'You can only complete your own appointments'
            })
        }
        
        if(appointment.status !== 'confirmed') {
            return res.status(400).json({
                message: 'Only confirmed appointments can be marked as completed'
            })
        }

        // Cannot complete before the appointment end time
        const now = new Date()
        const appointmentEnd = new Date(`${appointment.date}T${appointment.endTime}:00`)
        
        if(now < appointmentEnd) {
            const minutesRemaining = Math.ceil((appointmentEnd.getTime() - now.getTime()) / (1000 * 60))
            
            return res.status(400).json({
                message: `Cannot mark appointment as completed before it ends. ${minutesRemaining} minute(s) remaining.`
            })
        }
        
        appointment.status = 'completed'
        appointment.notes = notes
        
        await appointment.save()

        const patientUser = await User.findById(appointment.patient)
        if(patientUser) {
            sendAppointmentCompletedEmail(patientUser, doctorProfile, appointment)
        }
        
        res.json({
            message: 'Appointment marked as completed',
            appointment
        })

    } catch (error) {
        next(error)
    }
}

export const confirmAppointment = async (req, res, next) => {
    try {
        
        const userId = req.user.id
        const { id } = req.params
        
        const doctorProfile = await DoctorProfile.findOne({ user: userId })
        
        if(!doctorProfile) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            })
        }
        
        const appointment = await Appointment.findById(id)
        
        if(!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            })
        }
        
        if(appointment.doctor.toString() !== doctorProfile._id.toString()) {
            return res.status(403).json({
                message: 'You can only confirm your own appointments'
            })
        }
        
        if(appointment.status !== 'pending') {
            return res.status(400).json({
                message: 'Only pending appointments can be confirmed'
            })
        }

        appointment.status = 'confirmed'
        await appointment.save()

        const patientUser = await User.findById(appointment.patient)

        if(patientUser) {
            sendAppointmentConfirmedEmail(patientUser, doctorProfile, appointment)
        }
        
        res.json({
            message: 'Appointment confirmed',
            appointment
        })
        
    } catch (error) {
        next(error)
    }
}


export const markMissedAppointment = async (req, res, next) => {
    try {
        
        const userId = req.user.id
        const { id } = req.params
        
        const doctorProfile = await DoctorProfile.findOne({ user: userId })
        
        if(!doctorProfile) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            })
        }
        
        const appointment = await Appointment.findById(id)
        
        if(!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            })
        }
        
        if(appointment.doctor.toString() !== doctorProfile._id.toString()) {
            return res.status(403).json({
                message: 'You can only update your own appointments'
            })
        }
        
        if(appointment.status !== 'pending' && appointment.status !== 'confirmed') {
            return res.status(400).json({
                message: 'Only pending or confirmed appointments can be marked as missed'
            })
        }

        // Can only mark missed after end time
        const now = new Date()
        const appointmentEnd = new Date(`${appointment.date}T${appointment.endTime}:00`)

        if(now < appointmentEnd) {
            const minutesRemaining = Math.ceil((appointmentEnd.getTime() - now.getTime()) / (1000 * 60))

            return res.status(400).json({
                message: `Cannot mark as missed before appointment ends. ${minutesRemaining} minute(s) remaining.`
            })
        }

        // Doctor missed: patient credit is refunded
        const session = await Appointment.startSession()
        session.startTransaction()

        try {
            
            appointment.status = 'missed'
            await appointment.save({ session })

            // Refund credit to patient
            // Fetch patient fresh inside transaction
            // const appointment = await Appointment.findById(id).populate('patient').session(session)
            // Or
            const patient = await User.findById(appointment.patient).session(session)
            patient.credits += 1
            await patient.save({ session })

            await session.commitTransaction()
            session.endSession()

            // Notify patient via email
            sendDoctorMissedEmail(patient, appointment)

            res.json({
                message: 'Appointment marked as missed. Patient credit refunded.',
                appointment
            })

        } catch (innerError) {
            await session.abortTransaction()
            session.endSession()
            throw innerError
        }

    } catch (error) {
        next(error)
    }
}