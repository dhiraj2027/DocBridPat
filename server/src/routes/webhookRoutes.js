// Webhook route is separate from other routes as it needs raw body

import express from 'express'
import { handleWebhook } from '../controllers/paymentController.js'

const router = express.Router()

// express.raw() keeps body as Buffer - required for Stripe signature verification
router.post('/', express.raw({ type: 'application.json' }), handleWebhook)

export default router