import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthButton, { GoogleIcon, PhoneIcon } from './AuthButton'

// Ilustracion placeholder de comida callejera mexicana
const FoodIllustration = () => (
  <div
    className="w-full h-64 rounded-3xl flex items-center justify-center overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    }}
  >
    <div className="relative">
      {/* Taco grande */}
      <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="transform -rotate-12">
        <path
          d="M10 60C10 60 20 15 60 15C100 15 110 60 110 60C110 68 95 85 60 85C25 85 10 68 10 60Z"
          fill="#FEF3C7"
          stroke="#D97757"
          strokeWidth="3"
        />
        <ellipse cx="60" cy="45" rx="35" ry="18" fill="#92400E" />
        <path d="M30 42C30 42 42 35 60 35C78 35 90 42 90 42C90 42 78 50 60 50C42 50 30 42 30 42Z" fill="#22C55E" />
        <circle cx="45" cy="40" r="6" fill="#EF4444" />
        <circle cx="75" cy="40" r="6" fill="#EF4444" />
        <path d="M35 55L42 45L49 55L56 45L63 55L70 45L77 55L84 45" stroke="#FCD34D" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>

      {/* Decoraciones flotantes */}
      <div className="absolute -top-4 -left-8 text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🌶️</div>
      <div className="absolute -top-2 -right-6 text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🍋</div>
      <div className="absolute -bottom-2 -left-4 text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>🥑</div>
      <div className="absolute -bottom-4 -right-8 text-3xl animate-bounce" style={{ animationDelay: '0.3s' }}>🌽</div>
    </div>
  </div>
)

export default function LoginOnboarding({ onSkip }) {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  const handleGoogleLogin = async () => {
    try {
      setLoading('google')
      setError(null)
      await signInWithGoogle()
    } catch (err) {
      setError('Error al iniciar sesion con Google')
      console.error(err)
    } finally {
      setLoading(null)
    }
  }

  const handlePhoneLogin = () => {
    // TODO: Implementar login con telefono
    setError('Login con telefono proximamente disponible')
    setTimeout(() => setError(null), 3000)
  }

  return (
    <div
      className="min-h-screen flex flex-col animate-slide-fade-in"
      style={{ background: 'var(--neutral-100)' }}
    >
      {/* Ilustracion superior */}
      <div className="px-6 pt-12 pb-6">
        <FoodIllustration />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 px-6 flex flex-col">
        {/* Titulo y subtitulo */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold mb-3 animate-text-reveal"
            style={{
              color: 'var(--neutral-850)',
              animationDelay: '0.1s',
              opacity: 0,
              animationFillMode: 'forwards'
            }}
          >
            Descubre los mejores antojitos cerca de ti
          </h1>
          <p
            className="text-base animate-text-reveal"
            style={{
              color: 'var(--neutral-650)',
              animationDelay: '0.2s',
              opacity: 0,
              animationFillMode: 'forwards'
            }}
          >
            Encuentra puestos, deja resenas y gana recompensas
          </p>
        </div>

        {/* Botones de autenticacion */}
        <div
          className="space-y-3 animate-text-reveal"
          style={{
            animationDelay: '0.3s',
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          <AuthButton
            onClick={handleGoogleLogin}
            icon={<GoogleIcon />}
            loading={loading === 'google'}
            disabled={loading !== null}
          >
            Continuar con Google
          </AuthButton>

          <AuthButton
            onClick={handlePhoneLogin}
            icon={<PhoneIcon />}
            disabled={loading !== null}
          >
            Continuar con telefono
          </AuthButton>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div
            className="mt-4 p-3 rounded-xl text-center text-sm animate-fade-in"
            style={{ background: '#FEE2E2', color: '#DC2626' }}
          >
            {error}
          </div>
        )}

        {/* Espaciador flexible */}
        <div className="flex-1 min-h-8" />

        {/* Terminos y continuar sin cuenta */}
        <div
          className="pb-8 text-center animate-text-reveal"
          style={{
            animationDelay: '0.4s',
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          <p
            className="text-xs mb-4"
            style={{ color: 'var(--neutral-650)' }}
          >
            Al continuar, aceptas los{' '}
            <button
              className="underline hover:no-underline"
              style={{ color: 'var(--neutral-850)' }}
              onClick={() => {/* TODO: Mostrar terminos */}}
            >
              Terminos y Condiciones
            </button>
          </p>

          <button
            onClick={onSkip}
            className="text-sm font-medium hover:underline transition-all"
            style={{ color: 'var(--neutral-650)' }}
          >
            Continuar sin cuenta
          </button>
        </div>
      </div>
    </div>
  )
}
