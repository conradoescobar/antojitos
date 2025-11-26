import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Coordenadas por defecto (CDMX)
const CDMX_COORDS = [19.4326, -99.1332]

// Crear un ícono azul personalizado para el marcador del usuario
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
})

// Componente para centrar el mapa cuando cambia la ubicación
function MapUpdater({ center }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])

  return null
}

export default function Mapa() {
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState(CDMX_COORDS)
  const [permissionDenied, setPermissionDenied] = useState(false)

  useEffect(() => {
    // Pedir permiso de geolocalización
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const location = [latitude, longitude]
          setUserLocation(location)
          setMapCenter(location)
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error)
          setPermissionDenied(true)
          // Usar CDMX como ubicación por defecto
          setMapCenter(CDMX_COORDS)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    } else {
      setPermissionDenied(true)
      setMapCenter(CDMX_COORDS)
    }
  }, [])

  return (
    <div className="relative w-full h-screen">
      {permissionDenied && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">
            No se pudo obtener tu ubicación. Mostrando Ciudad de México por defecto.
          </p>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={13}
        className="w-full h-full"
        zoomControl={true}
      >
        <MapUpdater center={mapCenter} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Tu ubicación</p>
                <p className="text-sm text-gray-600">
                  {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
