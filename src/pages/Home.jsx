import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Mapa from '../components/Mapa'
import ListaPuestos from '../components/ListaPuestos'
import FormularioAgregarPuesto from '../components/FormularioAgregarPuesto'

// Iconos de navegación
const ExplorarIcon = ({ active }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="3" />
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
  </svg>
)

const BuscarIcon = ({ active }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const AgregarIcon = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const PerfilIcon = ({ active }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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
  const [tabActiva, setTabActiva] = useState('explorar') // 'explorar', 'buscar', 'agregar', 'perfil'
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false)

  const handlePuestoClick = (puesto) => {
    navigate(`/puesto/${puesto.id}`)
  }

  const handlePuestoAgregado = (nuevoPuesto) => {
    setPuestos([...puestos, nuevoPuesto])
    setMostrarModalAgregar(false)
    setTabActiva('explorar')
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

  const handleTabClick = (tab) => {
    if (tab === 'agregar') {
      setMostrarModalAgregar(true)
    } else {
      setTabActiva(tab)
    }
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-deep)' }}>
      {/* Contenido Principal - ocupa todo menos la navbar */}
      <div className="flex-1 overflow-hidden relative">
        {/* Vista Explorar (Mapa) */}
        <div
          className={`absolute inset-0 transition-all duration-400 ${
            tabActiva === 'explorar'
              ? 'opacity-100 z-10'
              : 'opacity-0 z-0 pointer-events-none'
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

        {/* Vista Buscar (Lista) */}
        <div
          className={`absolute inset-0 transition-all duration-400 ${
            tabActiva === 'buscar'
              ? 'opacity-100 z-10'
              : 'opacity-0 z-0 pointer-events-none'
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

        {/* Vista Perfil */}
        <div
          className={`absolute inset-0 transition-all duration-400 ${
            tabActiva === 'perfil'
              ? 'opacity-100 z-10'
              : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <div className="h-full overflow-y-auto p-5" style={{ background: 'var(--bg-deep)' }}>
            {/* Header Perfil */}
            <div className="text-center pt-8 pb-6">
              <div
                className="w-24 h-24 rounded-3xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--gradient-fire)' }}
              >
                <span className="text-4xl">👤</span>
              </div>
              <h1 className="text-2xl font-bold font-display text-gradient-fire">
                Mi Perfil
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Amante de los antojitos
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Favoritos', value: '0', icon: '❤️' },
                { label: 'Reseñas', value: '0', icon: '⭐' },
                { label: 'Agregados', value: '0', icon: '📍' }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                >
                  <span className="text-2xl block mb-1">{stat.icon}</span>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Opciones */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              {[
                { label: 'Mis favoritos', icon: '❤️', badge: null },
                { label: 'Mis reseñas', icon: '⭐', badge: null },
                { label: 'Puestos agregados', icon: '📍', badge: null },
                { label: 'Configuración', icon: '⚙️', badge: null }
              ].map((item, index) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ borderBottom: index < 3 ? '1px solid var(--border-subtle)' : 'none' }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {item.label}
                  </span>
                  <svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Mensaje de próximamente */}
            <div
              className="mt-6 p-4 rounded-2xl text-center"
              style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}
            >
              <p className="text-sm" style={{ color: 'var(--accent-amber)' }}>
                🚧 Funcionalidades próximamente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav
        className="flex-shrink-0 glass-heavy safe-area-bottom"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-end justify-around px-2 pt-2 pb-2">
          {/* Explorar */}
          <button
            onClick={() => handleTabClick('explorar')}
            className="flex flex-col items-center gap-1 py-2 px-4 transition-all"
            style={{ color: tabActiva === 'explorar' ? 'var(--accent-amber)' : 'var(--text-muted)' }}
          >
            <ExplorarIcon active={tabActiva === 'explorar'} />
            <span className={`text-xs font-medium ${tabActiva === 'explorar' ? 'font-semibold' : ''}`}>
              Explorar
            </span>
          </button>

          {/* Buscar */}
          <button
            onClick={() => handleTabClick('buscar')}
            className="flex flex-col items-center gap-1 py-2 px-4 transition-all"
            style={{ color: tabActiva === 'buscar' ? 'var(--accent-amber)' : 'var(--text-muted)' }}
          >
            <BuscarIcon active={tabActiva === 'buscar'} />
            <span className={`text-xs font-medium ${tabActiva === 'buscar' ? 'font-semibold' : ''}`}>
              Buscar
            </span>
          </button>

          {/* Agregar (botón central destacado) */}
          <button
            onClick={() => handleTabClick('agregar')}
            className="flex flex-col items-center -mt-5 transition-all hover:scale-105 active:scale-95"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: 'var(--gradient-fire)',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
                color: 'white'
              }}
            >
              <AgregarIcon />
            </div>
            <span
              className="text-xs font-medium mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Agregar
            </span>
          </button>

          {/* Perfil */}
          <button
            onClick={() => handleTabClick('perfil')}
            className="flex flex-col items-center gap-1 py-2 px-4 transition-all"
            style={{ color: tabActiva === 'perfil' ? 'var(--accent-amber)' : 'var(--text-muted)' }}
          >
            <PerfilIcon active={tabActiva === 'perfil'} />
            <span className={`text-xs font-medium ${tabActiva === 'perfil' ? 'font-semibold' : ''}`}>
              Perfil
            </span>
          </button>
        </div>
      </nav>

      {/* Modal de Agregar Puesto */}
      {mostrarModalAgregar && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
          style={{ background: 'rgba(13, 11, 14, 0.85)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setMostrarModalAgregar(false)
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
                onClick={() => setMostrarModalAgregar(false)}
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
                  onCancelar={() => setMostrarModalAgregar(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
