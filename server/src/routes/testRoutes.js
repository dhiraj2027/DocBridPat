import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import requiredRole from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/me', authMiddleware, (req, res) => {
    res.json({
        message: 'You are authenticated',
        user: req.user
    })
})

router.get('/admin-only', authMiddleware, requiredRole('admin'), (req, res) => {
    res.json({
        message: 'Welcome, admin',
        user: req.user
    })
})

export default router