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

  // Filtrar puestos
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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header con diseño mexicano moderno */}
      <header className="relative z-20 glass-card border-b-0 rounded-b-[2rem] overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 pattern-dots opacity-50" />
        
        <div className="relative px-5 pt-6 pb-4">
          <div className="flex items-center justify-between">
            {/* Logo y título */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-salsa)] to-[var(--color-mango)] flex items-center justify-center shadow-lg animate-float">
                  <span className="text-3xl">🌮</span>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-salsa)] to-[var(--color-mango)] blur-xl opacity-40 -z-10" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold gradient-text">
                  Antojitos Cerca
                </h1>
                <p className="text-sm text-gray-500 font-medium tracking-wide">
                  🔥 Encuentra tu antojo
                </p>
              </div>
            </div>

            {/* Stats badge */}
            <div className="glass-card px-4 py-2 rounded-2xl">
              <p className="text-xs text-gray-500 font-medium">Puestos</p>
              <p className="text-xl font-bold text-[var(--color-carbon)]">{puestos.length}</p>
            </div>
          </div>
        </div>

        {/* Navigation tabs con diseño moderno */}
        <div className="relative flex mx-4 mb-4 p-1.5 rounded-2xl bg-white/60 backdrop-blur-sm shadow-inner">
          <button
            onClick={() => setVistaActiva('mapa')}
            className={`nav-tab rounded-xl transition-all duration-300 ${
              vistaActiva === 'mapa'
                ? 'bg-gradient-to-r from-[var(--color-salsa)] to-[var(--color-mango)] text-white shadow-lg'
                : 'text-gray-600 hover:text-[var(--color-salsa)]'
            }`}
          >
            <div className="flex items-center justify-center gap-2 py-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="font-semibold">Mapa</span>
            </div>
          </button>
          <button
            onClick={() => setVistaActiva('lista')}
            className={`nav-tab rounded-xl transition-all duration-300 ${
              vistaActiva === 'lista'
                ? 'bg-gradient-to-r from-[var(--color-salsa)] to-[var(--color-mango)] text-white shadow-lg'
                : 'text-gray-600 hover:text-[var(--color-salsa)]'
            }`}
          >
            <div className="flex items-center justify-center gap-2 py-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="font-semibold">Lista</span>
            </div>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-hidden relative -mt-4">
        {/* Vista de Mapa */}
        <div 
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            vistaActiva === 'mapa' 
              ? 'opacity-100 translate-x-0 z-10' 
              : 'opacity-0 -translate-x-full z-0 pointer-events-none'
          }`}
        >
          <div className="h-full p-4 pt-6">
            <div className="h-full rounded-3xl overflow-hidden shadow-2xl">
              <Mapa
                userLocation={userLocation}
                onUserLocationChange={setUserLocation}
                puestos={puestosFiltrados}
                mapCenter={mapCenter}
                onPuestoClick={handlePuestoClick}
              />
            </div>
          </div>
        </div>

        {/* Vista de Lista */}
        <div 
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            vistaActiva === 'lista' 
              ? 'opacity-100 translate-x-0 z-10' 
              : 'opacity-0 translate-x-full z-0 pointer-events-none'
          }`}
        >
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

      {/* FAB - Botón flotante con animación */}
      <button
        onClick={() => setMostrarFormulario(true)}
        className="fab bottom-8 right-6 animate-pulse-glow"
        aria-label="Agregar puesto"
      >
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Tooltip del FAB */}
      <div className="fixed bottom-10 right-24 z-40 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="glass-card px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-carbon)] whitespace-nowrap">
          Agregar nuevo puesto
        </div>
      </div>

      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <div 
          className="modal-overlay animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setMostrarFormulario(false)}
        >
          <div className="modal-content animate-slide-up">
            {/* Header del modal */}
            <div className="sticky top-0 z-10 glass-card border-b border-white/20 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-[var(--color-carbon)]">
                  Nuevo Puesto
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Comparte un lugar delicioso 🌶️
                </p>
              </div>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:rotate-90"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenido del formulario */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <FormularioAgregarPuesto
                onPuestoAgregado={handlePuestoAgregado}
                onCancelar={() => setMostrarFormulario(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
