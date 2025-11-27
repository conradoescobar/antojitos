import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Mapa from '../components/Mapa'
import ListaPuestos from '../components/ListaPuestos'
import FormularioAgregarPuesto from '../components/FormularioAgregarPuesto'

// Iconos de navegación
const ExplorarIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const BuscarIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const AgregarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const PerfilIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const [tabActiva, setTabActiva] = useState('explorar')
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

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-main)' }}>
      {/* Contenido Principal */}
      <div className="flex-1 overflow-hidden relative">
        {/* Vista Explorar (Mapa) */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${tabActiva === 'explorar' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <Mapa
            userLocation={userLocation}
            onUserLocationChange={setUserLocation}
            puestos={puestosFiltrados}
            mapCenter={mapCenter}
            onPuestoClick={handlePuestoClick}
          />

          {/* Botón flotante de agregar */}
          <button
            onClick={() => setMostrarModalAgregar(true)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{
              background: 'var(--primary)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(217, 119, 87, 0.4)'
            }}
          >
            <AgregarIcon />
          </button>
        </div>

        {/* Vista Buscar (Lista) */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${tabActiva === 'buscar' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
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
        <div className={`absolute inset-0 transition-opacity duration-300 ${tabActiva === 'perfil' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-main)' }}>
            <div className="max-w-lg mx-auto px-5 py-8">
              {/* Avatar y nombre */}
              <div className="text-center mb-8">
                <div
                  className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  👤
                </div>
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Mi Perfil
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Amante de los antojitos
                </p>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { value: '0', label: 'Favoritos' },
                  { value: '0', label: 'Resenas' },
                  { value: '0', label: 'Agregados' }
                ].map((stat) => (
                  <div key={stat.label} className="card p-4 text-center">
                    <p className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Opciones del menú */}
              <div className="card">
                {[
                  { icon: '❤️', label: 'Mis favoritos' },
                  { icon: '⭐', label: 'Mis resenas' },
                  { icon: '📍', label: 'Puestos agregados' },
                  { icon: '⚙️', label: 'Configuracion' }
                ].map((item, index, arr) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ borderBottom: index < arr.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Banner próximamente */}
              <div className="mt-6 p-4 rounded-xl text-center" style={{ background: 'var(--primary-light)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                  Proximamente: favoritos, historial y mas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Sin botón agregar */}
      <nav
        className="flex-shrink-0 safe-area-bottom"
        style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-light)',
          boxShadow: '0 -4px 12px rgba(26, 25, 21, 0.04)'
        }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Explorar */}
          <button
            onClick={() => setTabActiva('explorar')}
            className="flex flex-col items-center gap-1 py-3 px-8 transition-colors"
            style={{ color: tabActiva === 'explorar' ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            <ExplorarIcon active={tabActiva === 'explorar'} />
            <span className="text-xs font-medium">Explorar</span>
          </button>

          {/* Buscar */}
          <button
            onClick={() => setTabActiva('buscar')}
            className="flex flex-col items-center gap-1 py-3 px-8 transition-colors"
            style={{ color: tabActiva === 'buscar' ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            <BuscarIcon active={tabActiva === 'buscar'} />
            <span className="text-xs font-medium">Buscar</span>
          </button>

          {/* Perfil */}
          <button
            onClick={() => setTabActiva('perfil')}
            className="flex flex-col items-center gap-1 py-3 px-8 transition-colors"
            style={{ color: tabActiva === 'perfil' ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            <PerfilIcon active={tabActiva === 'perfil'} />
            <span className="text-xs font-medium">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Modal Agregar Puesto */}
      {mostrarModalAgregar && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
          style={{ background: 'rgba(26, 25, 21, 0.5)' }}
          onClick={(e) => e.target === e.currentTarget && setMostrarModalAgregar(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl"
            style={{ background: 'var(--bg-card)' }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
              style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}
            >
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Agregar puesto
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Comparte tu descubrimiento
                </p>
              </div>
              <button
                onClick={() => setMostrarModalAgregar(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--bg-secondary)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Contenido */}
            <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <FormularioAgregarPuesto
                onPuestoAgregado={handlePuestoAgregado}
                onCancelar={() => setMostrarModalAgregar(false)}
                userLocation={userLocation}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
