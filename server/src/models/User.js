import mongoose from 'mongoose'

const { Schema } = mongoose

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6
        },
        role: {
            type: String,
            enum: ['patient', 'doctor', 'admin'],
            default: 'patient'
        },
        isOnboarded: {
            type: Boolean,
            default: false
        },
        credits: {
            type: Number,
            default: 0
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        otp: {
            code: {
                type: String,
                default: null
            },
            expiresAt: {
                type: Date,
                default: null
            }
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', userSchema)

export default User