import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { createAvailabilitySlots, getMyAvailability } from '../../services/availabilityService.js'
import { getMyDoctorProfile } from "../../services/doctorService.js"
import Button from "../../components/ui/Button.jsx"
import Spinner from "../../components/ui/Spinner.jsx"

// Generate time slots from 08:00 to 20:00 in 30 min gaps
const generateTimeOptions = () => {
    const times = []

    for(let h=8; h<20; h++) {
        for(let m=0; m<60; m+=30) {
            const hh = String(h).padStart(2, '0')
            const mm = String(m).padStart(2, '0')
            const nextM = m + 30 === 60 ? '00' : String(m + 30).padStart(2, '0')
            const nextH = m + 30 === 60 ? String(h + 1).padStart(2, '0') : hh

            times.push({
                startTime: `${hh}:${mm}`,
                endTime: `${nextH}:${nextM}`
            })
        }
    }

    return times
}


const TIME_OPTIONS = generateTimeOptions()

// Get next 14 days for date selection
const getNext14Days = () => {
    const days = []
    const today = new Date()

    for(let i=0; i<14; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)

        const yyyy = date.getFullYear()
        const mm = String(date.getMonth() + 1).padStart(2, '0')
        const dd = String(date.getDate()).padStart(2, '0')

        days.push({
            value: `${yyyy}-${mm}-${dd}`,
            dayName: date.toLocaleDateString('en-IN', { weekday: 'short' }),
            dayNum: date.getDate(),
            monthName: date.toLocaleDateString('en-IN', { month: 'short' })
        })
    }

    return days
}


// Render
const DoctorAvailability = () => {
    const navigate = useNavigate()

    const [selectedDate, setSelectedDate] = useState('')
    const [selectedSlots, setSelectedSlots] = useState([])
    const [existingSlots, setExistingSlots] = useState([])

    const [isLoadingExisting, setIsLoadingExisting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState('')
    const [saveError, setSaveError] = useState('')

    const [profile, setProfile] = useState(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    const next14Days = getNext14Days()

    // Profile fetch
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoadingProfile(true)

            try {
                
                const data = await getMyDoctorProfile()
                setProfile(data)

            } catch {
                setProfile(null)
            } finally {
                setIsLoadingProfile(false)
            }
        }

        fetchProfile()
    }, [])

    // fetch existing slots when date changes
    useEffect(() => {
        if(!selectedDate) return

        const fetchExisting = async () => {
            setIsLoadingExisting(true)
            setExistingSlots([])
            setSelectedSlots([])
            setSaveSuccess('')
            setSaveError('')

            try {
                
                const data = await getMyAvailability(selectedDate)
                setExistingSlots(data)

            } catch {
                setExistingSlots([])
            } finally {
                setIsLoadingExisting(false)
            }
        }

        fetchExisting()
    }, [selectedDate])


    // Toggle slot selection
    const toggleSlot = (slot) => {
        const exists = selectedSlots.find(
            (s) => s.startTime === slot.startTime
        )

        if(exists) {
            setSelectedSlots((prev) => (
                prev.filter((s) => s.startTime !== slot.startTime)
            ))
        }
        else {
            setSelectedSlots((prev) => [...prev, slot])
        }
    }


    // Check if slot already exists in DB
    const isAlreadySaved = (slot) => {
        return existingSlots.some((s) => s.startTime === slot.startTime)
    }


    // save new slots
    const handleSave = async () => {
        if(selectedSlots.length === 0) {
            setSaveError('Please select at least one time slot.')
            return
        }

        setSaveError('')
        setSaveSuccess('')
        setIsSaving(true)

        try {
            
            await createAvailabilitySlots({
                date: selectedDate,
                slots: selectedSlots
            })

            setSaveSuccess(
                `${selectedSlots.length} slot(s) added for ${selectedDate}`
            )

            setTimeout(() => {
                setSaveSuccess('')
            }, 3000)
            
            setSelectedSlots([])

            // refresh existing slots
            const updated = await getMyAvailability(selectedDate)
            setExistingSlots(updated)

        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to save slots. Please try again.'
            setSaveError(message)
        } finally {
            setIsSaving(false)
        }
    }

    if(isLoadingProfile) return <Spinner fullScreen />


    // No profile created yet
    if(!profile) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm">
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
                                strokeWidth={2}
                                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Complete Your Profile First
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                        You need to complete to your doctor profile and then wait for admin approval before you can manage availability.
                    </p>

                    <Button onClick={() => navigate('/onboarding')}>
                        Complete Profile
                    </Button>
                </div>
            </div>
        )
    }


    // Profile exists but not approved yet
    if(!profile.isApproved) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Awaiting Admin Approval
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        Your profile is under review. You can manage availability once approved by admin.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    Manage Availability
                </h1>
                <p className="text-gray-500 text-sm">
                    Select a date and add time slots when you are available for consultations.
                </p>
            </div>

            {/* Date selector */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">
                    Step 1 - Select a date
                </h2>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {next14Days.map((day) => (
                        <button
                            key={day.value}
                            onClick={() => setSelectedDate(day.value)}
                            className={`
                                flex flex-col items-center px-4 py-3 rounded-xl 
                                border-2 min-w-[72px] transition-all duration-150 
                                ${selectedDate === day.value
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }
                            `}
                        >
                            <span className="text-xs font-medium">{day.dayName}</span>
                            <span className="text-xl font-bold my-0.5">{day.dayNum}</span>
                            <span className="text-xs">{day.monthName}</span>
                        </button>
                    ))}
                </div>
            </div>

            
            {/* Slot selector */}
            {selectedDate && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-1">
                        Step 2 - Select time slots for{' '}
                        <span className="text-blue-600">{selectedDate}</span>
                    </h2>
                    <p className="text-xs text-gray-400 mb-4">
                        Green slots are already saved. Click white slots to add new ones.
                    </p>

                    {isLoadingExisting ? (
                        <div className="flex justify-center py-6">
                            <Spinner size='sm' />
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {TIME_OPTIONS.map((slot) => {
                                const alreadySaved = isAlreadySaved(slot)
                                const isSelected = selectedSlots.some(
                                    (s) => s.startTime === slot.startTime
                                )

                                return (
                                    <button
                                        key={slot.startTime}
                                        onClick={() => !alreadySaved && toggleSlot(slot)}
                                        disabled={alreadySaved}
                                        className={`
                                            py-2 px-2 rounded-lg border text-xs font-medium 
                                            transition-all duration-150 
                                            ${alreadySaved 
                                                ? 'border-green-300 bg-green-50 text-green-700 cursor-not-allowed'
                                                : isSelected 
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                                            }    
                                        `}
                                    >
                                        {slot.startTime}
                                        {alreadySaved && (
                                            <span className="block text-[10px] text-green-600 mt-0.5">
                                                saved
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Selected count */}
                    {selectedSlots.length>0 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold text-blue-700">
                                    {selectedSlots.length}
                                </span>{' '}
                                slot(s) selected
                            </p>
                            <button
                                onClick={() => setSelectedSlots([])}
                                className="text-xs text-red-400 hover:text-red-600 transition-colors"
                            >
                                Clear selection
                            </button>
                        </div>
                    )}

                    {/* Save messages */}
                    {saveSuccess && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700">{saveSuccess}</p>
                        </div>
                    )}

                    {saveError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{saveError}</p>
                        </div>
                    )}

                    {/* Save button */}
                    <Button
                        className="w-full mt-5"
                        size="lg"
                        isLoading={isSaving}
                        disabled={selectedSlots.length === 0}
                        onClick={handleSave}
                    >
                        Save {selectedSlots.length > 0 
                            ? `${selectedSlots.length} Slot(s)`
                            : 'Slots'
                        }
                    </Button>
                </div>
            )}

            {/* Existing slots summary */}
            {selectedDate && existingSlots.length>0 && (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">
                        Saved slots for{' '}
                        <span className="text-blue-600">{selectedDate}</span>
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        {existingSlots.map((slot) => (
                            <div
                                key={slot._id}
                                className={`
                                    px-3 py-1.5 rounded-lg border text-xs font-medium 
                                    flex items-center gap-2 
                                    ${slot.isBooked 
                                        ? 'border-red-200 bg-red-50 text-red-700'
                                        : 'border-green-200 bg-green-50 text-green-700'
                                    }
                                `}
                            >
                                {slot.startTime} - {slot.endTime}
                                <span className={`
                                    text-[10px] px-1.5 py-0.5 rounded-full font-semibold 
                                    ${slot.isBooked
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-green-100 text-green-600'
                                    }
                                `}>
                                    {slot.isBooked ? 'Booked' : 'Free'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}

export default DoctorAvailability