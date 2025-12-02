import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthButton, { GoogleIcon, PhoneIcon } from './AuthButton'
import TacoLogo from './TacoLogo'

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
      {/* Logo superior */}
      <div className="flex flex-col items-center pt-16 pb-8">
        <div className="animate-bounce-in">
          <TacoLogo size={100} variant="header" />
        </div>
        <h2
          className="mt-4 text-lg font-semibold animate-text-reveal"
          style={{
            color: 'var(--primary-terracota)',
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          Antojitos Cerca
        </h2>
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
