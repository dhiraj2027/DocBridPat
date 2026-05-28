import axios from 'axios'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL 
        ?`${import.meta.env.VITE_API_URL}/api` 
        : '/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor: attach JWT token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')

        if(token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)


// Response interceptor: handle token expiry globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response && error.response.status === 401) {
            const currentPath = window.location.pathname
            const authPaths = ['/login', '/register']

            if(!authPaths.includes(currentPath)) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient