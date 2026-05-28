import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import requiredRole from '../middleware/roleMiddleware.js'
import { getPendingDoctors, approveDoctor, getWithdrawalRequests, processWithdrawalRequest } from '../controllers/adminController.js'


const router = express.Router()

router.use(authMiddleware, requiredRole('admin'))

router.get('/doctors/pending', getPendingDoctors)
router.patch('/doctors/:id/approve', approveDoctor)

router.get('/withdrawals', getWithdrawalRequests)
router.patch('/withdrawals/:id', processWithdrawalRequest)

export default router