import mongoose from 'mongoose'

const { Schema } = mongoose

const withdrawalRequestSchema = new Schema(
    {
        doctor: {
            type: Schema.Types.ObjectId,
            ref: 'DoctorProfile',
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'paid'],
            default: 'pending'
        },
        notes: {
            type: String,
            trim: true
        },
        processedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
)

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema)

export default WithdrawalRequest