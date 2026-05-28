import apiClient from './apiClient.js'

export const createWithdrawalRequest = async (amount) => {
    const response = await apiClient.post('/withdrawals', {amount})

    return response.data
}

export const getMyWithdrawalRequests = async () => {
    const response = await apiClient.get('/withdrawals/my')

    return response.data
}