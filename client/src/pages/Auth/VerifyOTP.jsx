import { useState, useEffect, useRef } from "react"
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import Button from '../../components/ui/Button.jsx'

const VerifyOTP = () => {
    const { pendingUserId, pendingEmail, verifyOTP, resendOTP } = useAuth()

    const navigate = useNavigate()

    // 6 individual input boxes for OTP digits
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
    const inputRefs = useRef([])

    const [isVerifying, setIsVerifying] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState('')
    const [resendSuccess, setResendSuccess] = useState('')

    // Countdown timer for resend
    const [countdown, setCountdown] = useState(60)
    const [canResend, setCanResend] = useState(false)

    // Redirect if no pending user
    useEffect(() => {
        if(!pendingUserId) {
            navigate('/register')
        }
    }, [pendingUserId, navigate])

    // Countdown timer
    useEffect(() => {
        if(countdown <= 0) {
            setCanResend(true)
            return
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev-1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [countdown])


    // Handle digit input
    const handleDigitChange = (index, value) => {
        // only allow numbers
        if(value && !/^\d$/.test(value)) return

        const newDigits = [...otpDigits]
        newDigits[index] = value
        setOtpDigits(newDigits)
        setError('')

        // Auto-focus next input
        if(value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit when all 6 digits filled
        if(value && index === 5) {
            const allFilled = newDigits.every((d) => d !== '')
            if(allFilled) {
                handleVerify(newDigits.join(''))
            }
        }
    }

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if(e.key === 'Backspace') {
            if(otpDigits[index] === '' && index>0) {
                inputRefs.current[index - 1]?.focus()
            }

            const newDigits = [...otpDigits]
            newDigits[index] = ''
            setOtpDigits(newDigits)
        }
    }

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').trim()

        if(/^\d{6}$/.test(pasted)) {
            const digits = pasted.split('')
            setOtpDigits(digits)
            inputRefs.current[5]?.focus()
            handleVerify(pasted)
        }
    }

    // Verify OTP
    const handleVerify = async (otpString) => {
        const otp = otpString || otpDigits.join('')

        if(otp.length !== 6) {
            setError('Please enter the complete 6-digit OTP.')
            return
        }

        setIsVerifying(true)
        setError('')

        try {
            
            const user = await verifyOTP(pendingUserId, otp)

            // Redirect based on role
            if(user.role === 'admin') return navigate('/admin')
            if(user.role === 'doctor') return navigate('/onboarding')
            
            return navigate('/doctors')

        } catch (error) {
            const message = error?.response?.data?.message || 'Verification failed. Please try again.'
            setError(message)

            // Clear digits on error
            setOtpDigits(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } finally {
            setIsVerifying(false)
        }
    }


    // Resend OTP
    const handleResend = async () => {
        if(!canResend) return

        setIsResending(true)
        setError('')
        setResendSuccess('')

        try {
            
            await resendOTP(pendingUserId)
            setResendSuccess('New OTP sent to your email.')
            setCountdown(60)
            setCanResend(false)
            setOtpDigits(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()

        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to resend OTP. Please try again.'
            setError(message)
        } finally {
            setIsResending(false)
        }
    }


    // Render
    return(
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-blue-600"
                                fill='none'
                                stroke='currentColor'
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Verify your email
                        </h1>
                        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                            We sent a 6-digit code to
                        </p>
                        <p className="text-blue-600 font-semibold text-sm">
                            {pendingEmail}
                        </p>
                    </div>

                    {/* Success message */}
                    {resendSuccess && (
                        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700 text-center">
                                {resendSuccess}
                            </p>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 text-center">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* OTP input boxes */}
                    <div className="flex justify-center gap-3 mb-8">
                        {otpDigits.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type='text'
                                inputMode='numeric'
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleDigitChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className={`
                                    w-12 h-14 text-center text-xl font-bold 
                                    border-2 rounded-xl 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                                    transition-all duration-150 
                                    ${digit 
                                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                        : 'border-gray-300 bg-white text-gray-900' 
                                    }
                                    ${error ? 'border-red-400' : ''}
                                `}
                            />
                        ))}
                    </div>

                    {/* Verify button */}
                    <Button
                        className="w-full"
                        size='lg'
                        isLoading={isVerifying}
                        disabled={otpDigits.some((d) => d === '')}
                        onClick={() => handleVerify(otpDigits.join(''))}
                    >
                        Verify Email
                    </Button>

                    {/* Resend section */}
                    <div className="mt-6 text-center">
                        {canResend ? (
                            <button
                                onClick={handleResend}
                                disabled={isResending}
                                className="text-sm text-blue-600 font-medium hover:underline disabled:opacity-50"
                            >
                                {isResending ? 'Sending...' : 'Resend OTP'}
                            </button>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Resend OTP in{' '}
                                <span className="font-semibold text-gray-700">
                                    {countdown}s
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Back to register */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/register')}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            ← Back to Register
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default VerifyOTP