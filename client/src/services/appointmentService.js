import apiClient from "./apiClient.js"

export const bookAppointment = async (data) => {
    const response = await apiClient.post('/appointments', data)

    return response.data
}

export const getMyAppointments = async () => {
    const response = await apiClient.get('/appointments/my')

    return response.data
}

export const getDoctorAppointments = async () => {
    const response = await apiClient.get('/appointments/doctor')

    return response.data
}

export const cancelAppointment = async (id) => {
    const response = await apiClient.patch(`/appointments/${id}/cancel`)

    return response.data
}

export const completeAppointment = async (id, notes) => {
    const response = await apiClient.patch(`/appointments/${id}/complete`, {notes})

    return response.data
}

export const confirmAppointment = async (appointmentId) => {
    const response = await apiClient.patch(`/appointments/${appointmentId}/confirm`)

    return response.data
}

export const markMissedAppointment = async (appointmentId) => {
    const response = await apiClient.patch(`/appointments/${appointmentId}/missed`)

    return response.data
}