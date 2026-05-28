import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getDoctorAppointments, completeAppointment, confirmAppointment, markMissedAppointment } from "../../services/appointmentService.js"
import Badge from "../../components/ui/Badge.jsx"
import Button from "../../components/ui/Button.jsx"
import Modal from '../../components/ui/Modal.jsx'
import Spinner from "../../components/ui/Spinner.jsx"



const DoctorAppointments = () => {
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('upcoming')
    const [isConfirming, setIsConfirming] = useState(false)
    const [confirmError, setConfirmError] = useState('')
    const [markingMissedId, setMarkingMissedId] = useState(null)
    const [missedError, setMissedError] = useState('')

    // complete modal
    const [showCompleteModal, setShowCompleteModal] = useState(false)
    const [selectedAppt, setSelectedAppt] = useState(null)
    const [notes, setNotes] = useState('')
    const [isCompleting, setIsCompleting] = useState(false)
    const [completeError, setCompleteError] = useState('')

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        setIsLoading(true)
        setError('')

        try {
            
            const data = await getDoctorAppointments()
            setAppointments(data)

        } catch {
            setError('Failed to load appointments. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Open complete modal
    const handleOpenComplete = (appt) => {
        setSelectedAppt(appt)
        setNotes('')
        setCompleteError('')
        setShowCompleteModal(true)
    }

    // Handle confirm
    const handleConfirm = async (apptId) => {
        setIsConfirming(true)

        try {
            
            await confirmAppointment(apptId)
            setAppointments((prev) => 
                prev.map((a) => a._id === apptId ? { ...a, status: 'confirmed'} : a)
            )

        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to confirm.'
            setConfirmError(message)
            
        } finally {
            setIsConfirming(false)
        }
    }

    // Handle missed appointments
    const handleMarkMissed = async (apptId) => {
        setMarkingMissedId(apptId)
        setMissedError('')

        try {
            
            await markMissedAppointment(apptId)

            setAppointments((prev) =>
                prev.map((a) => a._id === apptId ? { ...a, status: 'missed' } : a)
            )

        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to mark as missed.'
            setMissedError(message)
        } finally {
            setMarkingMissedId(null)
        }
    }

    // Submit complete
    const handleConfirmComplete = async () => {
        if(!selectedAppt) return

        setIsCompleting(true)
        setCompleteError('')

        try {
            
            await completeAppointment(selectedAppt._id, notes)

            setAppointments((prev) => 
                prev.map((a) => 
                    a._id === selectedAppt._id 
                    ? { ...a, status: 'completed', notes }
                    : a
                )
            )

            setShowCompleteModal(false)
            setSelectedAppt(null)

        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to complete appointment.'
            setCompleteError(message)
        } finally {
            setIsCompleting(false)
        }
    }


    // Filter by tab
    const now = new Date()

    const upcomingList = appointments.filter((a) => {
        const dt = new Date(`${a.date}T${a.endTime}:00`)
        return (
            dt >= now && 
            a.status !== 'cancelled' && 
            a.status !== 'completed' && 
            a.status !== 'missed'
        )
    })

    const pastList = appointments.filter((a) => {
        const dt = new Date(`${a.date}T${a.endTime}:00`)
        return (
            dt < now || 
            a.status === 'cancelled' || 
            a.status === 'completed' || 
            a.status === 'missed'
        )
    })

    const displayList = activeTab === 'upcoming' ? upcomingList : pastList

    if(isLoading) return <Spinner fullScreen />


    // Render
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Appointments
                </h1>
                <p className="text-gray-500 text-sm">
                    Manage your patient consultations.
                </p>
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
                            {tab === 'upcoming' ? upcomingList.length : pastList.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="text-center py-20">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button variant='outline' onClick={fetchAppointments}>
                        Retry
                    </Button>
                </div>
            )}

            {/* Empty state */}
            {!error && displayList.length===0 && (
                <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 
                                    002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 
                                    002 2h2a2 2 0 002-2M9 5a2 2 0 
                                    012-2h2a2 2 0 012 2'
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No {activeTab} appointments
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {activeTab === 'upcoming'
                            ? 'No patients have booked appointment yet.' 
                            : 'No past appointments to show.'
                        }
                    </p>
                </div>
            )}

            {/* Appointment Cards */}
            {!error && displayList.length>0 && (
                <div className="flex flex-col gap-4">
                    {displayList.map((appt) => {
                        const apptDateTime = new Date(`${appt.date}T${appt.startTime}:00`)
                        const appointmentEnd = new Date(`${appt.date}T${appt.endTime}:00`)

                        const tenMinBefore = new Date(apptDateTime.getTime() - 10 * 60 * 1000)

                        const canJoin = now >= tenMinBefore &&  
                                        now <= appointmentEnd &&
                                        appt.status !== 'cancelled' && 
                                        appt.status !== 'completed'

                        const hasEnded = now > appointmentEnd

                        const canConfirm = appt.status === 'pending' && !hasEnded
                            
                        const canComplete = appt.status === 'confirmed'

                        const canMiss = (appt.status === 'pending' || appt.status === 'confirmed') && hasEnded

                        return (
                            <div
                                key={appt._id}
                                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                                    {/* Patient info */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                            <span className="text-green-700 font-bold text-lg">
                                                {appt.patient?.name?.charAt(0).toUpperCase() || 'P'}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {appt.patient?.name || 'Unknown Patient'}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {appt.patient?.email}
                                            </p>

                                            {/* Date + time */}
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
                                                        {new Date(appt.date).toLocaleDateString('en-IN', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <svg
                                                        className="w-3.5 h-3.5 text-gray-400"
                                                        fill='none'
                                                        stroke="currentColor"
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
                                                        {appt.startTime} - {appt.endTime}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Reason for visit */}
                                            {appt.reasonForVisit && (
                                                <p className="text-xs text-gray-400 mt-1 italic">
                                                    "{appt.reasonForVisit}"
                                                </p>
                                            )}

                                            {/* Notes (after completion) */}
                                            {appt.status==='completed' && appt.notes && (
                                                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <p className="text-xs font-medium text-green-700 mb-1">
                                                        Your Notes: 
                                                    </p>
                                                    <p className="text-xs text-green-600">
                                                        {appt.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    {/* Status + actions */}
                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <Badge
                                            variant = {
                                                appt.status === 'pending' ? 'warning' : 
                                                appt.status === 'confirmed' ? 'primary' : 
                                                appt.status === 'completed' ? 'success' : 
                                                appt.status === 'missed' ? 'danger' : 
                                                'danger'
                                            }
                                        >
                                            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                                        </Badge>

                                        <div className="flex flex-col gap-2 w-full sm:w-auto">

                                            {/* Join call */}
                                            {canJoin && (
                                                <Button
                                                    size='sm'
                                                    onClick={() => navigate(`/video/${appt._id}`)}
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


                                            {/* Confirm */}
                                            {canConfirm && (
                                                <Button
                                                    size='sm'
                                                    variant="outline"
                                                    onClick={() => handleConfirm(appt._id)}
                                                    isLoading={isConfirming}
                                                    className="w-full sm:w-auto border-green-300 text-green-700 hover:bg-green-50"
                                                >
                                                    Confirm
                                                </Button>
                                            )}


                                            {/* Complete */}
                                            {canComplete && (
                                                <Button
                                                    size='sm'
                                                    variant="outline"
                                                    onClick={() => handleOpenComplete(appt)}
                                                    className="w-full sm:w-auto"
                                                >
                                                    Mark Complete
                                                </Button>
                                            )}

                                            {/* Missed */}
                                            {canMiss && (
                                                <Button
                                                    size='sm'
                                                    variant="outline"
                                                    onClick={() => handleMarkMissed(appt._id)}
                                                    isLoading={markingMissedId === appt._id}
                                                    className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50"
                                                >
                                                    Mark Missed
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}


            {/* Complete Modal */}
            <Modal
                isOpen={showCompleteModal}
                onClose={() => setShowCompleteModal(false)}
                title='Complete Appointment'
                size='md'
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-600">
                        Mark this appointment as completed and add your clinical notes.
                    </p>

                    {/* Appointment summary */}
                    {selectedAppt && (
                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Patient</span>
                                <span className="font-medium text-gray-900">
                                    {selectedAppt.patient?.name || 'Unknown'}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Date</span>
                                <span className="font-medium text-gray-900">
                                    {selectedAppt.date}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Time</span>
                                <span className="font-medium text-gray-900">
                                    {selectedAppt.startTime} - {selectedAppt.endTime}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Notes textarea */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Clinical Notes{' '}
                            <span className="text-gray-400 font-normal">(optional)</span>
                        </label>

                        <textarea 
                            rows={4}
                            placeholder="Add diagnosis, prescription, follow-up instructions"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 
                                        rounded-lg bg-white text-gray-900 
                                        placeholder:text-gray-400 resize-none 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                                        focus:border-transparent transition-colors"
                        />
                    </div>

                    {/* Error */}
                    {confirmError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{confirmError}</p>
                        </div>
                    )}

                    {missedError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{missedError}</p>
                        </div>
                    )}
                    
                    {completeError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{completeError}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowCompleteModal(false)}
                            disabled={isCompleting}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="flex-1"
                            isLoading={isCompleting}
                            onClick={handleConfirmComplete}
                        >
                            Mark as Completed
                        </Button>
                    </div>

                </div>
            </Modal>

        </div>
    )
}

export default DoctorAppointments