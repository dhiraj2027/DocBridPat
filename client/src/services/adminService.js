import apiClient from './apiClient.js'

export const getPendingDoctors = async () => {
    const response = await apiClient.get('/admin/doctors/pending')

    return response.data
}

export const approveDoctor = async (id) => {
    const response = await apiClient.patch(`/admin/doctors/${id}/approve`)

    return response.data
}

export const getWithdrawalRequests = async (status = '') => {
    const params = status ? { status } : {}
    const response = await apiClient.get('/admin/withdrawals', {params})

    return response.data
}

export const processWithdrawal = async (id, data) => {
    const response = await apiClient.patch(`/admin/withdrawals/${id}`, data)

    return response.data
}