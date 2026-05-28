import { useNavigate } from "react-router-dom"
import Button from "../../components/ui/Button.jsx"


const PaymentCancel = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-sm space-y-6">

                {/* Cancel icon */}
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                        className="w-8 h-8 text-yellow-500"
                        fill='none'
                        stroke='currentColor'
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d='M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'
                        />
                    </svg>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        Payment Cancelled
                    </h2>
                    <p className="text-gray-500 text-sm">
                        You cancelled the payment. No charges were made.
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <Button
                        onClick={() => navigate(-1)}
                        className="w-full"
                    >
                        Try Again
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigate('/appointments', { replace: true })}
                        className="w-full"
                    >
                        Go to Appointments
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default PaymentCancel