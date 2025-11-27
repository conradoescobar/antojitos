import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Default coords (CDMX)
const CDMX_COORDS = [19.4326, -99.1332]

const tipoEmojis = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌶️',
  'Bebidas': '🥤',
  'Postres': '🍮',
  'Otro': '🍽️'
}

// Neon user icon
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="25" cy="25" r="20" fill="#00F5D4" opacity="0.2">
        <animate attributeName="r" values="15;22;15" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="25" cy="25" r="12" fill="#00F5D4" filter="url(#glow)"/>
      <circle cx="25" cy="25" r="5" fill="#0A0A0F"/>
    </svg>
  `),
  iconSize: [50, 50],
  iconAnchor: [25, 25],
  popupAnchor: [0, -25]
})

// Neon puesto icon
const puestoIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 65" width="50" height="65">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF2E63"/>
          <stop offset="100%" style="stop-color:#FF6B35"/>
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M25 3C12 3 2 13 2 25c0 18 23 37 23 37s23-19 23-37C48 13 38 3 25 3z"
            fill="url(#grad)" filter="url(#glow)"/>
      <circle cx="25" cy="23" r="10" fill="#0A0A0F"/>
      <text x="25" y="28" text-anchor="middle" font-size="14">🌮</text>
    </svg>
  `),
  iconSize: [50, 65],
  iconAnchor: [25, 65],
  popupAnchor: [0, -65]
})

// Map updater component
function MapUpdater({ center }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 1.5 })
    }
  }, [center, map])

  return null
}

export default function Mapa({ userLocation, onUserLocationChange, puestos, mapCenter, onPuestoClick }) {
  const [initialCenter, setInitialCenter] = useState(CDMX_COORDS)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isLocating, setIsLocating] = useState(true)
  const mapRef = useRef(null)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const location = [latitude, longitude]
          onUserLocationChange(location)
          setInitialCenter(location)
          setIsLocating(false)
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error)
          setPermissionDenied(true)
          setInitialCenter(CDMX_COORDS)
          setIsLocating(false)
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
      setIsLocating(false)
    }
  }, [onUserLocationChange])

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(userLocation, 16, {
        duration: 0.8,
        easeLinearity: 0.25
      })
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Permission denied message */}
      {permissionDenied && (
        <div className="absolute top-4 left-4 right-4 z-[1000] glass-dark rounded-2xl px-4 py-3 border border-[var(--neon-yellow)]/30 animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--neon-yellow)]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📍</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--neon-yellow)]">
                Ubicación no disponible
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Mostrando CDMX por defecto
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLocating && (
        <div className="absolute top-4 left-4 right-4 z-[1000] glass-dark rounded-2xl px-4 py-3 border border-[var(--neon-cyan)]/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--neon-cyan)]/10 flex items-center justify-center flex-shrink-0">
              <div className="w-5 h-5 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin" style={{ boxShadow: 'var(--glow-cyan)' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--neon-cyan)]">
                Buscando tu ubicación...
              </p>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={initialCenter}
        zoom={14}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
      >
        <MapUpdater center={mapCenter} />
        <ZoomControl position="bottomright" />

        {/* Dark map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        {/* User marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center p-3 min-w-[150px]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-cyan)]/50 flex items-center justify-center mx-auto mb-2" style={{ boxShadow: 'var(--glow-cyan)' }}>
                  <span className="text-xl">📍</span>
                </div>
                <p className="font-display text-lg text-[var(--neon-cyan)]">TU UBICACIÓN</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Puesto markers */}
        {puestos.map((puesto) => {
          if (puesto.latitud && puesto.longitud) {
            return (
              <Marker
                key={puesto.id}
                position={[puesto.latitud, puesto.longitud]}
                icon={puestoIcon}
              >
                <Popup>
                  <div className="min-w-[220px] max-w-[280px]">
                    {/* Image */}
                    {puesto.foto_url ? (
                      <img
                        src={puesto.foto_url}
                        alt={puesto.nombre}
                        className="w-full h-32 object-cover rounded-xl mb-3"
                      />
                    ) : (
                      <div className="w-full h-24 rounded-xl bg-gradient-to-br from-[var(--neon-pink)]/20 to-[var(--neon-orange)]/20 flex items-center justify-center mb-3 border border-[var(--neon-pink)]/20">
                        <span className="text-5xl">
                          {tipoEmojis[puesto.tipo_comida] || '🍽️'}
                        </span>
                      </div>
                    )}

                    {/* Name */}
                    <h3 className="font-display text-xl text-[var(--neon-pink)] mb-1 tracking-wide" style={{ textShadow: 'var(--glow-pink)' }}>
                      {puesto.nombre}
                    </h3>

                    {/* Type */}
                    {puesto.tipo_comida && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--neon-yellow)]/10 text-[var(--neon-yellow)] border border-[var(--neon-yellow)]/30 mb-2">
                        <span>{tipoEmojis[puesto.tipo_comida]}</span>
                        {puesto.tipo_comida}
                      </span>
                    )}

                    {/* Description */}
                    {puesto.descripcion && (
                      <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2">
                        {puesto.descripcion}
                      </p>
                    )}

                    {/* Button */}
                    {onPuestoClick && (
                      <button
                        onClick={() => onPuestoClick(puesto)}
                        className="w-full py-3 rounded-xl font-display text-sm tracking-widest text-[var(--night-black)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, var(--neon-pink) 0%, var(--neon-orange) 100%)',
                          boxShadow: 'var(--glow-pink)'
                        }}
                      >
                        VER DETALLES →
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          }
          return null
        })}
      </MapContainer>

      {/* Center on user button */}
      {userLocation && (
        <button
          onClick={handleCenterOnUser}
          className="absolute top-4 right-4 z-[1000] w-12 h-12 glass-dark rounded-xl flex items-center justify-center border border-white/10 hover:bg-[var(--neon-cyan)]/20 hover:border-[var(--neon-cyan)]/50 transition-all duration-300 active:scale-95"
          aria-label="Centrar en mi ubicación"
        >
          <svg className="w-5 h-5 text-[var(--neon-cyan)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        </button>
      )}

      {/* Floating counter */}
      {puestos.length > 0 && (
        <div className="absolute bottom-28 left-4 z-[1000] glass-dark rounded-2xl px-5 py-4 border border-[var(--neon-pink)]/20 animate-scale-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-orange)] flex items-center justify-center" style={{ boxShadow: 'var(--glow-pink)' }}>
              <span className="text-xl">🌮</span>
            </div>
            <div>
              <p className="text-2xl font-display text-[var(--neon-pink)]" style={{ textShadow: 'var(--glow-pink)' }}>
                {puestos.length}
              </p>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                {puestos.length === 1 ? 'Puesto cercano' : 'Puestos cercanos'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
