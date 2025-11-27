import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Coordenadas por defecto (CDMX)
const CDMX_COORDS = [19.4326, -99.1332]

// Ícono para el usuario (pulso azul suave)
const userIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <circle cx="20" cy="20" r="18" fill="#D97757" fill-opacity="0.15">
    <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="fill-opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="20" cy="20" r="10" fill="#D97757" stroke="white" stroke-width="3"/>
  <circle cx="20" cy="20" r="4" fill="white"/>
</svg>`

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(userIconSvg),
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
})

// Ícono para los puestos (pin terracota)
const puestoIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" width="40" height="48">
  <path d="M20 2C12.27 2 6 8.27 6 16c0 10 14 28 14 28s14-18 14-28c0-7.73-6.27-14-14-14z"
        fill="#D97757" stroke="white" stroke-width="2"/>
  <circle cx="20" cy="16" r="6" fill="white"/>
  <circle cx="20" cy="16" r="3" fill="#D97757"/>
</svg>`

const puestoIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(puestoIconSvg),
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -48]
})

// Componente para centrar el mapa
function MapUpdater({ center }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView(center, 15, { animate: true, duration: 0.5 })
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
      {/* Aviso de ubicación */}
      {permissionDenied && (
        <div
          className="absolute top-4 left-4 right-4 z-[1000] rounded-xl px-4 py-3 animate-fade-in-up"
          style={{
            maxWidth: '400px',
            margin: '0 auto',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-light)'
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--primary-light)' }}
            >
              <svg className="w-5 h-5" style={{ color: 'var(--primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Ubicación no disponible
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Mostrando Ciudad de México por defecto
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

        {/* Mapa claro de CARTO */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Marcador del usuario */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center py-2">
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Tu ubicación
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
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                      {puesto.nombre}
                    </h3>
                    {puesto.tipo_comida && (
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-2"
                        style={{
                          background: 'var(--primary-light)',
                          color: 'var(--primary)'
                        }}
                      >
                        {puesto.tipo_comida}
                      </span>
                    )}
                    {puesto.descripcion && (
                      <p
                        className="text-xs mb-3 line-clamp-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {puesto.descripcion}
                      </p>
                    )}
                    {onPuestoClick && (
                      <button
                        onClick={() => onPuestoClick(puesto)}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{
                          background: 'var(--primary)',
                          color: 'white'
                        }}
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
    </div>
  )
}
