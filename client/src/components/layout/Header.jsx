import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()

    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login', { replace: true })
        setMenuOpen(false)
    }

    const closeMenu = () => setMenuOpen(false)

    // Reusable NavLink class helper
    const navLinkClass = ({ isActive }) => 
        `text-sm font-medium transition-colors
        ${isActive
            ? 'text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`

    const mobileNavLinkClass = ({ isActive }) => 
        `block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
        ${isActive 
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-700 hover:bg-gray-50'
        }
    `

    return (
        <header className='bg-white border-b border-gray-200 sticky top-0 z-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>

                    {/* Logo */}
                    <NavLink 
                        to='/' 
                        className='flex items-center gap-2'
                    >
                        <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                            <span className='text-white font-bold text-sm'>D</span>
                        </div>
                        <span className='text-xl font-bold text-gray-900'>DocBridPat</span>
                    </NavLink>

                    {/* Desktop Navigation */}
                    <nav className='hidden md:flex items-center gap-4'>
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

                    {/* Mobile: right side */}
                    <div className='flex items-center gap-3 md:hidden'>

                        {/* Credits badge for patients on mobile */}
                        {isAuthenticated && user?.role === 'patient' && (
                            <span className='bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold'>
                                {user.credits} credits
                            </span>
                        )}

                        {/* Hamburger button */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className='p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors'
                        >
                            {menuOpen ? (
                                <svg
                                    className='w-5 h-5'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path 
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M6 18L18 6M6 6l12 12'
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className='w-5 h-5'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path 
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M4 6h16M4 12h16M4 18h16'
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {menuOpen && (
                <div className='md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1 shadow-lg'>
                    {!isAuthenticated ? (
                        <>
                            <NavLink
                                to='/login'
                                className={mobileNavLinkClass}
                                onClick={closeMenu}
                            >
                                Login
                            </NavLink>
                            <NavLink
                                to='/register'
                                className={mobileNavLinkClass}
                                onClick={closeMenu}
                            >
                                Get Started
                            </NavLink>
                        </>
                    ) : (
                        <>
                            {/* User info */}
                            <div className='px-4 py-2 mb-1 border-b border-gray-100'>
                                <p className='text-sm font-semibold text-gray-900'>{user?.name}</p>
                                <p className='text-xs text-gray-500 capitalize'>{user?.role}</p>
                            </div>

                            {/* Patient nav */}
                            {user?.role === 'patient' && (
                                <>
                                    <NavLink
                                        to='/doctors'
                                        className={mobileNavLinkClass}
                                        onClick={closeMenu}
                                    >
                                        Doctors
                                    </NavLink>
                                    <NavLink
                                        to='/appointments'
                                        className={mobileNavLinkClass}
                                        onClick={closeMenu}
                                    >
                                        My appointments
                                    </NavLink>
                                </>
                            )}

                            {/* Doctor nav */}
                            {user?.role === 'doctor' && (
                                <>
                                    <NavLink
                                        to='/doctor/dashboard'
                                        className={mobileNavLinkClass}
                                        onClick={closeMenu}
                                    >
                                        Dashboard
                                    </NavLink>

                                    {/* Only shown after onboarding complete */}
                                    {user?.isOnboarded && (
                                        <>
                                            <NavLink
                                                to='/doctor/appointments'
                                                className={mobileNavLinkClass}
                                                onClick={closeMenu}
                                            >
                                                Appointments
                                            </NavLink>
                                            <NavLink
                                                to='/doctor/availability'
                                                className={mobileNavLinkClass}
                                                onClick={closeMenu}
                                            >
                                                Availability
                                            </NavLink>
                                            <NavLink
                                                to='/doctor/earnings'
                                                className={mobileNavLinkClass}
                                                onClick={closeMenu}
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
                                        className={mobileNavLinkClass}
                                        onClick={closeMenu}
                                    >
                                        Dashboard
                                    </NavLink>
                                    <NavLink
                                        to='/admin/doctors'
                                        className={mobileNavLinkClass}
                                        onClick={closeMenu}
                                    >
                                        Doctors
                                    </NavLink>
                                    <NavLink
                                        to='/admin/withdrawals'
                                        className={mobileNavLinkClass}
                                        onClick={closeMenu}
                                    >
                                        Withdrawals
                                    </NavLink>
                                    <NavLink
                                        to='/admin/plans'
                                        className={mobileNavLinkClass}
                                        onClick={closeMenu}
                                    >
                                        Plans
                                    </NavLink>
                                </>
                            )}

                            {/* Logout */}
                            <div className='mt-1 pt-2 border-t border-gray-100'>
                                <button
                                    onClick={handleLogout}
                                    className='w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors'
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </header>
    )
}

export default Header