/**
 * EmptyState Component - Estados vacíos estéticos
 */
export default function EmptyState({
  icon,
  emoji,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 ${className}`}>
      {emoji && (
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-3xl">{emoji}</span>
        </div>
      )}
      {icon && !emoji && (
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 max-w-xs mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
