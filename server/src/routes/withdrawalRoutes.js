import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import requiredRole from '../middleware/roleMiddleware.js'
import { createWithdrawalRequest, getMyWithdrawalRequests } from '../controllers/withdrawalController.js'

const router = express.Router()

router.post('/', authMiddleware, requiredRole('doctor'), createWithdrawalRequest)

router.get('/my', authMiddleware, requiredRole('doctor'), getMyWithdrawalRequests)

export default router