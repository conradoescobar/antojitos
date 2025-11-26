import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet'
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

// Marcador del usuario - punto azul moderno
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
      <circle cx="20" cy="20" r="16" fill="#3B82F6" opacity="0.15">
        <animate attributeName="r" from="12" to="18" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.25" to="0" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="20" r="8" fill="#3B82F6"/>
      <circle cx="20" cy="20" r="5" fill="#fff"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
})

// Crear marcador moderno para puestos
function createPuestoIcon(tipoComida) {
  const emoji = tipoIconos[tipoComida] || '🍽️'
  return new L.DivIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 48px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid #F97316;
        ">
          <span style="
            display: block;
            transform: rotate(45deg);
            font-size: 18px;
            text-align: center;
            line-height: 36px;
          ">${emoji}</span>
        </div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48]
  })
}

// Componente para centrar el mapa
function MapUpdater({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 16, {
        duration: 1,
        easeLinearity: 0.25
      })
    }
  }, [center, zoom, map])

  return null
}

export default function Mapa({ userLocation, onUserLocationChange, puestos, mapCenter, onPuestoClick }) {
  const [initialCenter, setInitialCenter] = useState(CDMX_COORDS)
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
          setInitialCenter(CDMX_COORDS)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
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
    <div className="relative w-full h-full bg-gray-100">
      <MapContainer
        center={initialCenter}
        zoom={16}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
      >
        <MapUpdater center={mapCenter} zoom={16} />
        <ZoomControl position="bottomright" />

        {/* Tiles claros estilo Mapbox/Uber - CartoDB Positron */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        {/* Marcador del usuario */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center py-1">
                <p className="font-medium text-gray-900 text-sm">Tu ubicación</p>
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
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-warm-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">
                          {tipoIconos[puesto.tipo_comida] || '🍽️'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                          {puesto.nombre}
                        </h3>
                        {puesto.tipo_comida && (
                          <span className="text-xs text-warm-600 font-medium">
                            {puesto.tipo_comida}
                          </span>
                        )}
                      </div>
                    </div>

                    {puesto.descripcion && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {puesto.descripcion}
                      </p>
                    )}

                    {onPuestoClick && (
                      <button
                        onClick={() => onPuestoClick(puesto)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
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
          className="absolute top-4 right-4 z-[1000] w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:bg-gray-50 active:scale-95"
          aria-label="Centrar en mi ubicación"
        >
          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        </button>
      )}

      {/* Contador de puestos */}
      {puestos.length > 0 && (
        <div className="absolute bottom-24 left-4 z-[1000]">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-md">
            <div className="w-2 h-2 bg-warm-500 rounded-full" />
            <span className="text-sm text-gray-700 font-medium">
              {puestos.length} lugares
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
