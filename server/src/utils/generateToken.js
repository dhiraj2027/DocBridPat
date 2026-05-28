import jwt from 'jsonwebtoken'

const generateToken = (userId, role) => {
    return jwt.sign(
        {
            sub: userId,
            role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    )
}

export default generateToken