import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Coordenadas por defecto (CDMX)
const CDMX_COORDS = [19.4326, -99.1332]

// Iconos para tipos de comida
const tipoIconos = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌽',
  'Bebidas': '🥤',
  'Postres': '🍮'
}

// Crear un ícono personalizado con efecto glow para el usuario
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="12" fill="#ADFF00" filter="url(#glow)" opacity="0.3"/>
      <circle cx="20" cy="20" r="8" fill="#ADFF00" stroke="#0D0D0D" stroke-width="3"/>
      <circle cx="20" cy="20" r="3" fill="#0D0D0D"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
})

// Crear un ícono ámbar con glow para los puestos
const puestoIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" width="40" height="48">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FBBF24"/>
          <stop offset="100%" style="stop-color:#D97706"/>
        </linearGradient>
      </defs>
      <path d="M20 4 L4 12 v16 c0 8 5.5 15.5 13 17.3 L20 46 l3-0.7 c7.5-1.8 13-9.3 13-17.3 V12 L20 4z"
            fill="url(#grad)" stroke="#0D0D0D" stroke-width="2" filter="url(#glow)"/>
      <circle cx="20" cy="20" r="6" fill="#0D0D0D"/>
      <circle cx="20" cy="20" r="3" fill="#FFB800"/>
    </svg>
  `),
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -48]
})

// Componente para centrar el mapa cuando cambia la ubicación
function MapUpdater({ center }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView(center, 15)
    }
  }, [center, map])

  return null
}

export default function Mapa({ userLocation, onUserLocationChange, puestos, mapCenter, onPuestoClick }) {
  const [initialCenter, setInitialCenter] = useState(CDMX_COORDS)
  const [permissionDenied, setPermissionDenied] = useState(false)

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

  return (
    <div className="relative w-full h-full">
      {/* Alerta de ubicación denegada con nuevo estilo */}
      {permissionDenied && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] max-w-sm w-[90%]">
          <div className="flex items-center gap-3 px-4 py-3 bg-ambar-500/20 backdrop-blur-md border border-ambar-500/40 rounded-xl shadow-lg animate-slide-down">
            <div className="w-8 h-8 bg-ambar-500/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-ambar-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <p className="text-sm text-ambar-200">
              Mostrando <span className="font-semibold">CDMX</span> por defecto
            </p>
          </div>
        </div>
      )}

      <MapContainer
        center={initialCenter}
        zoom={13}
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
                <p className="font-display font-bold text-crema-50 text-base">Tu ubicación</p>
                <p className="text-xs text-crema-100/60 mt-1 font-mono">
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
                  <div className="min-w-[180px] p-1">
                    {/* Header con icono */}
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-2xl">
                        {tipoIconos[puesto.tipo_comida] || '🍽️'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-crema-50 text-base leading-tight">
                          {puesto.nombre}
                        </h3>
                        {puesto.tipo_comida && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-ambar-500/20 text-ambar-400 text-xs font-medium rounded-full">
                            {puesto.tipo_comida}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Descripción */}
                    {puesto.descripcion && (
                      <p className="text-xs text-crema-100/60 mb-3 line-clamp-2 leading-relaxed">
                        {puesto.descripcion}
                      </p>
                    )}

                    {/* Botón de ver detalles */}
                    {onPuestoClick && (
                      <button
                        onClick={() => onPuestoClick(puesto)}
                        className="w-full bg-gradient-to-r from-ambar-500 to-ambar-600 text-noche-900 text-sm font-semibold px-4 py-2 rounded-lg hover:shadow-glow-ambar transition-all active:scale-95"
                      >
                        Ver detalles
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

      {/* Indicador de cantidad de puestos */}
      {puestos.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000]">
          <div className="flex items-center gap-2 px-3 py-2 bg-noche-800/90 backdrop-blur-md border border-noche-600/50 rounded-xl shadow-lg">
            <div className="w-2 h-2 bg-ambar-400 rounded-full animate-pulse" />
            <span className="text-sm text-crema-100 font-medium">
              <span className="text-ambar-400 font-bold">{puestos.length}</span> puestos cerca
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
