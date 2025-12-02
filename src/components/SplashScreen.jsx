import { useEffect, useState } from 'react'

// Icono de taco estilizado como logo placeholder
const TacoLogo = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" fill="rgba(255,255,255,0.15)" />
    <g transform="translate(12, 16)">
      {/* Tortilla base */}
      <path
        d="M4 32C4 32 8 8 28 8C48 8 52 32 52 32C52 36 44 44 28 44C12 44 4 36 4 32Z"
        fill="#FEF3C7"
        stroke="white"
        strokeWidth="2"
      />
      {/* Relleno - carne */}
      <ellipse cx="28" cy="24" rx="18" ry="10" fill="#92400E" />
      {/* Lechuga */}
      <path
        d="M12 22C12 22 18 18 28 18C38 18 44 22 44 22C44 22 38 26 28 26C18 26 12 22 12 22Z"
        fill="#22C55E"
      />
      {/* Tomate */}
      <circle cx="20" cy="20" r="4" fill="#EF4444" />
      <circle cx="36" cy="20" r="4" fill="#EF4444" />
      {/* Queso */}
      <path
        d="M16 28L20 22L24 28L28 22L32 28L36 22L40 28"
        stroke="#FCD34D"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  </svg>
)

export default function SplashScreen({ onFinish }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Mostrar splash por 2.5 segundos, luego iniciar animacion de salida
    const timer = setTimeout(() => {
      setIsExiting(true)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isExiting) {
      // Esperar a que termine la animacion de fade out antes de llamar onFinish
      const exitTimer = setTimeout(() => {
        onFinish?.()
      }, 400)

      return () => clearTimeout(exitTimer)
    }
  }, [isExiting, onFinish])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${isExiting ? 'animate-fade-out' : ''}`}
      style={{ background: 'var(--primary-terracota)' }}
    >
      {/* Logo con animacion bounce */}
      <div className="animate-bounce-in">
        <TacoLogo />
      </div>

      {/* Nombre de la app */}
      <h1
        className="mt-6 text-2xl font-bold tracking-tight animate-text-reveal"
        style={{
          color: 'white',
          animationDelay: '0.3s',
          opacity: 0,
          animationFillMode: 'forwards'
        }}
      >
        Antojitos Cerca
      </h1>

      {/* Indicador de carga - 3 puntos pulsantes */}
      <div
        className="absolute bottom-20 loading-dots"
        style={{ animationDelay: '0.5s' }}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )
}
