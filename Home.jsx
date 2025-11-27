import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Mapa from '../components/Mapa'
import ListaPuestos from '../components/ListaPuestos'
import FormularioAgregarPuesto from '../components/FormularioAgregarPuesto'

// Emoji icons for food types
const tipoEmojis = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌶️',
  'Bebidas': '🥤',
  'Postres': '🍮',
  'Otro': '🍽️'
}

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

  // Filter puestos
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
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--night-black)] bg-grid">
      {/* Header con efecto neón */}
      <header className="relative z-20">
        {/* Gradient line top */}
        <div className="h-1 bg-gradient-to-r from-[var(--neon-pink)] via-[var(--neon-orange)] to-[var(--neon-yellow)] animate-gradient" />
        
        <div className="glass-dark border-b border-white/5">
          <div className="px-5 py-5">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-orange)] flex items-center justify-center animate-float-up">
                    <span className="text-3xl">🌮</span>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-orange)] blur-xl opacity-50 -z-10" />
                </div>
                <div>
                  <h1 className="font-display text-3xl gradient-text animate-glow-flicker">
                    Antojitos
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] tracking-widest uppercase">
                    Street Food Finder
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-display text-[var(--neon-yellow)]" style={{ textShadow: 'var(--glow-yellow)' }}>
                    {puestos.length}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Puestos</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="w-10 h-10 rounded-xl bg-[var(--night-medium)] flex items-center justify-center">
                  <span className="text-lg">📍</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex">
            <button
              onClick={() => setVistaActiva('mapa')}
              className={`nav-tab ${vistaActiva === 'mapa' ? 'active' : ''}`}
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
              className={`nav-tab ${vistaActiva === 'lista' ? 'active' : ''}`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Lista
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Map View */}
        <div 
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            vistaActiva === 'mapa' 
              ? 'opacity-100 translate-x-0 z-10' 
              : 'opacity-0 -translate-x-full z-0 pointer-events-none'
          }`}
        >
          <Mapa
            userLocation={userLocation}
            onUserLocationChange={setUserLocation}
            puestos={puestosFiltrados}
            mapCenter={mapCenter}
            onPuestoClick={handlePuestoClick}
          />
        </div>

        {/* List View */}
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

      {/* FAB */}
      <button
        onClick={() => setMostrarFormulario(true)}
        className="fab-neon bottom-8 right-6"
        aria-label="Agregar puesto"
      >
        <svg className="w-8 h-8 text-[var(--night-black)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal */}
      {mostrarFormulario && (
        <div 
          className="modal-overlay animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setMostrarFormulario(false)}
        >
          <div className="modal-content animate-slide-up">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 glass-dark border-b border-white/5 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl gradient-text">
                  Nuevo Puesto
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Comparte un spot 🔥
                </p>
              </div>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--night-medium)] hover:bg-[var(--neon-pink)] hover:text-[var(--night-black)] transition-all duration-300 hover:rotate-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
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
