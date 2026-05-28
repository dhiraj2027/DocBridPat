import apiClient from './apiClient.js'

export const applyAsDoctor = async (data) => {
    const response = await apiClient.post('/doctors/apply', data)

    return response.data
}

export const getMyDoctorProfile = async () => {
    const response = await apiClient.get('/doctors/me')

    return response.data
}

export const getApprovedDoctors = async (specialization = '') => {
    const params = specialization ? { specialization } : {}
    const response = await apiClient.get('/doctors', {params})

    return response.data
}

export const getDoctorById = async (id) => {
    const response = await apiClient.get(`/doctors/${id}`)

    return response.data
}