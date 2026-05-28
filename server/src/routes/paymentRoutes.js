import express from 'express'
import { createCheckoutSession, verifySession } from '../controllers/paymentController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import requiredRole from '../middleware/roleMiddleware.js'

const router = express.Router()

// Create stripe checkout session
router.post('/create-checkout-session', authMiddleware, requiredRole('patient'), createCheckoutSession)

// Verify session after redirect from stripe
router.get('/verify-session/:sessionId', authMiddleware, requiredRole('patient'), verifySession)

export default router