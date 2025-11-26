/**
 * Spinner Component - Loaders sutiles
 */
export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <svg
      className={`animate-spin text-accent-500 ${sizes[size]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// Variante de puntos
Spinner.Dots = function SpinnerDots({ className = '' }) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-accent-500 rounded-full animate-pulse-soft"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

// Skeleton loader
Spinner.Skeleton = function Skeleton({ className = '' }) {
  return (
    <div
      className={`
        bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100
        bg-[length:200%_100%] animate-shimmer rounded-lg
        ${className}
      `}
    />
  )
}
