import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import requiredRole from '../middleware/roleMiddleware.js'
import { createAvailabilitySlots,getMyAvailability, getDoctorAvailability } from '../controllers/availabilityController.js'

const router = express.Router()

router.post('/', authMiddleware, requiredRole('doctor'), createAvailabilitySlots)

router.get('/my', authMiddleware, requiredRole('doctor'), getMyAvailability)

router.get('/doctor/:doctorId', authMiddleware, getDoctorAvailability)

export default router