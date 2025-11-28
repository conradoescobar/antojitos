import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

// Crear icono con emoji
const createFoodIcon = (tipoComida, isSelected = false) => {
  const emoji = FOOD_EMOJIS[tipoComida] || FOOD_EMOJIS['default']
  const size = isSelected ? 48 : 40
  const fontSize = isSelected ? 28 : 24

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.2"/>
      </filter>
    </defs>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="white" filter="url(#shadow)" stroke="${isSelected ? '#D97757' : '#e5e5e5'}" stroke-width="${isSelected ? 3 : 2}"/>
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

// Mini card flotante estilo Apple
function FloatingCard({ puesto, onClose, onViewMore }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 200)
  }

  return (
    <div
      className="absolute left-4 right-4 z-[1000] pointer-events-none"
      style={{ bottom: '100px' }}
    >
      <div
        className="pointer-events-auto mx-auto transition-all duration-300 ease-out"
        style={{
          maxWidth: '340px',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-stretch">
          {/* Foto */}
          <div className="flex-shrink-0 w-24 h-24 relative overflow-hidden">
            {puesto.foto_url ? (
              <img
                src={puesto.foto_url}
                alt={puesto.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="1.5">
                  <path d="M21 15V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V15" strokeLinecap="round"/>
                  <path d="M12 3V15M12 15L8 11M12 15L16 11" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-3.5 flex flex-col justify-center min-w-0">
            <h3
              className="font-semibold text-base leading-tight truncate"
              style={{
                color: '#1d1d1f',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                letterSpacing: '-0.01em'
              }}
            >
              {puesto.nombre}
            </h3>

            <div className="flex items-center gap-2 mt-1.5">
              {puesto.tipo_comida && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(232, 83, 60, 0.1)',
                    color: '#E8533C'
                  }}
                >
                  {puesto.tipo_comida}
                </span>
              )}
            </div>

            <button
              onClick={() => onViewMore(puesto)}
              className="mt-2.5 text-sm font-medium transition-opacity hover:opacity-70 text-left"
              style={{
                color: '#007AFF',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}
            >
              Ver detalles
            </button>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'rgba(0, 0, 0, 0.06)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#86868b" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 2l8 8M10 2l-8 8"/>
            </svg>
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
