/**
 * Modal Component - Estilo Linear/Notion
 * Sheet desde abajo en móvil, centrado en desktop
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
}) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    full: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative w-full ${sizes[size]}
          bg-white
          rounded-t-3xl sm:rounded-2xl
          shadow-2xl
          animate-slide-in-bottom sm:animate-scale-in
          max-h-[90vh] overflow-hidden
          flex flex-col
        `}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between p-5 border-b border-gray-100">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              )}
            </div>
            {showClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  )
}

// Footer para acciones
Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/50 ${className}`}>
      {children}
    </div>
  )
}
