import apiClient from "./apiClient.js"

export const registerUser = async (data) => {
    const response = await apiClient.post('/auth/register', data)

    return response.data
}

export const loginUser = async (data) => {
    const response = await apiClient.post('/auth/login', data)

    return response.data
}

export const verifyOTPService = async (data) => {
    const response = await apiClient.post('/auth/verify-otp', data)

    return response.data
}

export const resendOTPService = async (data) => {
    const response = await apiClient.post('/auth/resend-otp', data)

    return response.data
}