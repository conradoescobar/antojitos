/**
 * Button Component - Estilo Linear/Vercel
 * Variantes: primary, secondary, ghost, danger
 * Tamaños: sm, md, lg
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium
    transition-all duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500/50
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `

  const variants = {
    primary: `
      bg-gray-900 text-white
      hover:bg-gray-800
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-white text-gray-700
      border border-gray-200
      hover:bg-gray-50 hover:border-gray-300
      shadow-sm
    `,
    ghost: `
      bg-transparent text-gray-600
      hover:bg-gray-100 hover:text-gray-900
    `,
    danger: `
      bg-error-500 text-white
      hover:bg-error-600
      shadow-sm
    `,
    accent: `
      bg-accent-500 text-white
      hover:bg-accent-600
      shadow-sm hover:shadow-md
    `,
    warm: `
      bg-warm-500 text-white
      hover:bg-warm-600
      shadow-sm hover:shadow-md
    `,
  }

  const sizes = {
    sm: 'h-8 px-3 text-sm rounded-lg',
    md: 'h-10 px-4 text-sm rounded-xl',
    lg: 'h-12 px-6 text-base rounded-xl',
  }

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="w-4 h-4">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && <span className="w-4 h-4">{iconRight}</span>}
    </button>
  )
}
