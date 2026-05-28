import { createContext, useState, useEffect, useCallback } from 'react'
import { loginUser, registerUser, verifyOTPService, resendOTPService } from '../services/authService.js'
import apiClient from '../services/apiClient.js'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // OTP state
    const [pendingUserId, setPendingUserId] = useState(null)
    const [pendingEmail, setPendingEmail] = useState(null)

    // On app load: rehydrate from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if(storedToken && storedUser) {
            try {

                setToken(storedToken)
                setUser(JSON.parse(storedUser))

            } catch {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            }
        }

        setIsLoading(false)
    }, [])


    const saveSession = useCallback((tokenValue, userData) => {
        localStorage.setItem('token', tokenValue)
        localStorage.setItem('user', JSON.stringify(userData))

        setToken(tokenValue)
        setUser(userData)
    }, [])


    const login = useCallback(async (email, password) => {
        const data = await loginUser({ email, password })

        // If unverified, backend returns requiresverification: true
        if(data.requiresVerification) {
            setPendingUserId(data.userId)
            setPendingEmail(data.email)

            return { requiresVerification: true, userId: data.userId}
        }

        if(!data.token || !data.user) {
            throw new Error('Invalid response from server')
        }
        saveSession(data.token, data.user)

        return data.user
    }, [saveSession])


    const register = useCallback(async (name, email, password, role) => {
        const data = await registerUser({ name, email, password, role })
        
        if(!data.userId) {
            throw new Error('Invalid response from server')
        }

        // Store pending user for OTP verification
        setPendingUserId(data.userId)
        setPendingEmail(data.email)

        return data
    }, [])

    // Verify OTP - completes registration
    const verifyOTP = useCallback(async (userId, otp) => {
        const data = await verifyOTPService({ userId, otp })

        if(!data.token || !data.user) {
            throw new Error('Invalid response from server')
        }

        saveSession(data.token, data.user)
        setPendingUserId(null)
        setPendingEmail(null)

        return data.user
    }, [saveSession])


    // Resend OTP
    const resendOTP = useCallback(async (userId) => {
        const data = await resendOTPService({ userId })

        return data
    }, [])


    const logout = useCallback(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        setToken(null)
        setUser(null)
        setPendingUserId(null)
        setPendingEmail(null)
    }, [])


    const updateUser = useCallback((updatedFields) => {
        setUser((prevUser) => {
            const updated = { ...prevUser, ...updatedFields }
            localStorage.setItem('user', JSON.stringify(updated))
            
            return updated
        })
    }, [])


    const refreshUser = useCallback(async () => {
        try {
            
            const response = await apiClient.get('/auth/me')
            const updatedUser = response.data
            setUser(updatedUser)
            localStorage.setItem('user', JSON.stringify(updatedUser))

        } catch (error) {
            console.error('Failed to refresh user: ', error)
        }
    }, [])


    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        pendingUserId,
        pendingEmail,
        login,
        register,
        verifyOTP,
        resendOTP,
        logout,
        updateUser,
        refreshUser
    }


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}