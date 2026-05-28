import { useState, useEffect } from "react"
import { getWithdrawalRequests, processWithdrawal } from "../../services/adminService.js"
import Badge from "../../components/ui/Badge.jsx"
import Button from "../../components/ui/Button.jsx"
import Modal from "../../components/ui/Modal.jsx"
import Spinner from "../../components/ui/Spinner.jsx"


// Status badge variant
const withdrawalVariant = (status) => {
    const map = {
        pending: 'warning',
        approved: 'primary',
        paid: 'success',
        rejected: 'danger'
    }

    return map[status] || 'default'
}

const Withdrawals = () => {
    const [withdrawals, setWithdrawals] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('pending')

    // Process modal
    const [showModal, setShowModal] = useState(false)
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
    const [processStatus, setProcessStatus] = useState('approved')
    const [processNotes, setProcessNotes] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [processError, setProcessError] = useState('')

    useEffect(() => {
        fetchWithdrawals()
    }, [])

    const fetchWithdrawals = async () => {
        setIsLoading(true)
        setError('')

        try {
            
            const data = await getWithdrawalRequests()
            setWithdrawals(data)

        } catch {
            setError('Failed to load withdrawal requests.')            
        } finally {
            setIsLoading(false)
        }
    }

    // Open process modal
    const handleOpenProcess = (withdrawal) => {
        setSelectedWithdrawal(withdrawal)
        setProcessStatus(withdrawal.status === 'approved' ? 'paid' : 'approved')
        setProcessNotes('')
        setProcessError('')
        setShowModal(true)
    }

    // Confirm process
    const handleConfirmProcess = async () => {
        if(!selectedWithdrawal) return

        setIsProcessing(true)
        setProcessError('')

        try {
            
            await processWithdrawal(selectedWithdrawal._id, {
                status: processStatus,
                notes: processNotes
            })

            setWithdrawals((prev) => 
                prev.map((w) => 
                    w._id === selectedWithdrawal._id
                        ? { ...w, status: processStatus, notes: processNotes}
                        : w
                )
            )

            setShowModal(false)
            setSelectedWithdrawal(null)

        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to process withdrawal. Please try again.'
            setProcessError(message)
        } finally {
            setIsProcessing(false)
        }
    }


    // Filter by tab
    const pendingList = withdrawals.filter(
        (w) => w.status === 'pending' || w.status === 'approved'
    )

    const processedList = withdrawals.filter(
        (w) => w.status === 'paid' || w.status === 'rejected'
    )

    const displayList = activeTab === 'pending' ? pendingList : processedList


    if(isLoading) return <Spinner fullScreen />

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Withdrawal Requests
                </h1>
                <p className="text-gray-500 text-sm">
                    Review and process doctor payout requests.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
                {['pending', 'processed'].map((tab) => (
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
                            {tab === 'pending'
                                ? pendingList.length
                                : processedList.length
                            }
                        </span>
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="text-center py-20">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button variant="outline" onClick={fetchWithdrawals}>
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
                        No {activeTab} withdrawal requests.
                    </p>
                </div>
            )}

            {/* Withdrawal cards */}
            {!error && displayList.length>0 && (
                <div className="flex flex-col gap-4">
                    {displayList.map((w) => (
                        <div
                            key={w._id}
                            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                                {/* Doctor info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-blue-700 font-bold text-lg">
                                            {w.doctor?.user?.name?.charAt(0).toUpperCase() || 'D'}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-semibold text-gray-900">
                                            Dr. {w.doctor?.user?.name || 'Unknown Doctor'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {w.doctor?.user?.email}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {w.doctor?.specialization}
                                        </p>

                                        {/* Amount */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xl font-bold text-gray-900">
                                                ₹{w.amount}
                                            </span>

                                            <Badge variant={withdrawalVariant(w.status)}>
                                                {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                                            </Badge>
                                        </div>

                                        {/* Dates */}
                                        <p className="text-xs text-gray-400 mt-1">
                                            Requested on{' '}
                                            {new Date(w.createdAt).toLocaleDateString('en-IN', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>

                                        {w.processedAt && (
                                            <p className="text-xs text-gray-400">
                                                Processed on{' '}
                                                {new Date(w.processedAt).toLocaleDateString('en-IN', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        )}


                                        {/* Admin notes */}
                                        {w.notes && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 italic">
                                                    "{w.notes}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Process button: only for pending */}
                                {(w.status === 'pending' || w.status === 'approved') && (
                                    <div className="shrink-0">
                                        <Button
                                            size='sm'
                                            onClick={() => handleOpenProcess(w)}
                                            className="w-full sm:w-auto"
                                        >
                                            Process Request
                                        </Button>
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Process modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title='Process Withdrawal'
                size="md"
            >
                <div className="flex flex-col gap-4">
                    
                    <p className="text-sm text-gray-600">
                        Update the status of this withdrawal request.
                    </p>

                    {/* Withdrawal summary */}
                    {selectedWithdrawal && (
                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Doctor</span>
                                <span className="font-medium text-gray-900">
                                    Dr. {selectedWithdrawal.doctor?.user?.name}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Amount</span>
                                <span className="font-medium text-gray-900">
                                    ₹{selectedWithdrawal.amount}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Requested</span>
                                <span className="font-medium text-gray-900">
                                    {new Date(selectedWithdrawal.createdAt).toLocaleDateString('en-IN', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Status selector */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                            Update Status
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(selectedWithdrawal?.status === 'pending' 
                                ? ['approved', 'rejected']
                                : ['paid']
                            ).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setProcessStatus(status)}
                                    className={`
                                        py-2 px-3 rounded-lg border text-sm font-medium 
                                        capitalize transition-all duration-150
                                        ${processStatus === status 
                                            ? status === 'rejected' 
                                                ? 'border-red-500 bg-red-50 text-red-700' 
                                                : status === 'paid' 
                                                    ? 'border-green-500 bg-gray-50 text-green-700' 
                                                    : 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }    
                                    `}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Admin notes */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Notes{' '}
                            <span className="text-gray-400 font-normal">(optional)</span>
                        </label>

                        <textarea 
                            rows={3}
                            placeholder="Add a note for the doctor..."
                            value={processNotes}
                            onChange={(e) => setProcessNotes(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 
                                rounded-lg bg-white text-gray-900 
                                placeholder:text-gray-400 resize-none 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                focus:border-transparent transition-colors"
                        />
                    </div>

                    {/* Error */}
                    {processError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{processError}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowModal(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="flex-1"
                            isLoading={isProcessing}
                            onClick={handleConfirmProcess}
                        >
                            Confirm
                        </Button>
                    </div>

                </div>
            </Modal>
            
        </div>
    )
}

export default Withdrawals