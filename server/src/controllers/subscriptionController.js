import SubscriptionPlan from "../models/SubscriptionPlan.js"
import User from "../models/User.js"

export const createPlan = async (req, res, next) => {
    try {
        
        const { name, price, credits, description } = req.body

        if(!name || !price || !credits) {
            return res.status(400).json({
                message: 'Name, price and credits are required'
            })
        }

        const existing = await SubscriptionPlan.findOne({ name })

        if(existing) {
            return res.status(409).json({
                message: 'Plan with this name already exists'
            })
        }

        const plan = await SubscriptionPlan.create({
            name,
            price,
            credits,
            description
        })

        res.status(201).json({
            message: 'Plan created',
            plan
        })

    } catch (error) {
        next(error)
    }
}



export const getAllPlans = async (req, res, next) => {
    try {
        
        const plans = await SubscriptionPlan.find().sort({ prices: 1 })

        res.json(plans)

    } catch (error) {
        next(error)
    }
}



export const getActivePlans = async (req, res, next) => {
    try {
        
        const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 })

        res.json(plans)

    } catch (error) {
        next(error)
    }
}



export const updatePlan = async (req, res, next) => {
    try {
        
        const { id } = req.params
        const updates = req.body

        const plan = await SubscriptionPlan.findByIdAndUpdate(id, updates, { new: true })

        if(!plan) {
            return res.status(404).json({
                message: 'Plan not found'
            })
        }

        res.json({
            message: 'Plan updated',
            plan
        })

    } catch (error) {
        next(error)
    }
}

