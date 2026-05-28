import apiClient from "./apiClient.js"

// Create a Stripe checkout session and return the redirect URL
export const createCheckoutSession = async (planId) => {
    const response = await apiClient.post('/payments/create-checkout-session', { planId })

    return response.data
}

// Verify the session after Stripe redirects back
export const verifySession = async (sessionId) => {
    const response = await apiClient.get(`/payments/verify-session/${sessionId}`)

    return response.data
}