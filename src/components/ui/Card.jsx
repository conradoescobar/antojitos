/**
 * Card Component - Estilo Linear/Notion
 * Variantes: default, elevated, outlined, interactive
 */
export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = `
    bg-white rounded-2xl
    transition-all duration-200 ease-out
  `

  const variants = {
    default: 'border border-gray-100 shadow-sm',
    elevated: 'shadow-card hover:shadow-card-hover',
    outlined: 'border border-gray-200',
    interactive: `
      border border-gray-100 shadow-sm
      hover:shadow-card-hover hover:border-gray-200
      cursor-pointer active:scale-[0.99]
    `,
    ghost: 'bg-gray-50/50',
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

// Sub-componentes para estructura
Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  )
}

Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-base font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  )
}

Card.Description = function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  )
}

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  )
}
