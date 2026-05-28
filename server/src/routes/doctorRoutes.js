import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import requiredRole from '../middleware/roleMiddleware.js'
import { applyAsDoctor, getMyDoctorProfile, getApprovedDoctors, getDoctorById } from '../controllers/doctorController.js'

const router = express.Router()

router.get('/', getApprovedDoctors)

router.post('/apply', authMiddleware, applyAsDoctor)

router.get('/me', authMiddleware, requiredRole('doctor', 'admin'), getMyDoctorProfile)

router.get('/:id', getDoctorById)

export default router