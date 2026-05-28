import { useState, useEffect } from "react"
import { getDoctorAppointments } from "../../services/appointmentService.js"
import { createWithdrawalRequest, getMyWithdrawalRequests } from '../../services/withdrawalService.js'
import { getMyDoctorProfile } from "../../services/doctorService.js"
import Badge from "../../components/ui/Badge.jsx"
import Button from "../../components/ui/Button.jsx"
import Modal from "../../components/ui/Modal.jsx"
import Spinner from "../../components/ui/Spinner.jsx"
import Input from '../../components/ui/Input.jsx'


// Withdrawal status badge variant
const withdrawalVariant = (status) => {
    const map = {
        pending: 'warning',
        approved: 'primary',
        paid: 'success',
        rejected: 'danger'
    }

    return map[status] || 'default'
}

const DoctorEarnings = () => {
    const [profile, setProfile] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [withdrawals, setWithdrawals] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // withdrawal modal
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
    const [withdrawAmount, setWithdrawAmount] = useState('')
    const [isWithdrawing, setIsWithdrawing] = useState(false)
    const [withdrawError, setWithdrawError] = useState('')
    const [withdrawSuccess, setWithdrawSuccess] = useState('')

    // Fetch all data
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)

            try {
                
                const [profileData, apptData, withdrawData] = await Promise.all([
                    getMyDoctorProfile(),
                    getDoctorAppointments(),
                    getMyWithdrawalRequests()
                ])

                setProfile(profileData)
                setAppointments(apptData)
                setWithdrawals(withdrawData)

            } catch {
                // show empty state
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])


    // Compute earnings
    const completedAppointments = appointments.filter(
        (a) => a.status === 'completed'
    )

    const totalEarned = completedAppointments.length * (profile?.consultationFee || 0)

    const totalWithdrawn = withdrawals
        .filter((w) => w.status === 'paid')
        .reduce((sum, w) => sum + w.amount, 0)

    const pendingWithdrawals = withdrawals
        .filter((w) => w.status === 'pending' || w.status === 'approved')
        .reduce((sum, w) => sum + w.amount, 0)

    const availableBalance = totalEarned - totalWithdrawn - pendingWithdrawals

    // Open withdraw modal
    const handleOpenWithdraw = () => {
        setWithdrawAmount('')
        setWithdrawError('')
        setWithdrawSuccess('')
        setShowWithdrawalModal(true)
    }

    // Submit withdrawal
    const handleWithdraw = async () => {
        setWithdrawError('')
        setWithdrawSuccess('')

        const amount = Number(withdrawAmount)

        if(!withdrawAmount || isNaN(amount) || amount<=0) {
            setWithdrawError('Please enter a valid amount.')
            return
        }

        if(amount > availableBalance) {
            setWithdrawError(`Amount exceeds available balance of ₹${availableBalance}.`)
            return
        }

        setIsWithdrawing(true)

        try {
            
            const data = await createWithdrawalRequest(amount)
            setWithdrawals((prev) => [data.request, ...prev])

            setWithdrawSuccess(`Withdrawal request of ₹${amount} submitted successfully.`)
            setWithdrawAmount('')

            setTimeout(() => {
                setShowWithdrawalModal(false)
                setWithdrawSuccess('')
            }, 2000)

        } catch (error) {
            const message = error?.response?.data?.message || 'Withdrawal request failed. Please try again.'
            setWithdrawError(message)
        } finally {
            setIsWithdrawing(false)
        }
    }


    if(isLoading) return <Spinner fullScreen />

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                        Earnings
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Track your income and manage withdrawals.
                    </p>
                </div>
                <Button onClick={handleOpenWithdraw}>
                    Request Withdrawal
                </Button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    {
                        label: 'Total Earned',
                        value: `₹${totalEarned}`,
                        sub: `${completedAppointments.length} completed sessions`,
                        color: 'green'
                    },
                    {
                        label: 'Available Balance',
                        value: `₹${availableBalance}`,
                        sub: 'Ready to withdraw',
                        color: 'blue'
                    },
                    {
                        label: 'Pending Withdrawal',
                        value: `₹${pendingWithdrawals}`,
                        sub: 'Under processing',
                        color: 'yellow'
                    },
                    {
                        label: 'Total Withdrawn',
                        value: `₹${totalWithdrawn}`,
                        sub: 'Successfully paid out',
                        color: 'purple'
                    }
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
                    >
                        <p className={`
                            text-2xl font-bold mb-1 
                            ${stat.color === 'green' ? 'text-green-600' : 
                                stat.color === 'blue' ? 'text-blue-600' : 
                                stat.color === 'yellow' ? 'text-yellow-600' : 
                                'text-purple-600'
                            }
                        `}>
                            {stat.value}
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                            {stat.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {stat.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* Consultation fee note */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-8">
                <svg
                    className="w-5 h-5 text-blue-500 shrink-0"
                    fill='currentColor'
                    viewBox="0 0 20 20"
                >
                    <path 
                        fillRule="evenodd"
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 
                            1 0 11-2 0 1 1 0 012 0zM9 
                            9a1 1 0 000 2v3a1 1 0 
                            001 1h1a1 1 0 100-2v-3a1 
                            1 0 00-1-1H9z'
                        clipRule="evenodd"
                    />
                </svg>
                <p className="text-sm text-blue-700">
                    Your consultation fee is{' '}
                    <span className="font-bold">₹{profile?.consultationFee || 0}</span>{' '}
                    per session. Earnings are calculated from completed appointments only.
                </p>
            </div>

            {/* Completed appointments list */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">
                    Completed Sessions
                </h2>

                {completedAppointments.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">
                            No completed sessions yet.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {completedAppointments.map((appt) => (
                            <div
                                key={appt._id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-green-700 font-bold text-sm">
                                            {appt.patient?.name?.charAt(0).toUpperCase() || 'P'}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {appt.patient?.name || 'Unknown Patient'}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {appt.date} · {appt.startTime}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-green-600">
                                    +₹{profile?.consultationFee || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Withdrawal history */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">
                    Withdrawal History
                </h2>

                {withdrawals.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">
                            No withdrawal request yet.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {withdrawals.map((w) => (
                            <div
                                key={w._id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                            >
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        ₹{w.amount}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Requested on{' '}
                                        {new Date(w.createdAt).toLocaleDateString('en-IN', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>

                                    {w.notes && (
                                        <p className="text-xs text-gray-400 italic">
                                            "{w.notes}"
                                        </p>
                                    )}
                                </div>

                                <Badge variant={withdrawalVariant(w.status)}>
                                    {w.status?.charAt(0).toUpperCase() + w.status.slice(1)}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Withdrawal modal */}
            <Modal
                isOpen={showWithdrawalModal}
                onClose={() => {
                    setShowWithdrawalModal(false)
                    setWithdrawAmount('')
                    setWithdrawError('')
                    setWithdrawSuccess('')
                }}
                title='Request Withdrawal'
                size="sm"
            >
                <div className="flex flex-col gap-4">

                    {/* Balance summary */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-xs text-blue-600 font-medium mb-1">
                            Available Balance
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                            ₹{availableBalance}
                        </p>
                    </div>

                    {/* Amount input */}
                    <Input
                        label="Amount to withdraw (₹)"
                        type="number"
                        placeholder={`Max ₹${availableBalance}`}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}

                    />

                    {/* Success */}
                    {withdrawSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700">{withdrawSuccess}</p>
                        </div>
                    )}

                    {/* Error */}
                    {withdrawError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{withdrawError}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowWithdrawalModal(false)}
                            disabled={isWithdrawing}                            
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            isLoading={isWithdrawing}                            
                            onClick={handleWithdraw}
                        >
                            Submit Request
                        </Button>
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                        Withdrawal requests are reviewed by admin within 24-48 hours.
                    </p>

                </div>
            </Modal>

        </div>
    )
}

export default DoctorEarnings