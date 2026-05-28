import mongoose from 'mongoose'

const { Schema } = mongoose

const appointmentSchema = new Schema(
    {
        patient: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        doctor: {
            type: Schema.Types.ObjectId,
            ref: 'DoctorProfile',
            required: true
        },
        availabilitySlot: {
            type: Schema.Types.ObjectId,
            ref: 'Availability',
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
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'completed', 'cancelled', 'missed'],
            default: 'pending'
        },
        cancelledBy : {
            type: String,
            enum: ['patient', 'doctor', 'admin'],
            default: null
        },
        cancelledAt: {
            type: Date,
            default: null
        },
        reasonForVisit: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        },
        videoRoomId: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

appointmentSchema.index(
    { patient: 1, doctor: 1, date: 1, startTime: 1},
    { unique: true }
)

const Appointment = mongoose.model('Appointment', appointmentSchema)

export default Appointment