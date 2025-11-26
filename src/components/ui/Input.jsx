/**
 * Input Component - Estilo Linear/Stripe
 */
export default function Input({
  label,
  error,
  hint,
  icon,
  iconRight,
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
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full h-10 px-3 text-sm
            bg-white text-gray-900 placeholder-gray-400
            border rounded-xl
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${icon ? 'pl-10' : ''}
            ${iconRight ? 'pr-10' : ''}
            ${error
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
              : 'border-gray-200 hover:border-gray-300 focus:border-accent-500 focus:ring-accent-500/20'
            }
          `}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {iconRight}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-error-500">{error}</p>
      )}
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
}

// Textarea variant
Input.Textarea = function Textarea({
  label,
  error,
  hint,
  className = '',
  rows = 3,
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-3 py-2.5 text-sm
          bg-white text-gray-900 placeholder-gray-400
          border rounded-xl resize-none
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error
            ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
            : 'border-gray-200 hover:border-gray-300 focus:border-accent-500 focus:ring-accent-500/20'
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-error-500">{error}</p>
      )}
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
}
