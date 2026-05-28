import { useState } from "react"
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'

const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        // clear field error on change
        if(errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: ''}))
        }
    }

    // Validation
    const validate = () => {
        const newErrors = {}

        if(!formData.email.trim()) {
            newErrors.email = 'Email is required'
        }
        else if(!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Enter a valid email address'
        }

        if(!formData.password) {
            newErrors.password = 'Password is required'
        }
        else if(formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        return newErrors
    }


    // Role-based redirect
    const redirectByRole = (user) => {
        if(user.role === 'admin') return navigate('/admin', { replace: true })
        if(user.role === 'doctor') {
            return user.isOnboarded
                ? navigate('/doctor/dashboard', { replace: true })
                : navigate('/onboarding', { replace: true })
        }
        return navigate('/doctors', { replace: true })
    }


    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault()
        setServerError('')
        
        const validationErrors = validate()

        if(Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setIsLoading(true)

        try {
            
            const result = await login(formData.email, formData.password)
            
            // If unverified, redirect to OTP page
            if(result?.requiresVerification) {
                navigate('/verify-otp', { replace: true })
                return
            }

            // Normal login - redirect by role
            redirectByRole(result)

        } catch (error) {
            const message = error?.response?.data?.message || 'Login failed. Please try again.'
            setServerError(message)
        } finally {
            setIsLoading(false)
        }
    }


    // Render
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">

                {/* Card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-xl">D</span>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Sign in to your DocBridPat account
                        </p>
                    </div>

                    {/* Server error */}
                    {serverError && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{serverError}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                        <Input 
                            label='Email address'
                            name='email'
                            type='email'
                            placeholder='you@example.com'
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            required
                        />

                        <div className="flex flex-col gap-1">
                            <Input 
                                label='Password'
                                name='password'
                                type='password'
                                placeholder='••••••••'
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                required
                            />
                        </div>

                        <Button
                            type='submit'
                            size='lg'
                            isLoading={isLoading}
                            className="w-full mt-2"
                        >
                            Sign In
                        </Button>

                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link 
                            to='/register'
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Create One
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    )
}

export default Login