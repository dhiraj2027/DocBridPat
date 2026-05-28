import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { getOrCreateVideoRoom } from '../controllers/videoController.js'

const router = express.Router()

// patient or doctor for that appointment can call this
router.get('/room/:appointmentId', authMiddleware, getOrCreateVideoRoom)

export default router