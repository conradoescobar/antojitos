import { useState } from 'react'
import Mapa from './components/Mapa'
import ListaPuestos from './components/ListaPuestos'

function App() {
  const [userLocation, setUserLocation] = useState(null)
  const [puestos, setPuestos] = useState([])
  const [mapCenter, setMapCenter] = useState(null)

  const handlePuestoClick = (puesto) => {
    if (puesto.latitud && puesto.longitud) {
      setMapCenter([puesto.latitud, puesto.longitud])
    }
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

export default App
