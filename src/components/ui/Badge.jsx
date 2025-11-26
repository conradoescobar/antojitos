/**
 * Badge Component - Estilo Linear
 * Para etiquetas, estados, categorías
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-accent-50 text-accent-700',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    error: 'bg-error-50 text-error-600',
    warm: 'bg-warm-50 text-warm-700',
    outline: 'bg-transparent border border-gray-200 text-gray-600',
  }

  const sizes = {
    sm: 'h-5 px-1.5 text-2xs gap-1',
    md: 'h-6 px-2 text-xs gap-1.5',
    lg: 'h-7 px-2.5 text-sm gap-1.5',
  }

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="w-3 h-3">{icon}</span>}
      {children}
    </span>
  )
}
