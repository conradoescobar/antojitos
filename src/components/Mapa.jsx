import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Coordenadas por defecto (CDMX)
const CDMX_COORDS = [19.4326, -99.1332]

// Colores del nuevo sistema de diseño
const COLORS = {
  primary: '#FF6F3C',
  primaryHover: '#E5633A',
  gray900: '#1A1A1A',
  gray400: '#A1A1A2',
  white: '#FFFFFF'
}

// Marcador del usuario - estilo minimalista con pulso
const createUserIcon = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
    <defs>
      <filter id="userShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.12"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="18" fill="${COLORS.primary}" fill-opacity="0.12">
      <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1"/>
      <animate attributeName="fill-opacity" values="0.15;0.06;0.15" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1"/>
    </circle>
    <circle cx="24" cy="24" r="9" fill="${COLORS.primary}" filter="url(#userShadow)"/>
    <circle cx="24" cy="24" r="3.5" fill="white"/>
  </svg>`

  return new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(svg),
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  })
}

// Emojis por tipo de comida
const FOOD_EMOJIS = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌯',
  'Bebidas': '🥤',
  'Postres': '🍮',
  'Otro': '🍽️',
  'default': '🌮'
}

// Crear icono con emoji - estilo Uber
const createFoodIcon = (tipoComida, isSelected = false) => {
  const emoji = FOOD_EMOJIS[tipoComida] || FOOD_EMOJIS['default']
  const size = isSelected ? 52 : 44
  const fontSize = isSelected ? 26 : 22
  const borderColor = isSelected ? COLORS.primary : '#E8E8E9'
  const shadowOpacity = isSelected ? '0.2' : '0.1'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
      <filter id="markerShadow${isSelected ? 'Active' : ''}" x="-50%" y="-20%" width="200%" height="200%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="${shadowOpacity}"/>
      </filter>
    </defs>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 3}" fill="white" filter="url(#markerShadow${isSelected ? 'Active' : ''})" stroke="${borderColor}" stroke-width="${isSelected ? 2.5 : 1.5}"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}">${emoji}</text>
  </svg>`

  return new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(svg),
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    className: isSelected ? 'marker-selected' : 'marker-default'
  })
}

// Cache de iconos para mejor rendimiento
const iconCache = {}

const getFoodIcon = (tipoComida, isSelected = false) => {
  const key = `${tipoComida || 'default'}-${isSelected}`
  if (!iconCache[key]) {
    iconCache[key] = createFoodIcon(tipoComida, isSelected)
  }
  return iconCache[key]
}

const userIcon = createUserIcon()

// Componente para manejar eventos del mapa
function MapController({ center, userLocation, selectedPuesto, onMapClick }) {
  const map = useMap()

  useMapEvents({
    click: () => {
      onMapClick()
    }
  })

  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { animate: true, duration: 0.4 })
    }
  }, [center, map])

  useEffect(() => {
    if (userLocation && !center) {
      map.flyTo(userLocation, 17, { animate: true, duration: 0.6 })
    }
  }, [userLocation, map, center])

  useEffect(() => {
    if (selectedPuesto) {
      const offset = map.getSize().y * 0.15
      const targetPoint = map.project([selectedPuesto.latitud, selectedPuesto.longitud], map.getZoom())
      targetPoint.y -= offset
      const targetLatLng = map.unproject(targetPoint, map.getZoom())
      map.flyTo(targetLatLng, Math.max(map.getZoom(), 16), { animate: true, duration: 0.3 })
    }
  }, [selectedPuesto, map])

  return null
}

// Componente de estrellas - estilo minimalista
function StarRating({ rating, size = 14 }) {
  const stars = []
  const fullStars = Math.floor(rating || 0)
  const hasHalf = (rating || 0) - fullStars >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={COLORS.primary} stroke={COLORS.primary} strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="1">
          <defs>
            <linearGradient id={`half-${i}`}>
              <stop offset="50%" stopColor={COLORS.primary} />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={`url(#half-${i})`} />
        </svg>
      )
    } else {
      stars.push(
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#D4D4D5" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    }
  }
  return <div className="flex gap-0.5">{stars}</div>
}

// Bottom Sheet flotante - estilo Uber/Airbnb
function FloatingCard({ puesto, onClose, onViewMore }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  // Calcular promedio de estrellas
  const calcularPromedio = () => {
    const campos = ['sabor', 'precio', 'higiene', 'cantidad', 'atencion']
    const valores = campos.map(c => puesto[c]).filter(v => v != null && v > 0)
    if (valores.length === 0) return 0
    return valores.reduce((a, b) => a + b, 0) / valores.length
  }

  const promedio = calcularPromedio()

  return (
    <div
      className="absolute left-4 right-4 z-[1000] pointer-events-none"
      style={{ bottom: '100px' }}
    >
      <div
        className="pointer-events-auto mx-auto transition-all duration-300 ease-out"
        style={{
          maxWidth: '280px',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          background: 'var(--white)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Foto con overlay degradado */}
        <div className="relative w-full h-28 overflow-hidden">
          {puesto.foto_url ? (
            <>
              <img
                src={puesto.foto_url}
                alt={puesto.nombre}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }}
              />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-4xl"
              style={{ background: 'var(--gray-100)' }}
            >
              {FOOD_EMOJIS[puesto.tipo_comida] || '🌮'}
            </div>
          )}

          {/* Badge tipo de comida */}
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: 'var(--gray-900)',
              backdropFilter: 'blur(8px)'
            }}
          >
            {FOOD_EMOJIS[puesto.tipo_comida] || '🍽️'} {puesto.tipo_comida || 'Comida'}
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Nombre */}
          <h3
            className="font-semibold text-[15px] leading-tight truncate mb-2"
            style={{ color: 'var(--gray-900)' }}
          >
            {puesto.nombre}
          </h3>

          {/* Rating y distancia */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <StarRating rating={promedio} size={12} />
              {promedio > 0 && (
                <span className="text-[13px] font-medium" style={{ color: 'var(--gray-600)' }}>
                  {promedio.toFixed(1)}
                </span>
              )}
            </div>
            {promedio === 0 && (
              <span className="text-[12px]" style={{ color: 'var(--gray-400)' }}>
                Sin reseñas
              </span>
            )}
          </div>

          {/* Botón Ver detalles */}
          <button
            onClick={() => onViewMore(puesto)}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              background: 'var(--gray-900)',
              color: 'var(--white)'
            }}
          >
            <span className="text-[14px] font-semibold">Ver detalles</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Botón de ubicación - estilo Uber
function LocationButton({ onClick, hasLocation }) {
  return (
    <button
      onClick={onClick}
      className="absolute z-[1000] transition-all duration-200 ease-out active:scale-95"
      style={{
        bottom: '24px',
        right: '16px',
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: 'var(--white)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={hasLocation ? COLORS.primary : 'none'}
        stroke={hasLocation ? COLORS.primary : COLORS.gray400}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        <circle cx="12" cy="12" r="8" fill="none" strokeWidth="1.5" />
      </svg>
    </button>
  )
}

export default function Mapa({ userLocation, onUserLocationChange, puestos, mapCenter, onPuestoClick }) {
  const [initialCenter, setInitialCenter] = useState(CDMX_COORDS)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [selectedPuesto, setSelectedPuesto] = useState(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const location = [latitude, longitude]
          onUserLocationChange(location)
          setInitialCenter(location)
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error)
          setPermissionDenied(true)
          setInitialCenter(CDMX_COORDS)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    } else {
      setPermissionDenied(true)
      setInitialCenter(CDMX_COORDS)
    }
  }, [onUserLocationChange])

  const handleMarkerClick = (puesto) => {
    setSelectedPuesto(puesto)
  }

  const handleMapClick = () => {
    setSelectedPuesto(null)
  }

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(userLocation, 17, { animate: true, duration: 0.4 })
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--gray-100)' }}>
      {/* Aviso de ubicación - estilo minimalista */}
      {permissionDenied && (
        <div
          className="absolute top-4 left-4 right-4 z-[1000] animate-fade-in"
          style={{ maxWidth: '320px', margin: '0 auto' }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--primary-light)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold" style={{ color: 'var(--gray-900)' }}>
                  Ubicación no disponible
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--gray-400)' }}>
                  Mostrando Ciudad de México
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={initialCenter}
        zoom={15}
        className="w-full h-full"
        zoomControl={false}
        ref={mapRef}
        style={{ background: 'var(--gray-100)' }}
      >
        <MapController
          center={mapCenter}
          userLocation={userLocation}
          selectedPuesto={selectedPuesto}
          onMapClick={handleMapClick}
        />

        {/* Mapa estilo Apple - Jawg Light */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        {/* Marcador del usuario */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon} />
        )}

        {/* Marcadores de puestos */}
        {puestos.map((puesto) => {
          if (puesto.latitud && puesto.longitud) {
            const isSelected = selectedPuesto?.id === puesto.id
            return (
              <Marker
                key={puesto.id}
                position={[puesto.latitud, puesto.longitud]}
                icon={getFoodIcon(puesto.tipo_comida, isSelected)}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.stopPropagation()
                    handleMarkerClick(puesto)
                  }
                }}
              />
            )
          }
          return null
        })}
      </MapContainer>

      {/* Botón de ubicación */}
      <LocationButton
        onClick={handleCenterOnUser}
        hasLocation={!!userLocation}
      />

      {/* Mini card flotante */}
      {selectedPuesto && (
        <FloatingCard
          puesto={selectedPuesto}
          onClose={() => setSelectedPuesto(null)}
          onViewMore={(puesto) => {
            setSelectedPuesto(null)
            onPuestoClick(puesto)
          }}
        />
      )}
    </div>
  )
}
