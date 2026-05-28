import mongoose from 'mongoose'

const { Schema } = mongoose

const availabilitySchema = new Schema(
    {
        doctor: {
            type: Schema.Types.ObjectId,
            ref: 'DoctorProfile',
            required: true
        },
        date: {
            type: String,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        isBooked: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

availabilitySchema.index(
    { doctor: 1, date: 1, startTime: 1},
    { unique: true }
)

const Availability = mongoose.model('Availability', availabilitySchema)

export default Availability