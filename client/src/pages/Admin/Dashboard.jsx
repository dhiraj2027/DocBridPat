import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import { getPendingDoctors, getWithdrawalRequests } from '../../services/adminService.js'
import Spinner from '../../components/ui/Spinner.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'


const AdminDashboard = () => {
    const navigate = useNavigate()

    const [pendingDoctors, setPendingDoctors] = useState([])
    const [withdrawals, setWithdrawals] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)

            try {
                
                const [doctorsData, withdrawalsData] = await Promise.all([
                    getPendingDoctors(), 
                    getWithdrawalRequests('pending')
                ])

                setPendingDoctors(doctorsData)
                setWithdrawals(withdrawalsData)

            } catch {
                // show empty state
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    if(isLoading) return <Spinner fullScreen />

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Admin Dashboard
                </h1>
                <p className="text-gray-500 text-sm">
                    Manage doctors, withdrawals and platform activity.
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-yellow-600"
                                fill='none'
                                stroke='currentColor'
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                />
                            </svg>
                        </div>

                        {pendingDoctors.length>0 && (
                            <span className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {pendingDoctors.length}
                            </span>
                        )}
                    </div>

                    <p className="text-3xl font-bold text-gray-900 mb-1">
                        {pendingDoctors.length}
                    </p>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                        Pending Doctor Approvals
                    </p>

                    <Button
                        size='sm'
                        className="w-full"
                        onClick={() => navigate('/admin/doctors')}
                    >
                        Review Doctors
                    </Button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill='none'
                                stroke='currentColor'
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 
                                        3 .895 3 2-1.343 2-3 2m0-8c1.11 
                                        0 2.08.402 2.599 1M12 8V7m0 
                                        1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 
                                        12a9 9 0 11-18 0 9 9 0 0118 0z'
                                />
                            </svg>
                        </div>

                        {withdrawals.length>0 && (
                            <span className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {withdrawals.length}
                            </span>
                        )}
                    </div>

                    <p className="text-3xl font-bold text-gray-900 mb-1">
                        {withdrawals.length}
                    </p>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                        Pending Withdrawal Requests
                    </p>

                    <Button
                        size='sm'
                        className="w-full"
                        onClick={() => navigate('/admin/withdrawals')}
                    >
                        Review Withdrawals
                    </Button>
                </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/doctors')}
                    className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all text-left"
                >
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
                        <svg
                            className="w-5 h-5 text-yellow-600"
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

                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            Doctor Approvals
                        </p>
                        <p className="text-xs text-gray-500">
                            Review and approve pending doctor profiles
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/admin/withdrawals')}
                    className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all text-left"
                >
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                        <svg
                            className="w-5 h-5 text-green-600"
                            fill='none'
                            stroke='currentColor'
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M17 9V7a2 2 0 00-2-2H5a2 2 0 
                                    00-2 2v6a2 2 0 002 2h2m2 
                                    4h10a2 2 0 002-2v-6a2 2 0 
                                    00-2-2H9a2 2 0 00-2 2v6a2 
                                    2 0 002 2zm7-5a2 2 0 11-4 
                                    0 2 2 0 014 0z'
                            />
                        </svg>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            Withdrawal Requests
                        </p>
                        <p className="text-xs text-gray-500">
                            Process doctor payout requests
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/admin/plans')}
                    className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all text-left"
                >
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                        <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M12 8c-1.657 0-3 .895-3 2s1.343 
                                    2 3 2 3 .895 3 2-1.343 
                                    2-3 2m0-8c1.11 0 2.08.402 
                                    2.599 1M12 8V7m0 1v8m0 
                                    0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 
                                    12a9 9 0 11-18 0 9 9 
                                    0 0118 0z'
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            Subscription Plans
                        </p>
                        <p className="text-xs text-gray-500">
                            Create and manage patient plans
                        </p>
                    </div>
                </button>
            </div>

            {/* Recent pending doctors */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Recent Pending Doctors
                    </h2>

                    <Button
                        variant="ghost"
                        size='sm'
                        onClick={() => navigate('/admin/doctors')}
                    >
                        View all
                    </Button>
                </div>

                {pendingDoctors.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 ">
                            No pending doctor approvals.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {pendingDoctors.slice(0, 3).map((doctor) => (
                            <div
                                key={doctor._id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-yellow-700 font-bold text-sm">
                                            {doctor.user?.name?.charAt(0).toUpperCase() || 'D'}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            Dr. {doctor.user?.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {doctor.specialization}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="warning">Pending</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent pending withdrawals */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Recent Pending Withdrawals
                    </h2>

                    <Button
                        variant="ghost"
                        size='sm'
                        onClick={() => navigate('/admin/withdrawals')}
                    >
                        View all
                    </Button>
                </div>

                {withdrawals.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">
                            No pending withdrawal requests.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {withdrawals.slice(0, 3).map((w) => (
                            <div
                                key={w._id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-blue-700 font-bold text-sm">
                                            {w.doctor?.user?.name?.charAt(0).toUpperCase() || 'D'}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            Dr. {w.doctor?.user?.name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Requested ₹{w.amount}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="warning">Pending</Badge>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
        </div>
    )
}

export default AdminDashboard