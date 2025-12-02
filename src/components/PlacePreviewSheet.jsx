import { useState, useRef, useEffect } from 'react'

// Constantes
const COLLAPSED_HEIGHT = 120
const EXPANDED_RATIO = 0.55 // 55% de la pantalla - más compacto
const DRAG_THRESHOLD = 50

// Emojis por tipo de comida
const FOOD_EMOJIS = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🍽️',
  'Bebidas': '🥤',
  'Postres': '🍰',
  'Otro': '📍',
  'default': '🌮'
}

// Componente de estrellas
function StarRating({ rating, size = 14 }) {
  const stars = []
  const fullStars = Math.floor(rating || 0)
  const hasHalf = (rating || 0) - fullStars >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="var(--primary-intense)" stroke="var(--primary-intense)" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--primary-intense)" strokeWidth="1">
          <defs>
            <linearGradient id={`half-${i}`}>
              <stop offset="50%" stopColor="var(--primary-intense)" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={`url(#half-${i})`} />
        </svg>
      )
    } else {
      stars.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    }
  }
  return <div className="flex gap-0.5">{stars}</div>
}

// Iconos
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

export default function PlacePreviewSheet({ puesto, onClose, onViewMore, userLocation }) {
  const [isExpanded, setIsExpanded] = useState(true) // Abre expandido por defecto
  const [isVisible, setIsVisible] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const sheetRef = useRef(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  // Calcular altura expandida
  const expandedHeight = typeof window !== 'undefined' ? window.innerHeight * EXPANDED_RATIO : 500

  // Animación de entrada
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  // Bloquear scroll del body cuando el sheet está expandido
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isExpanded])

  // Calcular promedio de estrellas
  const calcularPromedio = () => {
    const campos = ['sabor', 'precio', 'higiene', 'cantidad', 'atencion']
    const valores = campos.map(c => puesto[c]).filter(v => v != null && v > 0)
    if (valores.length === 0) return 0
    return valores.reduce((a, b) => a + b, 0) / valores.length
  }

  // Calcular distancia
  const calcularDistancia = () => {
    if (!userLocation || !puesto.latitud || !puesto.longitud) return null
    const R = 6371
    const dLat = (puesto.latitud - userLocation[0]) * Math.PI / 180
    const dLon = (puesto.longitud - userLocation[1]) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation[0] * Math.PI / 180) * Math.cos(puesto.latitud * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const dist = R * c
    return dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`
  }

  // Verificar si está abierto
  const estaAbierto = () => {
    if (!puesto.horario_apertura || !puesto.horario_cierre) return null
    const ahora = new Date()
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes()
    const [aperturaH, aperturaM] = puesto.horario_apertura.split(':').map(Number)
    const [cierreH, cierreM] = puesto.horario_cierre.split(':').map(Number)
    const apertura = aperturaH * 60 + aperturaM
    const cierre = cierreH * 60 + cierreM
    if (cierre < apertura) {
      return horaActual >= apertura || horaActual <= cierre
    }
    return horaActual >= apertura && horaActual <= cierre
  }

  const promedio = calcularPromedio()
  const distancia = calcularDistancia()
  const abierto = estaAbierto()

  // Handlers de drag
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY
    currentY.current = startY.current
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current

    // Limitar el drag
    if (isExpanded) {
      // En modo expandido, solo permitir bajar
      setDragOffset(Math.max(0, diff))
    } else {
      // En modo collapsed, permitir subir (negativo) y bajar (positivo)
      setDragOffset(diff)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    const diff = currentY.current - startY.current

    if (isExpanded) {
      // Si está expandido y se arrastra hacia abajo
      if (diff > DRAG_THRESHOLD) {
        setIsExpanded(false)
      } else if (diff > expandedHeight * 0.4) {
        // Si se arrastra mucho, cerrar
        handleClose()
        return
      }
    } else {
      // Si está collapsed
      if (diff < -DRAG_THRESHOLD) {
        setIsExpanded(true)
      } else if (diff > DRAG_THRESHOLD) {
        handleClose()
        return
      }
    }

    setDragOffset(0)
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  // Calcular altura actual
  const baseHeight = isExpanded ? expandedHeight : COLLAPSED_HEIGHT
  const currentHeight = Math.max(80, baseHeight - dragOffset)

  return (
    <>
      {/* Overlay oscuro cuando está expandido */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[1001] transition-opacity duration-300"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            opacity: isVisible ? 1 : 0
          }}
          onClick={handleClose}
        />
      )}

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="fixed left-0 right-0 bottom-0 z-[1002] transition-all"
        style={{
          height: `${currentHeight}px`,
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transitionDuration: isDragging ? '0ms' : '300ms',
          transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)'
        }}
      >
        <div
          className="h-full flex flex-col"
          style={{
            background: 'var(--bg-card)',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}
        >
          {/* Handle de arrastre */}
          <div
            className="flex-shrink-0 flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => !isDragging && setIsExpanded(!isExpanded)}
          >
            <div
              style={{
                width: '36px',
                height: '5px',
                borderRadius: '3px',
                background: 'var(--border)'
              }}
            />
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-hidden">
            {!isExpanded ? (
              /* Vista Compacta */
              <div className="px-4 pb-4">
                <div className="flex gap-4">
                  {/* Imagen miniatura */}
                  <div
                    className="flex-shrink-0 overflow-hidden"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '14px'
                    }}
                  >
                    {puesto.foto_url ? (
                      <img
                        src={puesto.foto_url}
                        alt={puesto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-3xl"
                        style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--border) 100%)' }}
                      >
                        {FOOD_EMOJIS[puesto.tipo_comida] || FOOD_EMOJIS.default}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-1">
                    {/* Nombre */}
                    <h3
                      className="truncate mb-1"
                      style={{
                        fontSize: '17px',
                        fontWeight: '600',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {puesto.nombre}
                    </h3>

                    {/* Categoría */}
                    <p
                      className="mb-2"
                      style={{
                        fontSize: '14px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {puesto.tipo_comida || 'Comida'}
                    </p>

                    {/* Rating y distancia */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={promedio} size={14} />
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {promedio > 0 ? promedio.toFixed(1) : '–'}
                        </span>
                      </div>

                      {distancia && (
                        <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                          <MapPinIcon />
                          <span
                            style={{
                              fontSize: '13px',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
                            }}
                          >
                            {distancia}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón expandir */}
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="flex-shrink-0 self-center transition-all active:scale-95"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: 'rotate(180deg)'
                    }}
                  >
                    <ChevronDownIcon />
                  </button>
                </div>
              </div>
            ) : (
              /* Vista Expandida */
              <div className="h-full overflow-y-auto overscroll-contain">
                {/* Imagen */}
                <div
                  className="relative w-full overflow-hidden"
                  style={{ height: '140px' }}
                >
                  {puesto.foto_url ? (
                    <img
                      src={puesto.foto_url}
                      alt={puesto.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-6xl"
                      style={{ background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)' }}
                    >
                      {FOOD_EMOJIS[puesto.tipo_comida] || FOOD_EMOJIS.default}
                    </div>
                  )}

                  {/* Botón cerrar */}
                  <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 transition-all active:scale-95"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.4)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

                  {/* Badge de categoría */}
                  <div
                    className="absolute bottom-3 left-3"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {puesto.tipo_comida || 'Comida'}
                  </div>
                </div>

                {/* Contenido expandido */}
                <div className="px-4 py-3">
                  {/* Nombre */}
                  <h2
                    className="mb-2"
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                      color: 'var(--text-primary)',
                      lineHeight: '1.2'
                    }}
                  >
                    {puesto.nombre}
                  </h2>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating rating={promedio} size={16} />
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {promedio > 0 ? promedio.toFixed(1) : '–'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      • {puesto.total_resenas || 0} resenas
                    </span>
                  </div>

                  {/* Info pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {distancia && (
                      <div
                        className="flex items-center gap-1 px-2 py-1"
                        style={{
                          borderRadius: '16px',
                          background: 'var(--bg-secondary)',
                          fontSize: '12px',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <MapPinIcon />
                        <span>{distancia}</span>
                      </div>
                    )}

                    {abierto !== null && (
                      <div
                        className="flex items-center gap-1 px-2 py-1"
                        style={{
                          borderRadius: '16px',
                          background: abierto ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          fontSize: '12px',
                          color: abierto ? 'var(--state-success)' : 'var(--state-error)',
                          fontWeight: '500'
                        }}
                      >
                        <ClockIcon />
                        <span>{abierto ? 'Abierto' : 'Cerrado'}</span>
                      </div>
                    )}

                    {puesto.horario_apertura && puesto.horario_cierre && (
                      <div
                        className="flex items-center gap-1 px-2 py-1"
                        style={{
                          borderRadius: '16px',
                          background: 'var(--bg-secondary)',
                          fontSize: '12px',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <span>{puesto.horario_apertura} - {puesto.horario_cierre}</span>
                      </div>
                    )}
                  </div>

                  {/* Descripción */}
                  {puesto.descripcion && (
                    <p
                      className="mb-3 line-clamp-2"
                      style={{
                        fontSize: '13px',
                        lineHeight: '1.5',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {puesto.descripcion}
                    </p>
                  )}

                  {/* Botón de acción */}
                  <button
                    onClick={() => onViewMore(puesto)}
                    className="w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    style={{
                      height: '44px',
                      borderRadius: '12px',
                      background: 'var(--primary)',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '600',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
                    }}
                  >
                    <span>Ver detalles</span>
                    <ArrowRightIcon />
                  </button>

                  {/* Espacio para safe area */}
                  <div className="h-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
