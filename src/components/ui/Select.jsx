/**
 * Select Component - Chips seleccionables estilo Linear
 */
export default function Select({
  label,
  options,
  value,
  onChange,
  multiple = false,
  className = '',
}) {
  const handleSelect = (optionValue) => {
    if (multiple) {
      const newValue = value.includes(optionValue)
        ? value.filter(v => v !== optionValue)
        : [...value, optionValue]
      onChange(newValue)
    } else {
      onChange(optionValue)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = multiple
            ? value.includes(option.value)
            : value === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                inline-flex items-center gap-2 h-9 px-3
                text-sm font-medium rounded-xl
                transition-all duration-150
                ${isSelected
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {option.icon && <span>{option.icon}</span>}
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Dropdown Select nativo estilizado
Select.Native = function NativeSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full h-10 px-3 pr-10 text-sm
            bg-white text-gray-900
            border rounded-xl appearance-none
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${error
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
              : 'border-gray-200 hover:border-gray-300 focus:border-accent-500 focus:ring-accent-500/20'
            }
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-sm text-error-500">{error}</p>
      )}
    </div>
  )
}
