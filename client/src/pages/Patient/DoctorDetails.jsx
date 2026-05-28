import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth.js"
import { getDoctorById } from "../../services/doctorService.js"
import { getDoctorAvailability } from '../../services/availabilityService.js'
import { bookAppointment } from '../../services/appointmentService.js'
import Badge from "../../components/ui/Badge.jsx"
import Button from "../../components/ui/Button.jsx"
import Modal from '../../components/ui/Modal.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

const DoctorDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, updateUser } = useAuth()

    const [doctor, setDoctor] = useState(null)
    const [slots, setSlots] = useState([])
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [selectedDate, setSelectedDate] = useState('')
    const [reasonForVisit, setReasonForVisit] = useState('')

    const [isLoadingDoctor, setIsLoadingDoctor] = useState(true)
    const [isLoadingSlots, setIsLoadingSlots] = useState(false)
    const [isBooking, setIsBooking] = useState(false)

    const [doctorError, setDoctorError] = useState('')
    const [bookingError, setBookingError] = useState('')
    const [bookingSuccess, setBookingSuccess] = useState(false)

    const [showModal, setShowModal] = useState(false)

    // Fetch Doctor by id
    useEffect(() => {
        const fetchDoctor = async () => {
            setIsLoadingDoctor(true)
            setDoctorError('')

            try {
                
                const data = await getDoctorById(id)
                setDoctor(data)

            } catch {
                setDoctorError('Failed to load doctor profile.')
            } finally {
                setIsLoadingDoctor(false)
            }
        }

        fetchDoctor()
    }, [id])


    // Fetch slots when date changes
    useEffect(() => {
        if(!selectedDate || !id) return

        const fetchSlots = async () => {
            setIsLoadingSlots(true)
            setSlots([])
            setSelectedSlot(null)

            try {
                
                const data = await getDoctorAvailability(id, selectedDate)
                setSlots(data)

            } catch {
                setSlots([])
            } finally {
                setIsLoadingSlots(false)
            }
        }

        fetchSlots()
    }, [selectedDate, id])


    // Get next 7 dates for for date picker
    const getNext7Days = () => {
        const days = []
        const today = new Date()

        for(let i=0;i<7;i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)

            const yyyy = date.getFullYear()
            const mm = String(date.getMonth() + 1).padStart(2, '0')
            const dd = String(date.getDate()).padStart(2, '0')

            days.push({
                value: `${yyyy}-${mm}-${dd}`,
                label: date.toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                })
            })
        }

        return days
    }


    // Book Appointment
    const handleBooking = async () => {
        setBookingError('')
        setIsBooking(true)

        try {
            
            await bookAppointment({
                availabilityId: selectedSlot._id,
                reasonForVisit
            })

            // deduct credit locally
            updateUser({ credits: user.credits - 1 })
            setBookingSuccess(true)

        } catch (error) {
            const message = error?.response?.data?.message || 'Booking failed. Please try again.'
            setBookingError(message)
        } finally {
            setIsBooking(false)
        }
    }


    // Open booking modal
    const handleOpenModal = () => {
        setBookingError('')
        setBookingSuccess(false)
        setReasonForVisit('')
        setShowModal(true)
    }


    // Close modal + reset
    const handleCloseModal = () => {
        if(bookingSuccess) {
            navigate('/appointments')
        }

        setShowModal(false)
        setBookingError('')
        setBookingSuccess(false)
    }


    // Loading state
    if(isLoadingDoctor) {
        return <Spinner fullScreen />
    }


    // Error state
    if(doctorError) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <p className="text-red-500">{doctorError}</p>
                <Button variant='outline' onClick={() => navigate('/doctors')}>
                    Back to Doctors
                </Button>
            </div>
        )
    }

    const next7Days = getNext7Days()

    // Render
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            
            {/* Back button */}
            <button
                onClick={() => navigate('/doctors')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <svg
                    className="w-4 h-4"
                    fill='none'
                    stroke='currentColor'
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d='M15 191-7-7 7-7'
                    />
                </svg>
                Back to doctors
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Doctor Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sticky top-24">

                        {/* Avatar */}
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                <span className="text-blue-700 font-bold text-3xl">
                                    {doctor.user?.name?.charAt(0).toUpperCase() || 'D'}
                                </span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Dr. {doctor.user?.name}
                            </h1>
                            <Badge variant='primary' className="mt-2">
                                {doctor.specialization}
                            </Badge>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-gray-900">
                                    {doctor.experienceYears}
                                </p>
                                <p className="text-xs text-gray-500">Years exp.</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <p className="text-xl font-bold text-gray-900">
                                    ₹{doctor.consultationFee}
                                </p>
                                <p className="text-xs text-gray-500">Per session</p>
                            </div>
                        </div>

                        {/* Clinic Info */}
                        {doctor.clinicName && (
                            <div className="flex flex-col gap-2 mb-5 text-sm text-gray-600">
                                <div className="flex items-start gap-2">
                                    <svg
                                        className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                                        />
                                    </svg>
                                    <span>{doctor.clinicName}</span>
                                </div>

                                {doctor.clinicAddress && (
                                    <div className="flex items-start gap-2">
                                        <svg
                                            className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d='M17.657 16.657L13.414 20.9a2 2 0 
                                                    01-2.827 0L6.343 16.657a8 8 0 
                                                    1111.314 0z'
                                            />
                                            <path 
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                                            />
                                        </svg>
                                        <span>{doctor.clinicAddress}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Credits warning */}
                        {user?.credits === 0 && (
                            <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg mb-4">
                                <p className="text-xs text-yellow-700">
                                    You have 0 credits. Purchase a plan to book appointments.
                                </p>
                            </div>
                        )}

                        {/* Credits badge */}
                        <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-xl">
                            <span className="text-xs text-blue-600 font-medium">
                                Your credits: 
                            </span>
                            <span className="text-sm font-bold text-blue-700">
                                {user?.credits}
                            </span>
                        </div>

                    </div>
                </div>


                {/* Right: About + Slot booking */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    {/* About section */}
                    {doctor.about && (
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                About
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {doctor.about}
                            </p>
                        </div>
                    )}

                    {/* Slot booking section */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-5">
                            Book an Appointment
                        </h2>

                        {/* Date Selector */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                Select a date
                            </p>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {next7Days.map((day) => (
                                    <button
                                        key={day.value}
                                        onClick={() => setSelectedDate(day.value)}
                                        className={`
                                            flex flex-col items-center px-4 py-3 rounded-xl 
                                            border-2 min-w-[80px] transition-all duration-150 
                                            ${selectedDate === day.value
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <span className="text-xs font-medium">
                                            {day.label.split(' ')[0]}
                                        </span>
                                        <span className="text-lg font-bold">
                                            {day.label.split(' ')[2]}
                                        </span>
                                        <span className="text-xs">
                                            {day.label.split(' ')[1]}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time slots */}
                        {selectedDate && (
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-700 mb-3">
                                    Available time slots
                                </p>

                                {isLoadingSlots && (
                                    <div className="flex justify-center py-6">
                                        <Spinner size='sm' />
                                    </div>
                                )}

                                {!isLoadingSlots && slots.length===0 && (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500">
                                            No available slots for this date.
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Try selecting a different date.
                                        </p>
                                    </div>
                                )}

                                {!isLoadingSlots && slots.length>0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {slots.map((slot) => (
                                            <button
                                                key={slot._id}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`
                                                    py-2 px-3 rounded-lg border text-sm font-medium 
                                                    transition-all duration-150 
                                                    ${selectedSlot?._id === slot._id
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                                                    }
                                                `}
                                            >
                                                {slot.startTime} - {slot.endTime}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Book button */}
                        <Button
                            className="w-full"
                            size='lg'
                            disabled={!selectedSlot || user?.credits===0}
                            onClick={handleOpenModal}
                        >
                            {user?.credits === 0 
                                ? 'No credits available'
                                : selectedSlot 
                                    ? `Book ${selectedSlot.startTime} - ${selectedSlot.endTime}`
                                    : 'Select a slot to book'
                            }
                        </Button>

                        {/* No slot hint */}
                        {!selectedDate && (
                            <p className="text-xs text-gray-400 text-center mt-3">
                                Please select a date above to see available slots.
                            </p>
                        )}

                    </div>
                </div>
            </div>


            {/* Booking Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={bookingSuccess ? 'Booking Confirmed!' : 'Confirm Appointment'}
                size='md'
            >
                {/* Success screen inside modal */}
                {bookingSuccess ? (
                    <div className="flex flex-col items-center text-center gap-4 py-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-green-600"
                                fill='none'
                                stroke='currentColor'
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d='M5 13l4 4L19 7'
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                Appointment Booked!
                            </h3>
                            <p className="text-sm text-gray-500">
                                Your appointment with Dr. {doctor.user?.name} on{' '}
                                <span className="font-medium text-gray-700">
                                    {selectedSlot?.date}
                                </span>{' '}
                                at{' '}
                                <span className="font-medium text-gray-700">
                                    {selectedSlot?.startTime}
                                </span>{' '}
                                has been confirmed.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg w-full justify-center">
                            <span className="text-xs text-blue-600 font-medium">
                                Remaining credits: 
                            </span>
                            <span className="text-sm font-bold text-blue-700">
                                {user?.credits}
                            </span>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleCloseModal}
                        >
                            View my Appointments
                        </Button>
                    </div>
                ) : (
                    /* Confirm booking form */
                    <div className="flex flex-col gap-4">

                        {/* Appointment summary */}
                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Doctor</span>
                                <span className="font-medium text-gray-900">
                                    Dr. {doctor.user?.name}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Specialization</span>
                                <span className="font-medium text-gray-900">
                                    {doctor.specialization}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium text-gray-900">
                                    {selectedSlot?.date}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Time</span>
                                <span className="font-medium text-gray-900">
                                    {selectedSlot?.startTime} - {selectedSlot?.endTime}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Fee</span>
                                <span className="font-medium text-gray-900">
                                    ₹{doctor.consultationFee}
                                </span>
                            </div>
                            
                            <hr className="border-gray-200" />

                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Credits after booking</span>
                                <span className="font-semibold text-blue-700">
                                    {user?.credits - 1}
                                </span>
                            </div>
                        </div>

                        {/* Reason for visit */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">
                                Reason for visit{' '}
                                <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <textarea 
                                rows={3}
                                placeholder="Describe your symptoms or reason for this appointment..."
                                value={reasonForVisit}
                                onChange={(e) => setReasonForVisit(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg 
                                            bg-white text-gray-900 placeholder:text-gray-400 
                                            resize-none focus:outline-none focus:ring-2 
                                            focus:ring-blue-500 focus:border-transparent 
                                            transition-colors"
                            />
                        </div>

                        {/* Booking error */}
                        {bookingError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{bookingError}</p>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3 mt-1">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={handleCloseModal}
                                disabled={isBooking}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                isLoading={isBooking}
                                onClick={handleBooking}
                            >
                                Confirm Booking
                            </Button>
                        </div>

                        {/* Credit note */}
                        <p className="text-xs text-gray-400 text-center">
                            1 credit will be deducted from your account upon confirmation.
                        </p>

                    </div>
                )}
            </Modal>

        </div>
    )
}

export default DoctorDetails