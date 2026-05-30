// check password strength and returns feedback
export const getPasswordStrength = (password) => {
    if(!password) return {
        score: 0,
        label: '',
        color: ''
    }

    let score = 0

    if(password.length >= 8) score++
    if(password.length >= 12) score++
    if(/[A-Z]/.test(password)) score++
    if(/[a-z]/.test(password)) score++
    if(/[0-9]/.test(password)) score++
    if(/[^A-Za-z0-9]/.test(password)) score++

    if(score <= 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if(score <= 4) return { score, label: 'Fair', color: 'bg-yellow-500' }
    if(score === 5) return { score, label: 'Good', color: 'bg-blue-500' }

    return { score, label: 'Strong', color: 'bg-green-500' }
}


// Validates password meets minimum requirements
export const validatePassword = (password) => {
    const errors = []

    if(password.length < 8) errors.push('At least 8 characters')
    if(!/[A-Z]/.test(password)) errors.push('One uppercase letter')
    if(!/[a-z]/.test(password)) errors.push('One lowercase letter')
    if(!/[0-9]/.test(password)) errors.push('One number')
    if(!/[^A-Za-z0-9]/.test(password)) errors.push('One special character (!@#$...)')

    return errors
}