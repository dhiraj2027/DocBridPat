import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { verifySession } from "../../services/paymentService.js"
import useAuth from "../../hooks/useAuth.js"
import Spinner from "../../components/ui/Spinner.jsx"
import Button from "../../components/ui/Button.jsx"



const PaymentSuccess = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { updateUser } = useAuth()

    const [status, setStatus] = useState('verifying')
    // verifying | success | error

    const [details, setDetails] = useState(null)


    useEffect(() => {
        const sessionId = searchParams.get('session_id')

        if(!sessionId) {
            setStatus('error')
            return
        }

        const verify = async () => {
            try {
                
                const data = await verifySession(sessionId)

                // Update credits in auth context
                updateUser({ credits: data.totalCredits })
                setDetails(data)
                setStatus('success')

            } catch {
                setStatus('error')
            }
        }

        verify()
    }, [])


    // Verifying screen
    if(status === 'verifying') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Spinner size='lg' />
                    <p className="text-gray-500 text-sm">
                        Verifying your payment...
                    </p>
                </div>
            </div>
        )
    }


    // Error screen
    if(status === 'error') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-sm">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <svg
                            className="w-7 h-7 text-red-500"
                            fill='none'
                            stroke='currentColor'
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                            />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-1">
                            Verification Failed
                        </h2>
                        <p className="text-gray-500 text-sm">
                            We could not verify your payment. If you were charged, please contact support.
                        </p>
                    </div>

                    <Button
                        onClick={() => navigate('/appointments')}
                        className="w-full"
                    >
                        Go to Appointments
                    </Button>
                </div>
            </div>
        )
    }


    // Success screen
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm space-y-6">

                {/* Success icon */}
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                        className="w-8 h-8 text-green-500"
                        fill='none'
                        stroke='currentColor'
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d='M5 13l4 4L19 7'
                        />
                    </svg>
                </div>

                {/* Text */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        Payment Successful
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Your credits have been added to your account.
                    </p>
                </div>

                {/* Details box */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Amount Paid</span>
                        <span className="font-semibold text-gray-900">
                            ₹{details?.amount?.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500">Credits Added</span>
                        <span className="font-semibold text-green-600">
                            +{details?.creditsAdded} credits
                        </span>
                    </div>

                    <div className="flex justify-between border-t border-gray-200 pt-3">
                        <span className="text-gray-500">New Balance</span>
                        <span className="font-bold text-blue-600">
                            {details?.totalCredits} credits
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                    <Button
                        onClick={() => navigate('/appointments', { replace: true })}
                        className="w-full"
                    >
                        Book an Appointment
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigate('/doctors', { replace: true })}
                        className="w-full"
                    >
                        Browse Doctors
                    </Button>
                </div>

            </div>
        </div>
    )
}

export default PaymentSuccess