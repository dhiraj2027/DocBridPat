import { useEffect  } from 'react'

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}) => {
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    }

    // Close Modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e) =>{
            if(e.key === 'Escape') onClose()
        }

        if(isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if(!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>

            {/* Backdrop */}
            <div
                className='absolute inset-0 bg-black/50 backdrop-blur-sm'
                onClick={onClose}
            />

            {/* Modal Box */}
            <div
                className={`
                    relative bg-white rounded-2xl shadow-xl
                    w-full ${sizes[size]}
                    z-10
                `}
            >
                {/* Header */}
                <div className='flex items-center justify-between p-6 border-b border-gray-100'>
                    <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none'
                    >
                        X
                    </button>
                </div>

                {/* Body */}
                <div className='p-6'>
                    {children}
                </div>

            </div>
        </div>
    )
}

export default Modal