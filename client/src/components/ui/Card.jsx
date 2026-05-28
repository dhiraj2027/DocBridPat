const Card = ({
    children,
    className = '',
    padding = true,
    onClick,
    hoverable = false
}) => {
    return (
        <div
            onClick={onClick}
            className={`
                bg-white rounded-xl border border-gray-200 shadow-sm
                ${padding ? 'p-6' : ''}
                ${hoverable
                    ? 'cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200'
                    : ''
                }
                ${className}
            `}
        >
            {children}   
        </div>
    )
}


export const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
)


export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
        {children}
    </h3>
)


export const CardContent = ({ children, className = '' }) => (
    <div className={`text-gray-600 ${className}`}>
        {children}
    </div>
)


export const CardFooter = ({ children, className = '' }) => (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
        {children}
    </div>
)


export default Card