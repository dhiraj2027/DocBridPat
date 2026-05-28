import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getMyAppointments, cancelAppointment } from "../../services/appointmentService.js"
import { getActivePlans } from '../../services/subscriptionService.js'
import { createCheckoutSession } from "../../services/paymentService.js"
import useAuth from "../../hooks/useAuth.js"
import Badge from "../../components/ui/Badge.jsx"
import Button from "../../components/ui/Button.jsx"
import Modal from "../../components/ui/Modal.jsx"
import Spinner from "../../components/ui/Spinner.jsx"


// Status badge variant map
const statusVariant = (status) => {
    const map = {
        pending: 'warning',
        confirmed: 'primary',
        completed: 'success',
        cancelled: 'danger',
        missed: 'danger'
    }

    return map[status] || 'default'
}

// Format date string
const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}


// Main component
const MyAppointments = () => {
    const navigate = useNavigate()
    const { user, refreshUser } = useAuth()

    // appointments
    const [appointments, setAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    // tabs: upcoming | past
    const [activeTab, setActiveTab] = useState('upcoming')

    // cancel modal
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [isCancelling, setIsCancelling] = useState(false)
    const [cancelError, setCancelError] = useState('')

    // plans modal
    const [showPlansModal, setShowPlansModal] = useState(false)
    const [plans, setPlans] = useState([])
    const [isLoadingPlans, setIsLoadingPlans] = useState(false)
    const [isPurchasingPlanId, setIsPurchasingPlanId] = useState(null)
    const [purchaseError, setPurchaseError] = useState('')

    
    // Fetch appointments
    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        setIsLoading(true)
        setError('')

        try {
            
            const data = await getMyAppointments()
            setAppointments(data.appointments)

            await refreshUser()

        } catch {
            setError('Failed to load appointments. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch plans
    const fetchPlans = async () => {
        setIsLoadingPlans(true)

        try {
            
            const data = await getActivePlans()
            setPlans(data)

        } catch {
            setPlans([])
        } finally {
            setIsLoadingPlans(false)
        }
    }


    // Open plans modal
    const handleOpenPlans = () => {
        setPurchaseError('')
        setShowPlansModal(true)
        fetchPlans()
    }


    // Purchase plan
    const handlePurchase = async (planId) => {
        setIsPurchasingPlanId(planId)
        setPurchaseError('')

        try {
            
            const data = await createCheckoutSession(planId)

            // Redirect to Stripe hosted checkout
            window.location.href = data.url

        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to initiate payment.'
            setPurchaseError(message)
        } finally {
            setIsPurchasingPlanId(null)
        }
    }


    // Open cancel modal
    const handleOpenCancel = (appointment) => {
        setSelectedAppointment(appointment)
        setCancelError('')
        setShowCancelModal(true)
    }


    // Confirm cancel
    const handleConfirmCancel = async () => {
        if(!selectedAppointment) return

        setIsCancelling(true)
        setCancelError('')

        try {
            
            await cancelAppointment(selectedAppointment._id)

            await refreshUser()

            // update list locally
            setAppointments((prev) => 
                prev.map((a) => 
                    a._id === selectedAppointment._id
                        ? { ...a, status: 'cancelled'}
                        : a
                )
            )

            setShowCancelModal(false)
            setSelectedAppointment(null)

        } catch (error) {
            const message = error?.response?.data?.message || 'Cancellation failed. Please try again.'
            setCancelError(message)
        } finally {
            setIsCancelling(false)
        }
    }


    // Filter appointments by tab
    const now = new Date()

    const upcomingAppointments = appointments.filter((a) => {
        const apptDate = new Date(`${a.date}T${a.endTime}:00`)
        return (
            apptDate >= now && 
            a.status !== 'cancelled' && 
            a.status !== 'completed' && 
            a.status !== 'missed'
        )
    })

    const pastAppointments = appointments.filter((a) => {
        const apptDate = new Date(`${a.date}T${a.endTime}:00`)
        return (
            apptDate < now || 
            a.status === 'cancelled' || 
            a.status === 'completed' || 
            a.status === 'missed'
        )
    })

    const displayList = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments


    // Render
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                        My Appointments
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Manage your upcoming and past consultations.
                    </p>
                </div>

                {/* Credits + buy button */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
                        <span className="text-xs text-blue-600 font-medium">Credits: </span>
                        <span className="text-sm font-bold text-blue-700">
                            {user?.credits}
                        </span>
                    </div>

                    <Button
                        variant='outline'
                        size='sm'
                        onClick={handleOpenPlans}
                    >
                        Buy Credits
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
                {['upcoming', 'past'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            px-5 py-2 rounded-lg text-sm font-medium 
                            capitalize transition-all duration-150 
                            ${activeTab === tab 
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }
                        `}
                    >
                        {tab}
                        <span className={`
                                ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold
                                ${activeTab === tab
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-200 text-gray-500'
                                }
                            
                            `}>
                                {tab === 'upcoming' 
                                    ? upcomingAppointments.length
                                    : pastAppointments.length
                                }
                        </span>
                    </button>
                ))}
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex justify-center py-20">
                    <Spinner size='lg' />
                </div>
            )}

            {/* Error */}
            {!isLoading && error && (
                <div className="text-center py-20">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button variant='outline' onClick={fetchAppointments}>
                        Retry
                    </Button>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && displayList.length===0 && (
                <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-gray-400"
                            fill='none'
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No {activeTab} appointments
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                        {activeTab === 'upcoming'
                            ? 'You have no upcoming appointments. Book one now.'
                            : 'You have no past appointments yet.'
                        }
                    </p>
                    {activeTab === 'upcoming' && (
                        <Button onClick={() => navigate('/doctors')}>
                            Browse Doctors
                        </Button>
                    )}
                </div>
            )}


            {/* Appointments list */}
            {!isLoading && !error && displayList.length>0 && (
                <div className="flex flex-col gap-4">
                    {displayList.map((appointment) => (
                        <AppointmentCard 
                            key={appointment._id}
                            appointment={appointment}
                            onCancel={() => handleOpenCancel(appointment)}
                            onJoinCall={() => navigate(`/video/${appointment._id}`)}
                        />
                    ))}
                </div>
            )}

            {/* Cancel Modal */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title='Cancel Appointment'
                size='sm'
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to cancel this appointment?
                    </p>

                    {selectedAppointment && (
                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Doctor</span>
                                <span className="font-medium text-gray-900">
                                    Dr. {selectedAppointment.doctor?.user?.name || 'Unknown'}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium text-gray-900">
                                    {formatDate(selectedAppointment.date)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Time</span>
                                <span className="font-medium text-gray-900">
                                    {selectedAppointment.startTime}
                                </span>
                            </div>
                        </div>
                    )}

                    {(() => {
                        if(!selectedAppointment) return

                        const apptStart = new Date(`${selectedAppointment.date}T${selectedAppointment.startTime}:00`)
                        const hoursUntil = (apptStart.getTime() - new Date().getTime()) / (1000 * 60 * 60)

                        return hoursUntil >= 24 ? (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-xs text-green-700">
                                    1 credit will be refunded to your account.
                                </p>
                            </div>
                        ) : (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-700">
                                    No refund - cancelling less than 24 hours before appointment.
                                </p>
                            </div>
                        )
                    })()}

                    {cancelError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{cancelError}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowCancelModal(false)}
                            disabled={isCancelling}
                        >
                            Keep it
                        </Button>
                        <Button
                            variant="danger"
                            className="flex-1"
                            isLoading={isCancelling}
                            onClick={handleConfirmCancel}
                        >
                            Yes, Cancel
                        </Button>
                    </div>
                </div>
            </Modal>


            {/* Plans Modal */}
            <Modal
                isOpen={showPlansModal}
                onClose={() => setShowPlansModal(false)}
                title='Buy Credits'
                size='lg'
            >
                <div className="flex flex-col gap-4">
                    
                    <p className="text-sm text-gray-500">
                        Purchase a plan to get credits for booking appointments.
                        Each appointment costs 1 credit.
                    </p>

                    {purchaseError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{purchaseError}</p>
                        </div>
                    )}

                    {isLoadingPlans && (
                        <div className="flex justify-center py-8">
                            <Spinner size='md' />
                        </div>
                    )}

                    {!isLoadingPlans && plans.length===0 && (
                        <p className="text-center text-gray-400 py-8 text-sm">
                            No plans available at the moment.
                        </p>
                    )}

                    {!isLoadingPlans && plans.length>0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {plans.map((plan) => (
                                <div
                                    key={plan._id}
                                    className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:border-blue-300 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {plan.name}
                                            </h3>
                                            {plan.description && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {plan.description}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-lg font-bold text-blue-700">
                                            ₹{plan.price}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                        <svg
                                            className="w-4 h-4 text-blue-500"
                                            fill='currentColor'
                                            viewBox="0 0 20 20"
                                        >
                                            <path 
                                                fillRule="evenodd"
                                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="text-sm font-semibold text-blue-700">
                                            {plan.credits} appointment credits
                                        </span>
                                    </div>

                                    <Button
                                        size='sm'
                                        className="w-full"
                                        isLoading={isPurchasingPlanId === plan._id}
                                        onClick={() => handlePurchase(plan._id)}
                                    >
                                        Purchase Plan
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        variant="secondary"
                        className="w-full mt-2"
                        onClick={() => setShowPlansModal(false)}
                    >
                        Close
                    </Button>

                </div>
            </Modal>

        </div>
    )
}


// Appointment Card sub-component
const AppointmentCard = ({ appointment, onCancel, onJoinCall }) => {
    const now = new Date()
    const apptDateTime = new Date(`${appointment.date}T${appointment.startTime}:00`)
    const appointmentEnd = new Date(`${appointment.date}T${appointment.endTime}:00`)

    // allow joining 10 min before start time
    const tenMinBefore = new Date(apptDateTime.getTime() - 10 * 60 * 1000)
    const canJoin = now >= tenMinBefore && 
                    now <= appointmentEnd && 
                    appointment.status !== 'cancelled' && 
                    appointment.status !== 'completed'

    const canCancel = (appointment.status === 'pending' || appointment.status === 'confirmed') && 
        now < apptDateTime

    
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                {/* Left: doctor + time info */}
                <div className="flex items-start gap-4">

                    {/* Avatar */}
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-700 font-bold text-lg">
                            {appointment.doctor?.user?.name?.charAt(0).toUpperCase() || 'D'}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-1">
                        <h3 className="font-semibold text-gray-900">
                            Dr. {appointment.doctor?.user?.name || 'Unknown Doctor'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {appointment.doctor?.specialization || ''}
                        </p>

                        {/* Date + time row */}
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                            <div className="flex items-center gap-1.5">
                                <svg
                                    className="w-3.5 h-3.5 text-gray-400"
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                    />
                                </svg>
                                <span className="text-xs text-gray-600">
                                    {formatDate(appointment.date)}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <svg
                                    className="w-3.5 h-3.5 text-gray-400"
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                    />
                                </svg>
                                <span className="text-xs text-gray-600">
                                    {appointment.startTime} - {appointment.endTime}
                                </span>
                            </div>
                        </div>

                        {/* Reason for visit */}
                        {appointment.reasonForVisit && (
                            <p className="text-xs text-gray-400 mt-1 italic">
                                "{appointment.reasonForVisit}"
                            </p>
                        )}

                        {/* Doctor notes (after completion) */}
                        {appointment.status==='completed' && appointment.notes && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-xs font-medium text-green-700 mb-1">
                                    Doctor's Notes: 
                                </p>
                                <p className="text-xs text-green-600">
                                    {appointment.notes}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: status + actions */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                    
                    {/* Status badge */}
                    <Badge
                        variant = {statusVariant(appointment.status)}
                    >
                        {appointment.status?.charAt(0).toUpperCase() + 
                            appointment.status.slice(1)}
                    </Badge>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                        
                        {/* Join video call button */}
                        {canJoin && (
                            <Button
                                size='sm'
                                onClick={onJoinCall}
                                className="w-full sm:w-auto"
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d='M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                                    />
                                </svg>
                                Join Call
                            </Button>
                        )}

                        {/* Cancel button */}
                        {canCancel && (
                            <Button
                                size='sm'
                                variant='danger'
                                onClick={onCancel}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}   

export default MyAppointments