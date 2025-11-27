import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Coordenadas por defecto (CDMX)
const CDMX_COORDS = [19.4326, -99.1332]

// Emojis para tipos de comida
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

// Ícono azul pulsante para el usuario
const userIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="3" opacity="0.3">
    <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="20" cy="20" r="10" fill="#3B82F6" stroke="white" stroke-width="3"/>
  <circle cx="20" cy="20" r="4" fill="white"/>
</svg>`

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(userIconSvg),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
})

// Ícono personalizado para puestos con gradiente
const puestoIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 54" width="44" height="54">
  <defs>
    <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E63946"/>
      <stop offset="100%" style="stop-color:#FFB703"/>
    </linearGradient>
  </defs>
  <path d="M22 2C10 2 1 11 1 22c0 16 21 30 21 30s21-14 21-30C43 11 34 2 22 2z" fill="url(%23pinGrad)"/>
  <circle cx="22" cy="20" r="9" fill="white"/>
  <circle cx="22" cy="20" r="5" fill="#E63946"/>
</svg>`

const puestoIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(puestoIconSvg),
  iconSize: [44, 54],
  iconAnchor: [22, 54],
  popupAnchor: [0, -54]
})

// Componente para centrar el mapa
function MapUpdater({ center }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 1 })
    }
  }, [center, map])

  return null
}

export default function Mapa({ userLocation, onUserLocationChange, puestos, mapCenter, onPuestoClick }) {
  const [initialCenter, setInitialCenter] = useState(CDMX_COORDS)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isLocating, setIsLocating] = useState(true)

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

  return (
    <div className="relative w-full h-full">
      {/* Mensaje de ubicación denegada */}
      {permissionDenied && (
        <div className="absolute top-4 left-4 right-4 z-[1000] glass-card rounded-2xl px-4 py-3 shadow-lg animate-slide-down">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📍</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-carbon)]">
                Ubicación no disponible
              </p>
              <p className="text-xs text-gray-500">
                Mostrando Ciudad de México
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de carga */}
      {isLocating && (
        <div className="absolute top-4 left-4 right-4 z-[1000] glass-card rounded-2xl px-4 py-3 shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-carbon)]">
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
        zoomControl={true}
      >
        <MapUpdater center={mapCenter} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcador del usuario */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center p-2">
                <p className="font-bold text-[var(--color-carbon)]">Tu ubicación</p>
                <p className="text-xs text-gray-500 mt-1">
                  {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de puestos */}
        {puestos.map((puesto) => {
          if (puesto.latitud && puesto.longitud) {
            return (
              <Marker
                key={puesto.id}
                position={[puesto.latitud, puesto.longitud]}
                icon={puestoIcon}
              >
                <Popup>
                  <div className="min-w-[200px] max-w-[260px] p-3">
                    {/* Header con foto o emoji */}
                    {puesto.foto_url ? (
                      <img
                        src={puesto.foto_url}
                        alt={puesto.nombre}
                        className="w-full h-28 object-cover rounded-xl mb-3"
                      />
                    ) : (
                      <div className="w-full h-20 rounded-xl bg-gradient-to-br from-[var(--color-mango-light)] to-[var(--color-mango)] flex items-center justify-center mb-3">
                        <span className="text-4xl">
                          {tipoEmojis[puesto.tipo_comida] || '🍽️'}
                        </span>
                      </div>
                    )}

                    {/* Nombre */}
                    <h3 className="font-bold text-lg text-[var(--color-carbon)] mb-1">
                      {puesto.nombre}
                    </h3>

                    {/* Tipo de comida */}
                    {puesto.tipo_comida && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-[var(--color-mango-light)] to-[var(--color-mango)] text-xs font-semibold text-[var(--color-carbon)] mb-2">
                        <span>{tipoEmojis[puesto.tipo_comida]}</span>
                        {puesto.tipo_comida}
                      </span>
                    )}

                    {/* Descripción */}
                    {puesto.descripcion && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {puesto.descripcion}
                      </p>
                    )}

                    {/* Botón ver detalles */}
                    {onPuestoClick && (
                      <button
                        onClick={() => onPuestoClick(puesto)}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, var(--color-salsa) 0%, var(--color-mango) 100%)'
                        }}
                      >
                        Ver detalles →
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

      {/* Contador de puestos flotante */}
      {puestos.length > 0 && (
        <div className="absolute bottom-6 left-6 z-[1000] glass-card rounded-2xl px-4 py-3 shadow-lg animate-scale-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-salsa)] to-[var(--color-mango)] flex items-center justify-center">
              <span className="text-lg">🌮</span>
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-carbon)]">{puestos.length}</p>
              <p className="text-xs text-gray-500">
                {puestos.length === 1 ? 'puesto cercano' : 'puestos cercanos'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
