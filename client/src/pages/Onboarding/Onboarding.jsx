import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth.js"
import { applyAsDoctor, getMyDoctorProfile } from '../../services/doctorService.js'
import Input from "../../components/ui/Input.jsx"
import Button from "../../components/ui/Button.jsx"
import Spinner from "../../components/ui/Spinner.jsx"


const SPECIALIZATIONS = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Pediatrician',
    'Psychiatrist',
    'Orthopedic',
    'Dentist',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist',
    'Urologist'
]

const Onboarding = () => {
    const { updateUser } = useAuth()
    const navigate = useNavigate()

    const [isCheckingProfile, setIsCheckingProfile] = useState(true)

    const [formData, setFormData] = useState({
        specialization: '',
        about: '',
        experienceYears: '',
        consultationFee: '',
        clinicName: '',
        clinicAddress: ''
    })

    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)


    useEffect(() => {
        const checkProfile = async () => {
            try {
                
                const profile = await getMyDoctorProfile()

                if(profile) {
                    navigate('/doctor/dashboard', { replace: true })
                }

            } catch (err) {
                if(err?.response?.status !== 404) {
                    navigate('/doctor/dashboard', { replace: true })
                }
            } finally {
                setIsCheckingProfile(false)
            }
        }

        checkProfile()
    }, [])

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        if(errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    const handleSpecializationSelect = (spec) => {
        setFormData((prev) => ({ ...prev, specialization: spec }))

        if(errors.specialization) {
            setErrors((prev) => ({ ...prev, specialization: '' }))
        }
    }

    // Validation
    const validate = () => {
        const newErrors = {}

        if(!formData.specialization) {
            newErrors.specialization = 'Please select a specialization'
        }

        if(!formData.about.trim()) {
            newErrors.about = 'Please write a short bio'
        }
        else if(formData.about.trim().length < 20) {
            newErrors.about = 'Bio must be at least 20 characters'
        }

        if(!formData.experienceYears) {
            newErrors.experienceYears = 'Experience is required'
        }
        else if(isNaN(formData.experienceYears) || Number(formData.experienceYears) < 0) {
            newErrors.experienceYears = 'Enter a valid number of years'
        }

        if(!formData.consultationFee) {
            newErrors.consultationFee = 'Consultation fee is required'
        }
        else if(isNaN(formData.consultationFee) || Number(formData.consultationFee) < 0) {
            newErrors.consultationFee = 'Enter a valid fee amount'
        }

        if(!formData.clinicName.trim()) {
            newErrors.clinicName = 'Clinic name is required'
        }

        if(!formData.clinicAddress.trim()) {
            newErrors.clinicAddress = 'Clinic address is required'
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
            
            await applyAsDoctor({
                specialization: formData.specialization,
                about: formData.about,
                experienceYears: Number(formData.experienceYears),
                consultationFee: Number(formData.consultationFee),
                clinicName: formData.clinicName,
                clinicAddress: formData.clinicAddress
            })

            updateUser({ isOnboarded: true })
            setSubmitted(true)

        } catch (error) {
            const message = error?.response?.data?.message || 'Submission failed. Please try again.'
            setServerError(message)
        } finally {
            setIsLoading(false)
        }
    }


    // Success screen
    if(submitted) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center bg-white border border-gray-200 rounded-2xl shadow-sm p-10">

                    {/* Success icon */}
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                            className="w-8 h-8 text-green-600"
                            fill='none'
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Application Submitted!
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                        Your doctor profile has been submitted for admin review. 
                        You will be notified once approved. Meanwhile you can 
                        explore your dashboard.
                    </p>

                    <Button
                        size="lg"
                        className="w-full"
                        onClick={() => navigate('/doctor/dashboard', { replace: true })}
                    >
                        Go to Dashboard
                    </Button>

                </div>
            </div>
        )
    }


    if(isCheckingProfile) <Spinner fullScreen />


    // Main form
    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Complete your profile
                </h1>
                <p className="text-gray-500">
                    Fill in your professional details so patients can find and 
                    trust you. Admin will review and approve your profile.
                </p>
            </div>

            {/* Server error */}
            {serverError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{serverError}</p>
                </div>
            )}


            {/* Form card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    {/* Specialization selector */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">
                            Specialization <span className="text-red-500">*</span>
                        </label>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {SPECIALIZATIONS.map((spec) => (
                                <button
                                    key={spec}
                                    type="button"
                                    onClick={() => handleSpecializationSelect(spec)}
                                    className={`
                                        px-3 py-2 rounded-lg border text-sm font-medium
                                        text-left transition-all duration-150
                                        ${formData.specialization === spec
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {spec}
                                </button>
                            ))}
                        </div>

                        {errors.specialization && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.specialization}
                            </p>
                        )}
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-100" />

                    {/* About/Bio */}
                    <div className="flex flex-col gap-1">
                        <label 
                            htmlFor="about"
                            className="text-sm font-medium text-gray-700"
                        >
                            About / Bio <span className="text-red-500">*</span>
                        </label>
                        <textarea 
                            id='about'
                            name='about'
                            rows={4}
                            placeholder='Write a short professional bio about yourself, your expertise and approach to patient care...'
                            value={formData.about}
                            onChange={handleChange}
                            className={`
                                w-full px-3 py-2 text-sm border rounded-lg
                                bg-white text-gray-900
                                placeholder:text-gray-400
                                resize-none
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                                focus:border-transparent transition-colors
                                ${errors.about
                                    ? 'border-red-400 focus:ring-red-400'
                                    : 'border-gray-300'
                                }
                            `}
                        />
                        {errors.about && (
                            <p className="text-xs text-red-500">{errors.about}</p>
                        )}
                        <p className="text-xs text-gray-400">
                            {formData.about.length} characters
                            {formData.about.length < 20  && formData.about.length > 0
                                ? ` (${20 - formData.about.length} more needed)`
                                : ''
                            }
                        </p>
                    </div>

                    {/* Experience + Fee row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input 
                            label='Years of experience'
                            name='experienceYears'
                            type='number'
                            placeholder='e.g. 5'
                            value={formData.experienceYears}
                            onChange={handleChange}
                            error={errors.experienceYears}
                            required
                        />
                        <Input 
                            label='Consultation fee (₹)'
                            name='consultationFee'
                            type='number'
                            placeholder='e.g. 500'
                            value={formData.consultationFee}
                            onChange={handleChange}
                            error={errors.consultationFee}
                            required
                        />
                    </div>

                    {/* Clinic name + address row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input 
                            label='Clinic name'
                            name='clinicName'
                            type='text'
                            placeholder='e.g. Heart Care Clinic'
                            value={formData.clinicName}
                            onChange={handleChange}
                            error={errors.clinicName}
                            required
                        />
                        <Input 
                            label='Clinic address'
                            name='clinicAddress'
                            type='text'
                            placeholder='e.g. Civil Lines, Prayagraj'
                            value={formData.clinicAddress}
                            onChange={handleChange}
                            error={errors.clinicAddress}
                            required
                        />
                    </div>

                    {/* Divider */}
                    <hr className="border-gray-100" />

                    {/* Info note */}
                    <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="shrink-0 mt-0.5">
                            <svg
                                className="w-4 h-4 text-blue-500"
                                fill='currentColor'
                                viewBox="0 0 20 20"
                            >
                                <path 
                                    fillRule="evenodd"
                                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                                    clipRule='evenodd'
                                />
                            </svg>
                        </div>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Your profile will be reviewed by our admin team before 
                            being visible to patients. This usually takes less than 
                            24 hours. {/* You can update your profile anytime from your 
                            dashboard. */}
                        </p>
                    </div>

                    {/* Submit */}
                    <Button
                        type='submit'
                        size='lg'
                        isLoading={isLoading}
                        className="w-full"
                    >
                        Submit for Review
                    </Button>

                </form>
            </div>
        </div>
    )
}

export default Onboarding