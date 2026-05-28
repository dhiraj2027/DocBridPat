import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User.js'

const router = express.Router()

router.post('/seed-admin', async (req, res, next) => {
    try {
        
        const existingAdmin = await User.findOne({ role: admin })

        if(existingAdmin) {
            return res.status(400).json({
                message: 'Admin already exists'
            })
        }

        const { name, email, password } = req.body

        if(!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            isOnboarded: true
        })

        res.status(201).json({
            message: 'Admin user created',
            adminId: admin._id
        })

    } catch (error) {
        next(error)
    }
})

export default router