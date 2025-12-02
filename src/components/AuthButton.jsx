/**
 * Boton de autenticacion reutilizable estilo pill
 * Usado en la pantalla de onboarding/login
 */
export default function AuthButton({
  onClick,
  icon,
  children,
  loading = false,
  disabled = false,
  variant = 'primary', // 'primary' | 'secondary'
  className = '',
}) {
  const baseStyles = `
    w-full flex items-center justify-center gap-3
    py-4 px-6 rounded-full font-medium
    transition-all duration-200 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `

  const variantStyles = {
    primary: {
      background: 'var(--neutral-white)',
      color: 'var(--neutral-850)',
      border: '1px solid var(--neutral-border-warm)',
      boxShadow: '0 2px 8px rgba(26, 25, 21, 0.08)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--neutral-650)',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${className} hover:shadow-md`}
      style={variantStyles[variant]}
    >
      {icon && !loading && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
          Conectando...
        </span>
      ) : (
        children
      )}
    </button>
  )
}

// Iconos predefinidos para los botones de auth

export const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)
