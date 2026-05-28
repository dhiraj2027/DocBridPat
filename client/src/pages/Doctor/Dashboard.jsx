import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import { getMyDoctorProfile } from '../../services/doctorService.js'
import { getDoctorAppointments } from '../../services/appointmentService.js'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'

const DoctorDashboard = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [profile, setProfile] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)

            try {
                
                const [profileData, apptData] = await Promise.all([getMyDoctorProfile(), getDoctorAppointments()])
                setProfile(profileData)
                setAppointments(apptData)

            } catch {
                // handle silently; show empty state
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    // Compute Stats
    const totalAppointments = appointments.length

    const completedAppointments = appointments.filter(
        (a) => a.status === 'completed'
    ).length

    const pendingAppointments = appointments.filter(
        (a) => a.status === 'pending' || a.status === 'confirmed'
    ).length

    const totalEarnings = appointments
        .filter((a) => a.status === 'completed')
        .reduce((sum, a) => sum + (profile?.consultationFee || 0), 0)

    // Upcoming appointments (next 3)
    const now = new Date()
    const upcoming = appointments
        .filter((a) => {
            const dt = new Date(`${a.date}T${a.startTime}:00`)
            return dt >= now && a.status !== 'cancelled'
        })
        .sort((a, b) => {
            new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`)
        })
        .slice(0, 3)


    if(isLoading) return <Spinner fullScreen />


    // Render
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Welcome back, Dr. {user?.name}
                </h1>
                <p className="text-gray-500 text-sm">
                    Here's an overview of your practice.
                </p>
            </div>

            {/* Pending approval banner */}
            {profile && !profile.isApproved && (
                <div className="mb-6 p-4 bg-yellow-200 border border-yellow-400 rounded-2xl flex items-start gap-3">
                    <svg
                        className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0"
                        fill='currentColor'
                        viewBox="0 0 20 20"
                    >
                        <path 
                            fillRule="evenodd"
                            d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                            clipRule="evenodd"
                        />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-yellow-800">
                            Profile Under Review
                        </p>
                        <p className="text-xs text-yellow-700 mt-0.5">
                            Your doctor profile is pending admin approval.
                            You will be able to accept appointments once approved.
                        </p>
                    </div>
                </div>
            )}

            {/* No profile banner */}
            {!profile && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                    <svg
                        className="w-5 h-5 text-blue-500 mt-0.5 shrink-0"
                        fill='currentColor'
                        viewBox="0 0 20 20"
                    >
                        <path 
                            fillRule="evenodd"
                            d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                            clipRule="evenodd"
                        />
                    </svg>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-800">
                            Complete Your Profile
                        </p>
                        <p className="text-xs text-blue-700 mt-0.5">
                            You have not submitted your doctor profile yet.
                        </p>
                    </div>

                    <Button
                        size='sm'
                        onClick={() => navigate('/onboarding')}
                    >
                        Complete Now
                    </Button>
                </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    {
                        label: 'Total Appointments',
                        value: totalAppointments,
                        color: 'blue',
                        icon: (
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                            />
                        )
                    },
                    {
                        label: 'Completed',
                        value: completedAppointments,
                        color: 'green',
                        icon: (
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                        )
                    },
                    {
                        label: 'Pending',
                        value: pendingAppointments,
                        color: 'yellow',
                        icon: (
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                        )
                    },
                    {
                        label: 'Total Earnings',
                        value: `₹${totalEarnings}`,
                        color: 'purple',
                        icon: (
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 
                                    2-1.343 2-3 2m0-8c1.11 0 2.08.402 
                                    2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 
                                    0-2.08-.402-2.599-1M21 12a9 9 0 
                                    11-18 0 9 9 0 0118 0z'
                            />
                        )
                    }
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
                    >
                        <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center mb-3 
                            ${stat.color === 'blue' ? 'bg-blue-100' : 
                                stat.color === 'green' ? 'bg-green-100' : 
                                stat.color === 'yellow' ? 'bg-yellow-100' : 
                                'bg-purple-100'
                            }
                        `}>
                            <svg
                                className={`
                                    w-5 h-5 
                                    ${stat.color === 'blue' ? 'text-blue-600' : 
                                        stat.color === 'green' ? 'text-green-600' : 
                                        stat.color === 'yellow' ? 'text-yellow-600' :
                                        'text-purple-600'
                                    }
                                `}
                                fill='none'
                                stroke='currentColor'
                                viewBox="0 0 24 24"
                            >
                                {stat.icon}
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <button
                    onClick={() => navigate('/doctor/availability')}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all text-left"
                >
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <svg
                            className="w-5 h-5 text-blue-600"
                            fill='none'
                            stroke='currentColor'
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Set Availability</p>
                        <p className="text-xs text-gray-500">Manage your time slots</p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/doctor/appointments')}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all text-left"
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
                                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 
                                    002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 
                                    002 2h2a2 2 0 002-2M9 5a2 2 0 
                                    012-2h2a2 2 0 012 2'
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">View Appointments</p>
                        <p className="text-xs text-gray-500">Manage patient bookings</p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/doctor/earnings')}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all text-left"
                >
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                        <svg
                            className="w-5 h-5 text-purple-600"
                            fill='none'
                            stroke='currentColor'
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 
                                    2-1.343 2-3 2m0-8c1.11 0 2.08.402 
                                    2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 
                                    0-2.08-.402-2.599-1M21 12a9 9 0 
                                    11-18 0 9 9 0 0118 0z'
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Earnings</p>
                        <p className="text-xs text-gray-500">View and withdraw earnings</p>
                    </div>
                </button>
            </div>

            {/* Upcoming appointments */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Upcoming Appointments
                    </h2>
                    <Button
                        variant="ghost"
                        size='sm'
                        onClick={() => navigate('/doctor/appointments')}
                    >
                        View All
                    </Button>
                </div>

                {upcoming.length===0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">
                            No upcoming appointments.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {upcoming.map((appt) => (
                            <div
                                key={appt._id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                        <span className="text-blue-700 font-bold text-sm">
                                            {appt.patient?.name?.charAt(0).toUpperCase() || 'P'}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {appt.patient?.name || 'Unknown patient'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {appt.date} · {appt.startTime} - {appt.endTime}
                                        </p>
                                    </div>
                                </div>

                                <Badge
                                    variant = {
                                        appt.status === 'pending' ? 'warning' : 
                                        appt.status === 'confirmed' ? 'primary' : 
                                        'default'
                                    }
                                >
                                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}

export default DoctorDashboard