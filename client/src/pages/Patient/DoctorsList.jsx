import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { getApprovedDoctors } from "../../services/doctorService.js"
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from "../../components/ui/Button.jsx"
import Spinner from '../../components/ui/Spinner.jsx'

const SPECIALIZATIONS = [
    'All',
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

const DoctorsList = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const [doctors, setDoctors] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    // read Specialization from URL query param
    const selectedSpec = searchParams.get('specialization') || 'All'

    // Fetch doctors
    useEffect(() => {
        const fetchDoctors = async () => {
            setIsLoading(true)
            setError('')

            try {
                
                const spec = selectedSpec === 'All' ? '' : selectedSpec
                const data = await getApprovedDoctors(spec)
                setDoctors(data)

            } catch {
                setError('Failed to load doctors. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchDoctors()
    }, [selectedSpec])


    // Handlers
    const handleSpecFilter = (spec) => {
        if(spec === 'All') {
            setSearchParams({})
        }
        else {
            setSearchParams({ specialization: spec })
        }
    }

    // Render
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Find a Doctor
                </h1>
                <p className="text-gray-500">
                    Browse our verified doctors and book an appointment online.
                </p>
            </div>

            {/* Specialization filter */}
            <div className="mb-8 overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                    {SPECIALIZATIONS.map((spec) => (
                        <button
                            key={spec}
                            onClick={() => handleSpecFilter(spec)}
                            className={`
                                px-4 py-2 rounded-full text-sm font-medium
                                whitespace-nowrap transition-all duration-150
                                ${selectedSpec === spec
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }
                            `}
                        >
                            {spec}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex justify-center py-20">
                    <Spinner size='lg' />
                </div>
            )}

            {/* Error */}
            {!isLoading && error && (
                <div className="text-center py-20">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button 
                        variant="outline"
                        onClick={() => handleSpecFilter(selectedSpec)}
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && doctors.length===0 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-gray-400"
                            fill='none'
                            stroke='currentColor'
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 
                                    0v-2c0-.656-.126-1.283-.356-1.857M7 
                                    20H2v-2a3 3 0 015.356-1.857M7 
                                    20v-2c0-.656.126-1.283.356-1.857m0 
                                    0a5.002 5.002 0 019.288 0M15 7a3 
                                    3 0 11-6 0 3 3 0 016 0zm6 
                                    3a2 2 0 11-4 0 2 2 0 014 0zM7 
                                    10a2 2 0 11-4 0 2 2 0 014 0z'
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No doctors found
                    </h3>
                    <p className="text-gray-500 text-sm">
                        {selectedSpec === 'All'
                            ? 'No approved doctors available at the moment'
                            : `No approved doctors found for "${selectedSpec}"`
                        }
                    </p>
                </div>
            )}

            {/* Doctor cards grid */}
            {!isLoading && !error && doctors.length>0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.map((doctor) => (
                        <DoctorCard 
                            key={doctor._id}
                            doctor={doctor}
                            onViewProfile={() => navigate(`/doctors/${doctor._id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}


// Doctor Card sub-component
const DoctorCard = ({ doctor, onViewProfile }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 overflow-hidden">

            {/* Card top color strip */}
            <div className="h-2 bg-blue-600" />

            <div className="p-6">
                
                {/* Avatar + Name */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-700 font-bold text-lg">
                            {doctor.user?.name?.charAt(0).toUpperCase() || 'D'}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                            Dr. {doctor.user?.name || 'Unknown'}
                        </h3>
                        <Badge variant='primary' className="mt-1">
                            {doctor.specialization}
                        </Badge>
                    </div>
                </div>

                {/* Bio */}
                {doctor.about && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                        {doctor.about}
                    </p>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-gray-900">
                            {doctor.experienceYears}
                        </p>
                        <p className="text-xs text-gray-500">Years exp.</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-gray-900">
                            ₹{doctor.consultationFee}
                        </p>
                        <p className="text-xs text-gray-500">Per session</p>
                    </div>
                </div>


                {/* Clinic */}
                {doctor.clnicName && (
                    <div className="flex items-center gap-2 mb-5">
                        <svg
                            className="w-4 h-4 text-gray-400 shrink-0"
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 01-4.244-4.243a8 8 0 1111.314 0z'
                            />
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                        </svg>
                        <span className="text-xs text-gray-500 truncate">
                            {doctor.clnicName}
                        </span>
                    </div>
                )}

                {/* Action button */}
                <Button
                    className="w-full"
                    size='sm'
                    onClick={onViewProfile}
                >
                    View Profile & Book
                </Button>

            </div>
        </div>
    )
}

export default DoctorsList