import { useState, useEffect } from "react"
import { getPendingDoctors, approveDoctor } from "../../services/adminService.js"
import Badge from "../../components/ui/Badge.jsx"
import Button from "../../components/ui/Button.jsx"
import Modal from '../../components/ui/Modal.jsx'
import Spinner from "../../components/ui/Spinner.jsx"


const DoctorsApproval = () => {
    const [doctors, setDoctors] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    // approve modal
    const [showModal, setShowModal] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [isApproving, setIsApproving] = useState(false)
    const [approveError, setApproveError] = useState('')

    useEffect(() => {
        fetchDoctors()
    }, [])

    const fetchDoctors = async () => {
        setIsLoading(true)
        setError('')

        try {
            
            const data = await getPendingDoctors()
            setDoctors(data)

        } catch {
            setError('Failed to load pending doctors.')
        } finally {
            setIsLoading(false)
        }
    }

    // Open approve modal
    const handleOpenApprove = (doctor) => {
        setSelectedDoctor(doctor)
        setApproveError('')
        setShowModal(true)
    }

    // Confirm approval
    const handleConfirmApprove = async () => {
        if(!selectedDoctor) return

        setIsApproving(true)
        setApproveError('')

        try {
            
            await approveDoctor(selectedDoctor._id)

            // remove from pending list
            setDoctors((prev) => 
                prev.filter((d) => d._id !== selectedDoctor._id)
            )

            setShowModal(false)
            setSelectedDoctor(null)

        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to approve doctor. Please try again.'
            setApproveError(message)
        } finally {
            setIsApproving(false)
        }
    }

    if(isLoading) return <Spinner fullScreen />

    
    // render
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Doctor Approvals
                </h1>
                <p className="text-gray-500 text-sm">
                    Review and approve pending doctor applications.
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="text-center py-20">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button 
                        variant="outline"
                        onClick={fetchDoctors}
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Empty state */}
            {!error && doctors.length===0 && (
                <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-green-500"
                            fill='none'
                            stroke='currentColor'
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        All caught up!
                    </h3>
                    <p className="text-gray-500 text-sm">
                        No pending doctor approvals at the moment.
                    </p>
                </div>
            )}

            {/* Doctor cards */}
            {!error && doctors.length>0 && (
                <div className="flex flex-col gap-4">
                    {doctors.map((doctor) => (
                        <div
                            key={doctor._id}
                            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                                {/* Doctor info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-yellow-700 font-bold text-xl">
                                            {doctor.user?.name?.charAt(0).toUpperCase() || 'D'}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                Dr. {doctor.user?.name}
                                            </h3>

                                            <Badge variant="warning">Pending</Badge>
                                        </div>

                                        <p className="text-sm text-gray-500">
                                            {doctor.user?.email}
                                        </p>

                                        <Badge variant="primary" className="w-fit mt-1">
                                            {doctor.specialization}
                                        </Badge>

                                        {/* Profile details */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {doctor.experienceYears}
                                                </p>
                                                <p className="text-xs text-gray-500">Yrs exp.</p>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                                                <p className="text-sm font-bold text-gray-900">
                                                    ₹{doctor.consultationFee}
                                                </p>
                                                <p className="text-xs text-gray-500">Fee</p>
                                            </div>
                                            
                                            <div className="bg-gray-50 rounded-lg p-2 text-center col-span-2 sm:col-span-1">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {doctor.clinicName || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">Clinic Name</p>
                                            </div> 
                                        </div>

                                        {/* Bio */}
                                        {doctor.about && (
                                            <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">
                                                {doctor.about}
                                            </p>
                                        )}

                                        {/* Clinic address */}
                                        {doctor.clinicAddress && (
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <svg
                                                    className="w-3.5 h-3.5 text-gray-400 shrink-0"
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
                                                <span className="text-xs text-gray-500">
                                                    {doctor.clinicAddress}
                                                </span>
                                            </div>
                                        )}

                                        {/* Applied date */}
                                        <p className="text-xs text-gray-400 mt-2">
                                            Applied on{' '}
                                            {new Date(doctor.createdAt).toLocaleDateString('en-IN', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Approve button */}
                                <div className="shrink-0">
                                    <Button
                                        size='sm'
                                        onClick={() => handleOpenApprove(doctor)}
                                        className="w-full sm:w-auto"
                                    >
                                        Approve Doctor
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* Approve modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title='Approve Doctor'
                size='sm'
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-600">
                        Are you sure you want to approve this doctor?
                        They will be visible to patients and can start 
                        accepting appointments.
                    </p>

                    {selectedDoctor && (
                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Name</span>
                                <span className="font-medium text-gray-900">
                                    Dr. {selectedDoctor.user?.name}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Specialization</span>
                                <span className="font-medium text-gray-900">
                                    {selectedDoctor.specialization}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Experience</span>
                                <span className="font-medium text-gray-900">
                                    {selectedDoctor.experienceYears} years
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Fee</span>
                                <span className="font-medium text-gray-900">
                                    ₹{selectedDoctor.consultationFee}
                                </span>
                            </div>
                        </div>
                    )}

                    {approveError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{approveError}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowModal(false)}
                            disabled={isApproving}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="flex-1"
                            isLoading={isApproving}
                            onClick={handleConfirmApprove}
                        >
                            Yes, Approve
                        </Button>
                    </div>
                </div>
            </Modal>
            
        </div>
    )
}

export default DoctorsApproval