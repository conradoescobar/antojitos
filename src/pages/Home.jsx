import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Mapa from '../components/Mapa'
import ListaPuestos from '../components/ListaPuestos'
import FormularioAgregarPuesto from '../components/FormularioAgregarPuesto'

// Iconos SVG inline
const MapIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
)

const ListIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

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
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-deep)' }}>
      {/* Header */}
      <header className="relative z-20 animate-slide-down">
        {/* Fondo con gradiente sutil */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: 'linear-gradient(180deg, var(--bg-card) 0%, transparent 100%)'
          }}
        />

        <div className="relative px-5 pt-6 pb-4">
          {/* Logo y título */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center animate-float"
              style={{
                background: 'var(--gradient-fire)',
                boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
              }}
            >
              <span className="text-3xl">🌮</span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gradient-fire">
                Antojitos
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Encuentra sabor cerca de ti
              </p>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div
            className="flex rounded-2xl p-1.5"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <button
              onClick={() => setVistaActiva('mapa')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                vistaActiva === 'mapa'
                  ? 'text-white shadow-lg'
                  : ''
              }`}
              style={vistaActiva === 'mapa' ? {
                background: 'var(--gradient-fire)',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
              } : {
                color: 'var(--text-secondary)'
              }}
            >
              <MapIcon />
              Mapa
            </button>
            <button
              onClick={() => setVistaActiva('lista')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                vistaActiva === 'lista'
                  ? 'text-white shadow-lg'
                  : ''
              }`}
              style={vistaActiva === 'lista' ? {
                background: 'var(--gradient-fire)',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
              } : {
                color: 'var(--text-secondary)'
              }}
            >
              <ListIcon />
              Explorar
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-hidden relative">
        {/* Vista de Mapa */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            vistaActiva === 'mapa'
              ? 'opacity-100 z-10 scale-100'
              : 'opacity-0 z-0 scale-95 pointer-events-none'
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

        {/* Vista de Lista */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            vistaActiva === 'lista'
              ? 'opacity-100 z-10 scale-100'
              : 'opacity-0 z-0 scale-95 pointer-events-none'
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

      {/* FAB - Botón flotante para agregar */}
      <button
        onClick={() => setMostrarFormulario(true)}
        className="fixed bottom-8 right-6 w-16 h-16 rounded-2xl flex items-center justify-center z-30 transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse-glow"
        style={{
          background: 'var(--gradient-fire)',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)'
        }}
        aria-label="Agregar puesto"
      >
        <PlusIcon />
      </button>

      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
          style={{ background: 'rgba(13, 11, 14, 0.8)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setMostrarFormulario(false)
          }}
        >
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-hidden animate-slide-up rounded-t-3xl sm:rounded-3xl"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {/* Header del modal */}
            <div
              className="sticky top-0 z-10 px-6 py-5 flex items-center justify-between"
              style={{
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <h2 className="text-xl font-bold text-gradient-fire font-display">
                  Nuevo Puesto
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Comparte tu descubrimiento
                </p>
              </div>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)'
                }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 88px)' }}>
              <div className="p-6">
                <FormularioAgregarPuesto
                  onPuestoAgregado={handlePuestoAgregado}
                  onCancelar={() => setMostrarFormulario(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
