import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Coordenadas por defecto (CDMX - Zócalo)
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

// Crear un ícono moderno para el usuario (punto azul estilo Uber/Google)
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.4"/>
        </filter>
      </defs>
      <!-- Outer pulse ring -->
      <circle cx="24" cy="24" r="20" fill="#3B82F6" opacity="0.15">
        <animate attributeName="r" from="16" to="22" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <!-- Inner glow -->
      <circle cx="24" cy="24" r="12" fill="#3B82F6" opacity="0.2"/>
      <!-- Main dot -->
      <circle cx="24" cy="24" r="8" fill="#3B82F6" stroke="#fff" stroke-width="3" filter="url(#shadow)"/>
    </svg>
  `),
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24]
})

// Crear marcadores modernos para puestos (pin estilo Uber con emoji)
function createPuestoIcon(tipoComida) {
  const emoji = tipoIconos[tipoComida] || '🍽️'
  return new L.DivIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 44px;
        height: 52px;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #FFB800 0%, #D97706 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 20px;
            margin-top: -2px;
            margin-left: 2px;
          ">${emoji}</span>
        </div>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    popupAnchor: [0, -52]
  })
}

// Componente para centrar el mapa cuando cambia la ubicación
function MapUpdater({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 16, {
        duration: 1.2,
        easeLinearity: 0.25
      })
    }
  }, [center, zoom, map])

  return null
}

// Componente para botón de centrar en ubicación
function LocationButton({ userLocation, onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 z-[1000] w-11 h-11 bg-noche-800/95 backdrop-blur-md border border-noche-600/50 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-noche-700 hover:border-ambar-500/30 active:scale-95"
      aria-label="Centrar en mi ubicación"
    >
      <svg
        className={`w-5 h-5 ${userLocation ? 'text-ambar-400' : 'text-crema-100/60'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    </button>
  )
}

export default function Mapa({ userLocation, onUserLocationChange, puestos, mapCenter, onPuestoClick }) {
  const [initialCenter, setInitialCenter] = useState(CDMX_COORDS)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [mapReady, setMapReady] = useState(false)
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

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(userLocation, 16, {
        duration: 1,
        easeLinearity: 0.25
      })
    }
  }

  return (
    <div className="relative w-full h-full bg-noche-900">

      <MapContainer
        center={initialCenter}
        zoom={16}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
        whenReady={() => setMapReady(true)}
      >
        <MapUpdater center={mapCenter} zoom={16} />

        {/* Custom zoom control en la esquina inferior derecha */}
        <ZoomControl position="bottomright" />

        {/* Tiles oscuros estilo Uber (CartoDB Dark Matter) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        {/* Marcador del usuario */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup className="uber-popup">
              <div className="text-center py-1">
                <p className="font-display font-bold text-crema-50 text-sm">Tu ubicación</p>
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
                icon={createPuestoIcon(puesto.tipo_comida)}
              >
                <Popup className="uber-popup">
                  <div className="min-w-[200px]">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-ambar-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">
                          {tipoIconos[puesto.tipo_comida] || '🍽️'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-crema-50 text-base leading-tight">
                          {puesto.nombre}
                        </h3>
                        {puesto.tipo_comida && (
                          <span className="text-xs text-ambar-400 font-medium">
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

                    {/* Botón */}
                    {onPuestoClick && (
                      <button
                        onClick={() => onPuestoClick(puesto)}
                        className="w-full bg-ambar-500 hover:bg-ambar-400 text-noche-900 text-sm font-bold px-4 py-2.5 rounded-lg transition-colors active:scale-95"
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

      {/* Botón de centrar en ubicación */}
      {userLocation && (
        <button
          onClick={handleCenterOnUser}
          className="absolute top-4 right-4 z-[1000] w-11 h-11 bg-noche-800/95 backdrop-blur-md border border-noche-600/50 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-noche-700 hover:border-ambar-500/30 active:scale-95"
          aria-label="Centrar en mi ubicación"
        >
          <svg className="w-5 h-5 text-ambar-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        </button>
      )}

      {/* Indicador de cantidad de puestos */}
      {puestos.length > 0 && (
        <div className="absolute bottom-20 left-4 z-[1000]">
          <div className="flex items-center gap-2 px-3 py-2 bg-noche-800/95 backdrop-blur-md border border-noche-600/50 rounded-xl shadow-lg">
            <div className="w-2 h-2 bg-ambar-400 rounded-full animate-pulse" />
            <span className="text-sm text-crema-100 font-medium">
              <span className="text-ambar-400 font-bold">{puestos.length}</span> puestos
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
