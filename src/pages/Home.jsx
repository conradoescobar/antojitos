import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Mapa from '../components/Mapa'
import ListaPuestos from '../components/ListaPuestos'

export default function Home() {
  const navigate = useNavigate()
  const [userLocation, setUserLocation] = useState(null)
  const [puestos, setPuestos] = useState([])
  const [mapCenter, setMapCenter] = useState(null)

  const handlePuestoClick = (puesto) => {
    // Navegar a la página de detalle
    navigate(`/puesto/${puesto.id}`)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Mapa - 70% de la pantalla */}
      <div className="h-[70vh]">
        <Mapa
          userLocation={userLocation}
          onUserLocationChange={setUserLocation}
          puestos={puestos}
          mapCenter={mapCenter}
          onPuestoClick={handlePuestoClick}
        />
      </div>

      {/* Lista de puestos - 30% de la pantalla */}
      <div className="h-[30vh]">
        <ListaPuestos
          userLocation={userLocation}
          onPuestoClick={handlePuestoClick}
          puestos={puestos}
          setPuestos={setPuestos}
        />
      </div>
    </div>
  )
}
