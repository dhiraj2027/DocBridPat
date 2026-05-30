import { useState } from "react"
import { Link, useNavigate } from 'react-router-dom'
import useAuth from "../../hooks/useAuth.js"
import { getPasswordStrength, validatePassword } from "../../utils/passwordStrength.js"
import Input from "../../components/ui/Input.jsx"
import Button from "../../components/ui/Button.jsx"

const ROLES = [
    {
        value: 'patient',
        label: 'Patient',
        description: 'I want to book doctor appointments'
    },
    {
        value: 'doctor',
        label: 'Doctor',
        description: 'I want to offer consultations'
    }
]


const Register = () => {
    const { register } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient'
    })

    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        if(errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    const handleRoleSelect = (role) => {
        setFormData((prev) => ({ ...prev, role }))
    }

    // Validation
    const validate = () => {
        const newErrors = {}

        if(!formData.name.trim()) {
            newErrors.name = 'Full name is required'
        }
        else if(formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters'
        }

        if(!formData.email.trim()) {
            newErrors.email = 'Email is required'
        }
        else if(!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Enter a valid email address'
        }

        if(!formData.password) {
            newErrors.password = 'Password is required'
        }
        else {
            const pwdErrors = validatePassword(formData.password)
            if(pwdErrors.length > 0) {
                newErrors.password = `Password must contain: ${pwdErrors.join(', ')}`
            }
        }

        if(!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        }
        else if(formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        return newErrors
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
            
            await register(
                formData.name,
                formData.email,
                formData.password,
                formData.role
            )

            // Registration successful - redirect to OTP page
            navigate('/verify-otp', {replace: true })

        } catch (error) {
            const message = error?.response?.data?.message || 'Registration failed. Please try again.'
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

                        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Join DocBridPat today
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

                        {/* Role selector */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                I am registering as
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {ROLES.map((role) => (
                                    <button
                                        key={role.value}
                                        type='button'
                                        onClick={() => handleRoleSelect(role.value)}
                                        className={`
                                            flex flex-col items-start p-4 rounded-xl border-2
                                            text-left transition-all duration-150
                                            ${formData.role === role.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }
                                        `}
                                    >
                                        <span
                                            className={`
                                                text-sm font-semibold mb-1
                                                ${formData.role === role.value
                                                    ? 'text-blue-700'
                                                    : 'text-gray-800'
                                                }
                                            `}
                                        >
                                            {role.label}
                                        </span>
                                        <span className="text-xs text-gray-500 leading-snug">
                                            {role.description}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Input 
                            label='Full name'
                            name='name'
                            type='text'
                            placeholder='John Doe'
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            required
                        />

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

                        {/* Password field + strength meter */}
                        <div className="flex flex-col gap-1">
                            <Input 
                                label='Password'
                                name='password'
                                type='password'
                                placeholder='Min 8 characters'
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                required
                            />

                            {/* Strength bar - only show when typing */}
                            {formData.password && (() => {
                                const strength = getPasswordStrength(formData.password)
                                const blocks = [1, 2, 3, 4, 5, 6]

                                return (
                                    <div className="mt-1">
                                        {/* Bar */}
                                        <div className="flex gap-1 mb-1">
                                            {blocks.map((b) => (
                                                <div
                                                    key={b}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300
                                                        ${b <= strength.score
                                                            ? strength.color 
                                                            : 'bg-gray-200'

                                                        }`}
                                                />
                                            ))}  
                                        </div>

                                        {/* Label */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col gap-0.5">
                                                {validatePassword(formData.password).map((req, i) => (
                                                    <p
                                                        key={i}
                                                        className="text-xs text-red-400"
                                                    >
                                                        ✗ {req}
                                                    </p>
                                                ))}
                                            </div>

                                            {strength.label && (
                                                <span className={`
                                                    text-xs font-semibold 
                                                    ${strength.label === 'Weak' ? 'text-red-500' : 
                                                        strength.label === 'Fair' ? 'text-yellow-500' : 
                                                        strength.label === 'Good' ? 'text-blue-500' : 
                                                        'text-green-500'
                                                    }
                                                `}>
                                                    {strength.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>

                        <Input 
                            label='Confirm password'
                            name='confirmPassword'
                            type='password'
                            placeholder='Re-enter your password'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            required
                        />

                        <Button
                            type='submit'
                            size='lg'
                            isLoading={isLoading}
                            className="w-full mt-2"
                        >
                            Create Account
                        </Button>

                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link
                            to='/login'
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Sign In
                        </Link>
                    </p>
                    
                </div>
            </div>
        </div>
    )
}

export default Register