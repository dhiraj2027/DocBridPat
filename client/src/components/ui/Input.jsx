const Input = ({
    label,
    name,
    type = 'text',
    placeholder = '',
    value,
    onChange,
    error = '',
    disabled = false,
    required = false,
    className = '',
    ...rest
}) => {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label 
                    htmlFor={name}
                    className='text-sm font-medium text-gray-700'
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={`
                    w-full px-3 py-2 text-sm
                    border rounded-lg
                    bg-white text-gray-900
                    placeholder:text-gray-400
                    transition-colors duration-150
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
                    ${error
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-gray-300'
                    }
                `}
                {...rest}
            />

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    )
}

export default Input