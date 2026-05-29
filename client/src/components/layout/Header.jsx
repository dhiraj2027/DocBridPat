import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Reusable NavLink class helper
    const navLinkClass = ({ isActive }) => 
        `text-sm font-medium transition-colors
        ${isActive
            ? 'text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`

    return (
        <header className='bg-white border-b border-gray-200 sticky top-0 z-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>

                    {/* Logo */}
                    <NavLink 
                        to={
                            !isAuthenticated ? '/' : 
                            user?.role === 'admin' ? '/admin' : 
                            user?.role === 'doctor' ? (user?.isOnboarded ? '/doctor/dashboard' : '/onboarding') : 
                            '/doctors'
                        } 
                        className='flex items-center gap-2'
                    >
                        <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                            <span className='text-white font-bold text-sm'>D</span>
                        </div>
                        <span className='text-xl font-bold text-gray-900'>DocBridPat</span>
                    </NavLink>

                    {/* Navigation */}
                    <nav className='flex items-center gap-4'>
                        {!isAuthenticated ? (
                            <>
                                <NavLink
                                    to='/login'
                                    className={navLinkClass}
                                >
                                    Login
                                </NavLink>
                                <NavLink
                                    to='/register'
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'bg-blue-700 text-white'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }
                                    `}
                                >
                                    Get Started
                                </NavLink>
                            </>
                        ) : (
                            <>
                                {/* Patient nav */}
                                {user?.role === 'patient' && (
                                    <>
                                        <NavLink
                                            to='/doctors'
                                            className={navLinkClass}
                                        >
                                            Doctors
                                        </NavLink>
                                        <NavLink
                                            to='/appointments'
                                            className={navLinkClass}
                                        >
                                            My appointments
                                        </NavLink>
                                        <span className='bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold'>
                                            {user.credits} credits
                                        </span>
                                    </>
                                )}

                                {/* Doctor nav */}
                                {user?.role === 'doctor' && (
                                    <>
                                        <NavLink
                                            to='/doctor/dashboard'
                                            className={navLinkClass}
                                        >
                                            Dashboard
                                        </NavLink>

                                        {/* Only shown after onboarding complete */}
                                        {user?.isOnboarded && (
                                            <>
                                                <NavLink
                                                    to='/doctor/appointments'
                                                    className={navLinkClass}
                                                    >
                                                    Appointments
                                                </NavLink>
                                                <NavLink
                                                    to='/doctor/availability'
                                                    className={navLinkClass}
                                                    >
                                                    Availability
                                                </NavLink>
                                                <NavLink
                                                    to='/doctor/earnings'
                                                    className={navLinkClass}
                                                    >
                                                    Earnings
                                                </NavLink>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Admin nav */}
                                {user?.role === 'admin' && (
                                    <>
                                        <NavLink
                                            to='/admin'
                                            end
                                            className={navLinkClass}
                                        >
                                            Dashboard
                                        </NavLink>
                                        <NavLink
                                            to='/admin/doctors'
                                            className={navLinkClass}
                                        >
                                            Doctors
                                        </NavLink>
                                        <NavLink
                                            to='/admin/withdrawals'
                                            className={navLinkClass}
                                        >
                                            Withdrawals
                                        </NavLink>
                                        <NavLink
                                            to='/admin/plans'
                                            className={navLinkClass}
                                        >
                                            Plans
                                        </NavLink>
                                    </>
                                )}

                                {/* User Info + logout */}
                                <div className='flex items-center gap-3 ml-2 pl-3 border-l border-gray-200'>
                                    <div className='text-right hidden sm:block'>
                                        <p className='text-sm font-medium text-gray-900'>{user?.name}</p>

                                        <p className='text-xs text-gray-500 capitalize'>{user?.role}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className='text-sm text-red-500 hover:text-red-700 font-medium transition-colors'
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Header