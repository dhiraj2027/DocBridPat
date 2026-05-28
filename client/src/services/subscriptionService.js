import apiClient from './apiClient.js'

export const getActivePlans = async () => {
    const response = await apiClient.get('/subscriptions/active')

    return response.data
}

export const createPlan = async (data) => {
    const response = await apiClient.post('/subscriptions/plans', data)

    return response.data
}

export const getAllPlans = async () => {
    const response = await apiClient.get('/subscriptions/plans')

    return response.data
}

export const updatePlan = async (id, data) => {
    const response = await apiClient.patch(`/subscriptions/plans/${id}`, data)

    return response.data
}