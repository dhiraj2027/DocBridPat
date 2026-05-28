import crypto from 'node:crypto'
import Appointment from '../models/Appointment.js'
import DoctorProfile from '../models/DoctorProfile.js'

export const getOrCreateVideoRoom = async (req, res, next) => {
    try {
        
        const userId = req.user.id
        const { appointmentId } = req.params

        const appointment = await Appointment.findById(appointmentId)
                            .populate('patient', 'id')
                            .populate('doctor')
        
        if(!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            })
        }

        const doctorProfile = await DoctorProfile.findById(appointment.doctor)
                                .populate('user', '_id')

        
        const isPatient = appointment.patient._id.toString() === userId
        const isDoctor = doctorProfile && doctorProfile.user._id.toString() === userId

        if(!isPatient && !isDoctor) {
            return res.status(403).json({
                message: 'You are not allowed to join this appointment'
            })
        }

        if(!appointment.videoRoomId) {
            const roomId = crypto.randomUUID()

            appointment.videoRoomId = roomId
            await appointment.save()

            return res.json({ roomId })
        }

        res.json({ roomId: appointment.videoRoomId })

    } catch (error) {
        next(error)
    }
}