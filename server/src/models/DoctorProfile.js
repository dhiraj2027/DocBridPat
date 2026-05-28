import mongoose from 'mongoose'

const { Schema } = mongoose

const doctorProfileSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        specialization: {
            type: String,
            required: true,
            trim: true
        },
        about: {
            type: String,
            trim: true
        },
        experienceYears: {
            type: Number,
            default: 0
        },
        consultationFee: {
            type: Number,
            default: 0
        },
        clinicName: {
            type: String,
            trim: true
        },
        clinicAddress: {
            type: String,
            trim: true
        },
        isApproved: {
            type: Boolean,
            default: false
        },
        videoCallEnabled: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema)

export default DoctorProfile