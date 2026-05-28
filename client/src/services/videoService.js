import apiClient from './apiClient.js'

export const getVideoRoom = async (appointmentId) => {
    const response = await apiClient.get(`/video/room/${appointmentId}`)

    return response.data
}