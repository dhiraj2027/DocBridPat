import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'

const NotFound = () => {
    return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4'>
            <h1 className='text-6xl font-bold text-blue-600'>404</h1>
            <h2 className='text-2xl font-semibold text-gray-900'>Page Not Found</h2>
            <p className='text-gray-500 max-w-md'>
                The page you are looking for does not exist or has been moved.
            </p>

            <Link to='/'>
                <Button>Go Home</Button>
            </Link>
        </div>
    )
}

export default NotFound