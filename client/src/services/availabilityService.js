import apiClient from "./apiClient.js"

export const createAvailabilitySlots = async (data) => {
    const response = await apiClient.post('/availability', data)

    return response.data
}

export const getMyAvailability = async (date = '') => {
    const params = date ? { date } : {}
    const response = await apiClient.get('/availability/my', {params})

    return response.data
}

export const getDoctorAvailability = async (doctorId, date = '') => {
    const params = date ? { date } : {}
    const response = await apiClient.get(`/availability/doctor/${doctorId}`, {params})

    return response.data
}