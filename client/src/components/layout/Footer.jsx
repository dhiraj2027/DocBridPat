import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className='bg-white border-t border-gray-200 mt-auto'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>

                    {/* Brand */}
                    <div className='flex items-center gap-2'>
                        <div className='w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center'>
                            <span className='text-white font-bold text-xs'>D</span>
                        </div>
                        <span className='text-gray-800 font-semibold'>DocBridPat</span>
                    </div>

                    {/* Links */}
                    <div className='flex items-center gap-6 text-sm text-gray-500'>
                        <Link
                            to='/'
                            className='hover:text-gray-800 transition-colors'
                        >
                            Home
                        </Link>
                        <Link
                            to='/doctors'
                            className='hover:text-gray-800 transition-colors'
                        >
                            Find Doctors
                        </Link>
                        <Link
                            to='/login'
                            className='hover:text-gray-800 transition-colors'
                        >
                            Login
                        </Link>
                        <Link
                            to='/register'
                            className='hover:text-gray-800 transition-colors'
                        >
                            Register
                        </Link>
                    </div>

                    {/* Copyright */}
                    <p className='text-sm text-gray-400'>
                        &copy; {new Date().getFullYear()} DocBridPat. All rights reserved.
                    </p>

                </div>
            </div>
        </footer>
    )
}

export default Footer