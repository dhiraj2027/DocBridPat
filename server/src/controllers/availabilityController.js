import DoctorProfile from "../models/DoctorProfile.js"
import Availability from "../models/Availability.js"

export const createAvailabilitySlots = async (req, res, next) => {
    try {
        
        const userId = req.user.id
        const { date, slots } = req.body

        if(!date || !Array.isArray(slots) || slots.length === 0) {
            return res.status(400).json({
                message: 'Date and slots are required'
            })
        }

        const doctorProfile = await DoctorProfile.findOne({ user: userId })

        if(!doctorProfile) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            })
        }

        const docsToInsert = slots.map((slot) => ({
            doctor: doctorProfile._id,
            date,
            startTime: slot.startTime,
            endTime: slot.endTime
        }))

        const createdSlots = await Availability.insertMany(docsToInsert, { ordered: false })

        res.status(201).json({
            message: 'Availability slots created',
            slots: createdSlots
        })

    } catch (error) {
        if(error.code === 11000 || 
            error.name === 'BulkWriteError' || 
            (error.writeErrors && error.writeErrors.length>0)
        ) {
            return res.status(409).json({
                message: 'Some slots already exist for this date and time'
            })
        }

        next(error)
    }
}


export const getMyAvailability = async (req, res, next) => {
    try {
        
        const userId = req.user.id
        const { date } = req.query

        const doctorProfile = await DoctorProfile.findOne({ user: userId })

        if(!doctorProfile) {
            return res.status(404).json({
                message: 'Doctor profile not found'
            })
        }

        const query = { doctor: doctorProfile._id }

        if(date) {
            query.date = date
        }

        const slots = await Availability.find(query).sort({ date: 1, startTime: 1 })

        res.json(slots)

    } catch (error) {
        next(error)
    }
}


export const getDoctorAvailability = async (req, res, next) => {
    try {
        
        const { doctorId } = req.params
        const { date } = req.query

        const query = {
            doctor: doctorId,
            isBooked: false
        }

        if(date) {
            query.date = date
        }

        const slots = await Availability.find(query).sort({ date: 1, startTime: 1 })

        res.json(slots)

    } catch (error) {
        next(error)
    }
}