import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

// Layout
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'

// Pages
import Home from '../pages/Home.jsx'
import NotFound from '../pages/NotFound.jsx'
import Login from '../pages/Auth/Login.jsx'
import Register from '../pages/Auth/Register.jsx'
import VerifyOTP from '../pages/Auth/VerifyOTP.jsx'
import Onboarding from '../pages/Onboarding/Onboarding.jsx'

// Patient pages
import DoctorsList from '../pages/Patient/DoctorsList.jsx'
import DoctorDetails from '../pages/Patient/DoctorDetails.jsx'
import MyAppointments from '../pages/Patient/MyAppointments.jsx'
import VideoCall from '../pages/Patient/VideoCall.jsx'

// Doctor pages
import DoctorDashboard from '../pages/Doctor/Dashboard.jsx'
import DoctorAvailability from '../pages/Doctor/Availability.jsx'
import DoctorAppointments from '../pages/Doctor/Appointments.jsx'
import DoctorEarnings from '../pages/Doctor/Earnings.jsx'

// Admin pages
import AdminDashboard from '../pages/Admin/Dashboard.jsx'
import DoctorsApproval from '../pages/Admin/DoctorsApproval.jsx'
import Withdrawals from '../pages/Admin/Withdrawals.jsx'
import AdminPlans from '../pages/Admin/Plans.jsx'

// Payment pages
import PaymentSuccess from '../pages/payment/PaymentSuccess.jsx'
import PaymentCancel from '../pages/payment/PaymentCancel.jsx'


// Spinner used in guards
const LoadingSpinner = () => (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin' />
    </div>
)


// Protected Route (must be logged in)
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth()

    if(isLoading) return <LoadingSpinner />

    if(!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}



// Role Route: must be logged in + correct role
const RoleRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuth()

    if(isLoading) return <LoadingSpinner />

    if(!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if(!allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />
    }

    return children
}



// Guest Route: only for non-logged-in users
const GuestRoute = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth()

    if(isLoading) return <LoadingSpinner />

    if(isAuthenticated) {
        if(user?.role === 'admin') return <Navigate to="/admin" replace />
        if(user?.role === 'doctor') {
            
            // Doctor not onboarded yet
            if(!user?.isOnboarded) {
                return <Navigate to='/onboarding' replace />
            }

            return <Navigate to="/doctor/dashboard" replace />
        }
        
        return <Navigate to="/doctors" replace />
    }

    return children
}

// OTP route
const OTPRoute = ({ children }) => {
    const { pendingUserId, isAuthenticated, isLoading } = useAuth()

    if(isLoading) return <LoadingSpinner />

    // Already logged in - no need for OTP
    if(isAuthenticated) {
        return <Navigate to="/" replace />
    }

    // No pending user - redirect to register
    if(!pendingUserId) return <Navigate to="/register" replace />

    return children
}


const AppContent = () => {
    const location = useLocation()

    const isVideoCall = location.pathname.startsWith('/video/')

    return (
        <div className='min-h-screen flex flex-col bg-gray-50'>
            {!isVideoCall && <Header />}

            <main className='flex-1'>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Home />} />

                    {/* Guest only (redirect if logged in) */}
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <Login />
                            </GuestRoute>
                        }
                    />

                    <Route 
                        path='/register'
                        element={
                            <GuestRoute>
                                <Register />
                            </GuestRoute>
                        }
                    />

                    <Route 
                        path='/verify-otp'
                        element={
                            <OTPRoute>
                                <VerifyOTP />
                            </OTPRoute>
                        }
                    />

                    {/* Onboarding (only doctor) */}
                    <Route 
                        path='/onboarding'
                        element={
                            <RoleRoute allowedRoles={['doctor']}>
                                <Onboarding />
                            </RoleRoute>
                        }
                    />

                    {/* Patient Routes */}
                    <Route 
                        path='/doctors'
                        element={
                            <RoleRoute allowedRoles={['patient']}>
                                <DoctorsList />
                            </RoleRoute>
                        }
                    />
                    <Route 
                        path='/doctors/:id'
                        element={
                            <RoleRoute allowedRoles={['patient']}>
                                <DoctorDetails />
                            </RoleRoute>
                        }
                    />
                    <Route 
                        path='/appointments'
                        element={
                            <RoleRoute allowedRoles={['patient']}>
                                <MyAppointments />
                            </RoleRoute>
                        }
                    />
                    <Route 
                        path='/video/:appointmentId'
                        element={
                            <RoleRoute allowedRoles={['patient', 'doctor']}>
                                <VideoCall />
                            </RoleRoute>
                        }
                    />
                    <Route 
                        path='/payment/success'
                        element={
                            <RoleRoute allowedRoles={['patient']}>
                                <PaymentSuccess />
                            </RoleRoute>
                        }
                    />
                    <Route 
                        path='/payment/cancel'
                        element={
                            <RoleRoute allowedRoles={['patient']}>
                                <PaymentCancel />
                            </RoleRoute>
                        }
                    />


                    {/* Doctor routes */}
                    <Route 
                        path='/doctor/dashboard'
                        element={
                            <RoleRoute allowedRoles={['doctor']}>
                                <DoctorDashboard />
                            </RoleRoute>
                        }
                    />
                    <Route 
                        path='/doctor/availability'
                        element={
                            <RoleRoute allowedRoles={['doctor']}>
                                <DoctorAvailability />
                            </RoleRoute>
                        }
                    />
                    <Route 
                        path='/doctor/appointments'
                        element={
                            <RoleRoute allowedRoles={['doctor']}>
                                <DoctorAppointments />
                            </RoleRoute>
                        }
                    />
                    <Route 
                        path='/doctor/earnings'
                        element={
                            <RoleRoute allowedRoles={['doctor']}>
                                <DoctorEarnings />
                            </RoleRoute>
                        }
                    />

                    {/* Admin routes */}
                    <Route 
                        path='/admin'
                        element={
                            <RoleRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </RoleRoute>
                        }
                    />
                    <Route 
                        path='/admin/doctors'
                        element={
                            <RoleRoute allowedRoles={['admin']}>
                                <DoctorsApproval />
                            </RoleRoute>
                        }
                    />
                    <Route 
                        path='/admin/withdrawals'
                        element={
                            <RoleRoute allowedRoles={['admin']}>
                                <Withdrawals />
                            </RoleRoute>
                        }
                    />
                    <Route 
                        path='/admin/plans'
                        element={
                            <RoleRoute allowedRoles={['admin']}>
                                <AdminPlans />
                            </RoleRoute>
                        }
                    />


                    {/* 404 */}
                    <Route path='*' element={<NotFound />} />

                </Routes>
            </main>

            {!isVideoCall && <Footer />}
        </div>
    )
}


// Main Router
const AppRouter = () => {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    )
}

export default AppRouter