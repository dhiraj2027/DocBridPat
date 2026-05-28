const requiredRole = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user || !req.user.role) {
            return res.status(401).json({
                message: 'Not authenticated'
            })
        }

        if(!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Forbidden: insufficient role'
            })
        }

        next()
    }
}

export default requiredRole