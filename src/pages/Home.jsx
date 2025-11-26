import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Mapa from '../components/Mapa'
import ListaPuestos from '../components/ListaPuestos'

export default function Home() {
  const navigate = useNavigate()
  const [userLocation, setUserLocation] = useState(null)
  const [puestos, setPuestos] = useState([])
  const [mapCenter, setMapCenter] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')

  const handlePuestoClick = (puesto) => {
    // Navegar a la página de detalle
    navigate(`/puesto/${puesto.id}`)
  }

  // Filtrar puestos para el mapa (por tipo y búsqueda)
  let puestosFiltrados = puestos

  // Filtrar por tipo
  if (filtroTipo !== 'Todos') {
    puestosFiltrados = puestosFiltrados.filter(p => p.tipo_comida === filtroTipo)
  }

  // Filtrar por búsqueda
  if (busqueda && busqueda.trim()) {
    const busquedaLower = busqueda.toLowerCase().trim()
    puestosFiltrados = puestosFiltrados.filter(p =>
      p.nombre.toLowerCase().includes(busquedaLower) ||
      (p.tipo_comida && p.tipo_comida.toLowerCase().includes(busquedaLower)) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(busquedaLower))
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Mapa - 70% de la pantalla */}
      <div className="h-[70vh]">
        <Mapa
          userLocation={userLocation}
          onUserLocationChange={setUserLocation}
          puestos={puestosFiltrados}
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
          filtroTipo={filtroTipo}
          onFiltroChange={setFiltroTipo}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
        />
      </div>
    </div>
  )
}
