import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import PlacePreviewSheet from './PlacePreviewSheet'

// Coordenadas por defecto (CDMX)
const CDMX_COORDS = [19.4326, -99.1332]

// Marcador del usuario - estilo Apple con pulso suave
const createUserIcon = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
    <defs>
      <filter id="userShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.15"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="20" fill="#007AFF" fill-opacity="0.12">
      <animate attributeName="r" values="16;20;16" dur="2.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1"/>
      <animate attributeName="fill-opacity" values="0.2;0.08;0.2" dur="2.5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1"/>
    </circle>
    <circle cx="24" cy="24" r="10" fill="#007AFF" filter="url(#userShadow)"/>
    <circle cx="24" cy="24" r="4" fill="white"/>
  </svg>`

  return new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(svg),
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  })
}

// Colores por categoría de comida
const CATEGORY_COLORS = {
  'Tacos': '#E85D04',
  'Tortas': '#F48C06',
  'Quesadillas': '#FAA307',
  'Tamales': '#DC2F02',
  'Antojitos': '#D97757',
  'Bebidas': '#0077B6',
  'Postres': '#9D4EDD',
  'Otro': '#6B7280',
  'default': '#D97757'
}

// Iconos SVG por categoría (paths minimalistas)
const CATEGORY_ICONS = {
  'Tacos': `<path d="M4 14c0-4 4-8 8-8s8 4 8 8" stroke-width="2" stroke-linecap="round"/><path d="M6 14h12" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="11" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/>`,
  'Tortas': `<rect x="5" y="8" width="14" height="8" rx="4" stroke-width="2"/><line x1="5" y1="12" x2="19" y2="12" stroke-width="2"/>`,
  'Quesadillas': `<path d="M12 6L4 14h16L12 6z" stroke-width="2" stroke-linejoin="round"/><path d="M7 12h10" stroke-width="1.5" stroke-dasharray="2 2"/>`,
  'Tamales': `<rect x="8" y="4" width="8" height="16" rx="2" stroke-width="2"/><line x1="8" y1="8" x2="16" y2="8" stroke-width="1.5"/><line x1="8" y1="16" x2="16" y2="16" stroke-width="1.5"/>`,
  'Antojitos': `<circle cx="12" cy="12" r="6" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/>`,
  'Bebidas': `<path d="M8 4h8l-1 14H9L8 4z" stroke-width="2" stroke-linejoin="round"/><path d="M6 4h12" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="8" x2="12" y2="12" stroke-width="1.5"/>`,
  'Postres': `<path d="M8 14c0-4 1.5-6 4-6s4 2 4 6" stroke-width="2"/><rect x="7" y="14" width="10" height="4" rx="1" stroke-width="2"/><circle cx="12" cy="8" r="1.5" fill="currentColor"/>`,
  'Otro': `<circle cx="12" cy="10" r="3" stroke-width="2"/><path d="M12 13v5" stroke-width="2" stroke-linecap="round"/>`,
  'default': `<circle cx="12" cy="10" r="3" stroke-width="2"/><path d="M12 13v5" stroke-width="2" stroke-linecap="round"/>`
}

// Crear pin moderno estilo drop-pin
const createMapPin = (tipoComida, isSelected = false) => {
  const color = CATEGORY_COLORS[tipoComida] || CATEGORY_COLORS['default']
  const iconPath = CATEGORY_ICONS[tipoComida] || CATEGORY_ICONS['default']

  // Tamaños
  const width = isSelected ? 36 : 30
  const height = isSelected ? 44 : 36
  const iconSize = isSelected ? 18 : 15

  // Pin con forma de gota moderna
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <filter id="pinShadow${isSelected ? 'Sel' : ''}" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="${isSelected ? '2' : '1.5'}" flood-color="#000" flood-opacity="${isSelected ? '0.25' : '0.15'}"/>
      </filter>
    </defs>

    <!-- Pin shape - drop/teardrop moderna -->
    <path
      d="M${width/2} ${height - 4}
         C${width/2} ${height - 4} ${width - 3} ${height * 0.55} ${width - 3} ${width/2}
         C${width - 3} ${width/2 - (width/2 - 3)} ${width/2 + (width/2 - 3)} 3 ${width/2} 3
         C${width/2 - (width/2 - 3)} 3 3 ${width/2 - (width/2 - 3)} 3 ${width/2}
         C3 ${height * 0.55} ${width/2} ${height - 4} ${width/2} ${height - 4}Z"
      fill="${color}"
      filter="url(#pinShadow${isSelected ? 'Sel' : ''})"
    />

    <!-- Círculo interior para el icono -->
    <circle
      cx="${width/2}"
      cy="${width/2}"
      r="${iconSize/2 + 4}"
      fill="white"
      fill-opacity="0.95"
    />

    <!-- Icono de categoría -->
    <g
      transform="translate(${(width - iconSize)/2}, ${(width - iconSize)/2}) scale(${iconSize/24})"
      fill="none"
      stroke="${color}"
      stroke-width="2"
    >
      ${iconPath}
    </g>
  </svg>`

  return new L.Icon({
    iconUrl: 'data:image/svg+xml,' + encodeURIComponent(svg),
    iconSize: [width, height],
    iconAnchor: [width/2, height],
    className: isSelected ? 'map-pin-selected' : 'map-pin-default'
  })
}

// Cache de iconos para mejor rendimiento
const pinCache = {}

const getMapPin = (tipoComida, isSelected = false) => {
  const key = `pin-${tipoComida || 'default'}-${isSelected}`
  if (!pinCache[key]) {
    pinCache[key] = createMapPin(tipoComida, isSelected)
  }
  return pinCache[key]
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

// Componente de estrellas
function StarRating({ rating }) {
  const stars = []
  const fullStars = Math.floor(rating || 0)
  const hasHalf = (rating || 0) - fullStars >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#D97757" stroke="#D97757" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97757" strokeWidth="1">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#D97757" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half)" />
        </svg>
      )
    } else {
      stars.push(
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    }
  }
  return <div className="flex gap-0.5">{stars}</div>
}

// Mini card flotante - diseño vertical compacto
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
          width: '160px',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Foto arriba */}
        <div className="relative w-full h-24 overflow-hidden">
          {puesto.foto_url ? (
            <img
              src={puesto.foto_url}
              alt={puesto.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-3xl"
              style={{ background: 'linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%)' }}
            >
              {FOOD_EMOJIS[puesto.tipo_comida] || '🌮'}
            </div>
          )}

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l8 8M10 2l-8 8"/>
            </svg>
          </button>
        </div>

        {/* Info abajo */}
        <div className="p-3">
          {/* Nombre */}
          <h3
            className="font-semibold text-sm leading-tight truncate mb-1"
            style={{ color: '#1d1d1f' }}
          >
            {puesto.nombre}
          </h3>

          {/* Estrellas */}
          <div className="flex items-center gap-1 mb-2">
            <StarRating rating={promedio} />
            {promedio > 0 && (
              <span className="text-xs font-medium" style={{ color: '#666' }}>
                {promedio.toFixed(1)}
              </span>
            )}
          </div>

          {/* Botón + */}
          <button
            onClick={() => onViewMore(puesto)}
            className="w-full py-2 rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95"
            style={{
              background: '#D97757',
              color: 'white'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="text-xs font-medium">Ver más</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Botón de ubicación estilo Apple
function LocationButton({ onClick, hasLocation }) {
  return (
    <button
      onClick={onClick}
      className="absolute z-[1000] transition-all duration-200 ease-out hover:scale-105 active:scale-95"
      style={{
        bottom: '24px',
        right: '16px',
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={hasLocation ? '#007AFF' : '#86868b'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
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
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#f5f5f7' }}>
      {/* Aviso de ubicación - estilo Apple */}
      {permissionDenied && (
        <div
          className="absolute top-4 left-4 right-4 z-[1000] animate-fade-in-up"
          style={{ maxWidth: '360px', margin: '0 auto' }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderRadius: '14px',
              padding: '14px 16px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0, 122, 255, 0.1)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: '#1d1d1f',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                  }}
                >
                  Ubicación no disponible
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{
                    color: '#86868b',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                  }}
                >
                  Mostrando CDMX por defecto
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
        style={{ background: '#f5f5f7' }}
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
                icon={getMapPin(puesto.tipo_comida, isSelected)}
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

      {/* Bottom Sheet de previsualización */}
      {selectedPuesto && (
        <PlacePreviewSheet
          puesto={selectedPuesto}
          userLocation={userLocation}
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
