import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import requiredRole from '../middleware/roleMiddleware.js'
import { bookAppointment, getMyAppointments, getDoctorAppointments, cancelAppointment, completeAppointment, confirmAppointment, markMissedAppointment  } from '../controllers/appointmentController.js'

const router = express.Router()

// Patient books appointment
router.post('/', authMiddleware, requiredRole('patient'), bookAppointment)

// Patient gets own appointments
router.get('/my', authMiddleware, requiredRole('patient'), getMyAppointments)

// Doctor gets appointments
router.get('/doctor', authMiddleware, getDoctorAppointments)

// Patient cancels appointment
router.patch('/:id/cancel', authMiddleware, requiredRole('patient'), cancelAppointment)

// Doctor completes appointment and add notes
router.patch('/:id/complete', authMiddleware, requiredRole('doctor'), completeAppointment)

// Doctor confirm appointments
router.patch('/:id/confirm', authMiddleware, requiredRole('doctor'), confirmAppointment)

// Doctor missed appointments
router.patch('/:id/missed', authMiddleware, requiredRole('doctor'), markMissedAppointment)

export default router