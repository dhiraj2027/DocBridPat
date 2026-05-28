import { useState, useEffect } from "react"
import { getAllPlans, createPlan, updatePlan } from '../../services/subscriptionService.js'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Input from '../../components/ui/Input.jsx'
import Spinner from '../../components/ui/Spinner.jsx'



const AdminPlans = () => {
    const [plans, setPlans] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    // create/edit modal
    const [showModal, setShowModal] = useState(false)
    const [editingPlan, setEditingPlan] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        credits: '',
        description: '',
        isActive: true
    })

    const [formErrors, setFormErrors] = useState({})


    // Fetch plans
    useEffect(() => {
        fetchPlans()
    }, [])
    
    const fetchPlans = async () => {
        setIsLoading(true)
        setError('')

        try {
            
            const data = await getAllPlans()
            setPlans(data)

        } catch {
            setError('Failed to load plans.')
        } finally {
            setIsLoading(false)
        }
    }


    // Open create modal
    const handleOpenCreate = () => {
        setEditingPlan(null)
        setFormData({
            name: '',
            price: '',
            credits: '',
            description: '',
            isActive: true
        })

        setFormErrors({})
        setSaveError('')
        setShowModal(true)
    }


    // Open edit modal
    const handleOpenEdit = (plan) => {
        setEditingPlan(plan)
        setFormData({
            name: plan.name,
            price: plan.price.toString(),
            credits: plan.credits.toString(),
            description: plan.description || '',
            isActive: plan.isActive
        })

        setFormErrors({})
        setSaveError('')
        setShowModal(true)
    }


    // Handle form change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        if(formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: ''}))
        }
    }


    // validate form
    const validate = () => {
        const errors = {}

        if(!formData.name.trim()) {
            errors.name = 'Plan name is required'
        }

        if(!formData.price) {
            errors.price = 'Price is required'
        }
        else if(isNaN(formData.price) || Number(formData.price) < 0) {
            errors.price = 'Enter a valid price'
        }

        if(!formData.credits) {
            errors.credits = 'Credits is required'
        }
        else if(
            isNaN(formData.credits) || 
            Number(formData.credits) < 1 || 
            !Number.isInteger(Number(formData.credits))
        ) {
            errors.credits = 'Credits must be a positive whole number'
        }

        return errors
    }


    // Submit form
    const handleSubmit = async () => {
        const errors = validate()

        if(Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        setIsSaving(true)
        setSaveError('')

        const payload = {
            name: formData.name.trim(),
            price: Number(formData.price),
            credits: Number(formData.credits),
            description: formData.description.trim(),
            isActive: formData.isActive
        }

        try {
            
            if(editingPlan) {
                // Update existing plan
                const updated = await updatePlan(editingPlan._id, payload)
                setPlans((prev) => 
                    prev.map((p) => 
                        p._id === editingPlan._id ? updated.plan : p
                    )
                )
            }
            else {
                // Create a new plan
                const created = await createPlan(payload)
                setPlans((prev) => [...prev, created.plan])
            }

            setShowModal(false)
            setEditingPlan(null)

        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to save plan. Please try again.'
            setSaveError(message)
        } finally {
            setIsSaving(false)
        }
    }


    // Toggle plan active status
    const handleToggleActive = async (plan) => {
        try {
            
            const updated = await updatePlan(plan._id, {
                isActive: !plan.isActive
            })

            setPlans((prev) => 
                prev.map((p) => 
                    p._id === plan._id ? updated.plan : p
                )
            )

        } catch {
            // Silent fail
        }
    }

    if(isLoading) return <Spinner fullScreen />

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                        Subscription Plans
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Manage plans available to patients.
                    </p>
                </div>
                <Button onClick={handleOpenCreate}>
                    + New Plan
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="text-center py-20">
                    <p className="text-red-500 mb-4">
                        {error}
                    </p>
                    <Button variant="outline" onClick={fetchPlans}>
                        Retry
                    </Button>
                </div>
            )}

            {/* Empty state */}
            {!error && plans.length === 0 && (
                <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
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
                                d='M12 8c-1.657 0-3 .895-3 2s1.343 
                                    2 3 2 3 .895 3 2-1.343 
                                    2-3 2m0-8c1.11 0 2.08.402 
                                    2.599 1M12 8V7m0 1v8m0 
                                    0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 
                                    12a9 9 0 11-18 0 9 9 
                                    0 0118 0z'
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No plans yet
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Create your first subscription plan for patients.
                    </p>
                    <Button onClick={handleOpenCreate}>
                        Create Plan
                    </Button>
                </div>
            )}


            {/* Plans grid */}
            {!error && plans.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {plans.map((plan) => (
                        <div
                            key={plan._id}
                            className={`
                                bg-white border-2 rounded-2xl p-6 shadow-sm 
                                transition-all duration-200 
                                ${plan.isActive 
                                    ? 'border-gray-200 hover:border-blue-200 hover:shadow-md'
                                    : 'border-gray-100 opacity-60'
                                }
                            `}
                        >
                            {/* Plan header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {plan.name}
                                    </h3>
                                    {plan.description && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {plan.description}
                                        </p>
                                    )}
                                </div>

                                <Badge
                                    variant={plan.isActive ? 'success' : 'default'}
                                >
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                                <span className="text-3xl font-bold text-blue-600">
                                    ₹{plan.price}
                                </span>
                                <span className="text-sm text-gray-500 ml-1">
                                    one-time
                                </span>
                            </div>

                            {/* Credits */}
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl mb-5">
                                <svg
                                    className="w-4 h-4 text-blue-500 shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path 
                                        fillRule="evenodd"
                                        d='M10 18a8 8 0 100-16 8 8 
                                            0 000 16zm3.707-9.293a1 1 
                                            0 00-1.414-1.414L9 10.586 
                                            7.707 9.293a1 1 0 00-1.414 
                                            1.414l2 2a1 1 0 001.414 
                                            0l4-4z'
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-sm font-semibold text-blue-700">
                                    {plan.credits} appointment credits
                                </span>
                            </div>

                            {/* Created date */}
                            <p className="text-xs text-gray-400 mb-4">
                                Created{' '}
                                {new Date(plan.createdAt).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    size='sm'
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => handleOpenEdit(plan)}
                                >
                                    Edit
                                </Button>

                                <Button
                                    size="sm"
                                    variant={plan.isActive ? 'secondary' : 'primary'}
                                    className="flex-1"
                                    onClick={() => handleToggleActive(plan)}
                                >
                                    {plan.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* Summary stats */}
            {!error && plans.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">
                            {plans.length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Total Plans</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">
                            {plans.filter((p) => p.isActive).length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Active Plans</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                        <p className="text-2xl font-bold text-blue-600">
                            ₹{Math.min(...plans.map((p) => p.price))}
                            {' - '}
                            ₹{Math.max(...plans.map((p) => p.price))}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Price Range</p>
                    </div>
                </div>
            )}


            {/* Create / Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingPlan ? 'Edit Plan' : 'Create New Plan'}
                size="md"
            >
                <div className="flex flex-col gap-4">

                    <Input 
                        label="Plan name"
                        name="name"
                        type="text"
                        placeholder="e.g. Starter, Pro, Premium"
                        value={formData.name}
                        onChange={handleChange}
                        error={formErrors.name}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Price (₹)"
                            name="price"
                            type="number"
                            placeholder="e.g. 299"
                            value={formData.price}
                            onChange={handleChange}
                            error={formErrors.price}
                            required
                        />

                        <Input 
                            label="Credits"
                            name="credits"
                            type="number"
                            placeholder="e.g. 5"
                            value={formData.credits}
                            onChange={handleChange}
                            error={formErrors.credits}
                            required
                        />
                    </div>

                    <Input 
                        label="Description"
                        name="description"
                        type="text"
                        placeholder="e.g. Perfect for occasional consultations"
                        value={formData.description}
                        onChange={handleChange}
                        error={formErrors.description}
                    />

                    {/* Active toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                Active Status
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Inactive plans are hidden from patients
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => 
                                setFormData((prev) => ({
                                    ...prev,
                                    isActive: !prev.isActive
                                }))
                            }
                            className={`
                                relative inline-flex h-6 w-11 items-center 
                                rounded-full transition-colors duration-200 
                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                focus:ring-offset-2 
                                ${formData.isActive ? 'bg-blue-600' : 'bg-gray-300'}   
                            `}
                        >
                            <span
                                className={`
                                    inline-block h-4 w-4 rounded-full bg-white 
                                    shadow transform transition-transform duration-200 
                                    ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}    
                                `}
                            />
                        </button>
                    </div>


                    {/* Preview */}
                    {formData.price && formData.credits && (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">
                                Preview
                            </p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {formData.name || 'Plan name'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {formData.credits} credits
                                    </p>
                                </div>
                                <p className="text-xl font-bold text-blue-600">
                                    ₹{formData.price}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Save error */}
                    {saveError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">
                                {saveError}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-1">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowModal(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="flex-1"
                            isLoading={isSaving}
                            onClick={handleSubmit}
                        >
                            {editingPlan ? 'Save Changes' : 'Create Plan'}
                        </Button>
                    </div>

                </div>
            </Modal>
            
        </div>
    )
}

export default AdminPlans