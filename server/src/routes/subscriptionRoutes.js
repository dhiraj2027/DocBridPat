import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import requiredRole from '../middleware/roleMiddleware.js'
import { createPlan, getAllPlans, getActivePlans, updatePlan } from '../controllers/subscriptionController.js'

const router = express.Router()

// admin: manage plans
router.post('/plans', authMiddleware, requiredRole('admin'), createPlan)

router.get('/plans', authMiddleware, requiredRole('admin'), getAllPlans)

router.patch('/plans/:id', authMiddleware, requiredRole('admin'), updatePlan)


// public: active plans for landing page
router.get('/active', getActivePlans)


export default router