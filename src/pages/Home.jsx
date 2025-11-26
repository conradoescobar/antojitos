import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Mapa from '../components/Mapa'
import ListaPuestos from '../components/ListaPuestos'
import FormularioAgregarPuesto from '../components/FormularioAgregarPuesto'

export default function Home() {
  const navigate = useNavigate()
  const [userLocation, setUserLocation] = useState(null)
  const [puestos, setPuestos] = useState([])
  const [mapCenter, setMapCenter] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [vistaActiva, setVistaActiva] = useState('mapa')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const handlePuestoClick = (puesto) => {
    navigate(`/puesto/${puesto.id}`)
  }

  const handlePuestoAgregado = (nuevoPuesto) => {
    setPuestos([...puestos, nuevoPuesto])
    setMostrarFormulario(false)
  }

  // Filtrar puestos para el mapa
  let puestosFiltrados = puestos

  if (filtroTipo !== 'Todos') {
    puestosFiltrados = puestosFiltrados.filter(p => p.tipo_comida === filtroTipo)
  }

  if (busqueda && busqueda.trim()) {
    const busquedaLower = busqueda.toLowerCase().trim()
    puestosFiltrados = puestosFiltrados.filter(p =>
      p.nombre.toLowerCase().includes(busquedaLower) ||
      (p.tipo_comida && p.tipo_comida.toLowerCase().includes(busquedaLower)) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(busquedaLower))
    )
  }

  return (
    <div className="h-screen flex flex-col bg-noche-950 relative overflow-hidden">
      {/* Efectos de luz ambiental */}
      <div className="ambient-glow w-96 h-96 bg-ambar-500 -top-48 -left-48 rounded-full" />
      <div className="ambient-glow w-64 h-64 bg-rosa-500 -bottom-32 -right-32 rounded-full" />

      {/* Header con glassmorphism */}
      <header className="relative z-20">
        {/* Top bar */}
        <div className="glass-dark border-b border-noche-700/50">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Logo con efecto */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-ambar-400 to-ambar-600 rounded-xl flex items-center justify-center shadow-glow-ambar">
                    <span className="text-2xl">🌮</span>
                  </div>
                  <div className="absolute -inset-1 bg-ambar-500/20 rounded-xl blur-md -z-10" />
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold text-crema-50">
                    Antojitos<span className="text-gradient"> Cerca</span>
                  </h1>
                  <p className="text-xs text-crema-100/50 font-medium tracking-wide">
                    Comida callejera a tu alcance
                  </p>
                </div>
              </div>

              {/* Indicador de ubicación */}
              {userLocation && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-lima-500/10 border border-lima-500/30 rounded-full">
                  <div className="w-2 h-2 bg-lima-400 rounded-full animate-pulse" />
                  <span className="text-xs text-lima-400 font-medium">GPS activo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="glass-dark flex border-b border-noche-700/50">
          <button
            onClick={() => setVistaActiva('mapa')}
            className={`tab-btn ${vistaActiva === 'mapa' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Mapa
            </div>
          </button>
          <button
            onClick={() => setVistaActiva('lista')}
            className={`tab-btn ${vistaActiva === 'lista' ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Lista
            </div>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-hidden relative">
        {/* Vista de Mapa */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          vistaActiva === 'mapa'
            ? 'opacity-100 z-10 translate-x-0'
            : 'opacity-0 z-0 pointer-events-none -translate-x-4'
        }`}>
          <Mapa
            userLocation={userLocation}
            onUserLocationChange={setUserLocation}
            puestos={puestosFiltrados}
            mapCenter={mapCenter}
            onPuestoClick={handlePuestoClick}
          />
        </div>

        {/* Vista de Lista */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          vistaActiva === 'lista'
            ? 'opacity-100 z-10 translate-x-0'
            : 'opacity-0 z-0 pointer-events-none translate-x-4'
        }`}>
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

      {/* FAB - Botón flotante con efecto glow */}
      <button
        onClick={() => setMostrarFormulario(true)}
        className="fixed bottom-6 right-6 group z-30"
        aria-label="Agregar puesto"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-ambar-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />

        {/* Button */}
        <div className="relative w-16 h-16 bg-gradient-to-br from-ambar-400 to-ambar-600 rounded-full shadow-glow-ambar flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95">
          <svg className="w-7 h-7 text-noche-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>

      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setMostrarFormulario(false)}
        >
          {/* Overlay con blur */}
          <div className="absolute inset-0 bg-noche-950/80 backdrop-blur-sm" />

          {/* Modal content */}
          <div className="relative w-full max-w-lg bg-noche-800 border border-noche-600/50 rounded-t-3xl sm:rounded-2xl shadow-3xl max-h-[90vh] overflow-hidden animate-slide-up">
            {/* Header del modal */}
            <div className="sticky top-0 glass-dark border-b border-noche-600/50 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-crema-50">Agregar Puesto</h2>
                <p className="text-sm text-crema-100/50">Comparte un nuevo antojito</p>
              </div>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-noche-600/50 transition-colors text-crema-100/60 hover:text-crema-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <FormularioAgregarPuesto
                onPuestoAgregado={handlePuestoAgregado}
                onCancelar={() => setMostrarFormulario(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Noise overlay sutil */}
      <div className="noise-overlay" />
    </div>
  )
}
