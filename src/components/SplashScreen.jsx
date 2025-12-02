import { useEffect, useState } from 'react'
import TacoLogo from './TacoLogo'

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
        <TacoLogo size={80} variant="splash" />
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
