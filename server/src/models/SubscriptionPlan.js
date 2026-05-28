import mongoose from 'mongoose'

const { Schema }  = mongoose

const subscriptionPlanSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        price: {
            type: Number,
            required: true
        },
        credits: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        stripePriceId: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema)

export default SubscriptionPlan