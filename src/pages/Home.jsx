import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Mapa from '../components/Mapa'
import SearchBar from '../components/SearchBar'
import FormularioAgregarPuesto from '../components/FormularioAgregarPuesto'
import LoginScreen from '../components/LoginScreen'

// Colores del sistema de diseño
const COLORS = {
  primary: '#FF6F3C',
  gray900: '#1A1A1A',
  gray600: '#525253',
  gray400: '#A1A1A2'
}

// Emojis por tipo de comida
const FOOD_EMOJIS = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌯',
  'Bebidas': '🥤',
  'Postres': '🍮',
  'default': '🍽️'
}

// Iconos de navegación - Estilo minimalista
const MapaIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? COLORS.primary : 'none'} stroke={active ? COLORS.primary : COLORS.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const ListaIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? COLORS.primary : COLORS.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
)

const AgregarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const PerfilIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? COLORS.primary : 'none'} stroke={active ? COLORS.primary : COLORS.gray400} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const MapPinIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const ChevronIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// Función para calcular distancia (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Función para verificar si está abierto ahora
function estaAbiertoAhora(horarioApertura, horarioCierre) {
  if (!horarioApertura || !horarioCierre) return true // Si no tiene horario, asumimos abierto

  const ahora = new Date()
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes()

  const [aperturaH, aperturaM] = horarioApertura.split(':').map(Number)
  const [cierreH, cierreM] = horarioCierre.split(':').map(Number)

  const apertura = aperturaH * 60 + aperturaM
  const cierre = cierreH * 60 + cierreM

  if (cierre < apertura) {
    // Horario nocturno (ej: 20:00 - 02:00)
    return horaActual >= apertura || horaActual <= cierre
  }
  return horaActual >= apertura && horaActual <= cierre
}

// Función para calcular promedio de estrellas
function calcularPromedio(puesto) {
  const campos = ['sabor', 'precio', 'higiene', 'cantidad', 'atencion']
  const valores = campos.map(c => puesto[c]).filter(v => v != null && v > 0)
  if (valores.length === 0) return 0
  return valores.reduce((a, b) => a + b, 0) / valores.length
}

// Componente de estrellas compacto
function StarRating({ rating, size = 12 }) {
  const fullStars = Math.floor(rating || 0)
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < fullStars ? COLORS.primary : 'none'} stroke={i < fullStars ? COLORS.primary : '#D4D4D5'} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-[12px] font-medium" style={{ color: COLORS.gray600 }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  // Estados de datos
  const [userLocation, setUserLocation] = useState(null)
  const [puestos, setPuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState(null)

  // Estados de UI
  const [tabActiva, setTabActiva] = useState('explorar')
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false)

  // Estados de filtros (compartidos entre pestañas)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [filtroAbierto, setFiltroAbierto] = useState(false)
  const [filtroEstrellas, setFiltroEstrellas] = useState(0)
  const [ordenarPor, setOrdenarPor] = useState('distancia')

  // Cargar puestos
  useEffect(() => {
    async function fetchPuestos() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('puestos')
          .select('*')
          .eq('activo', true)

        if (error) throw error
        setPuestos(data || [])
      } catch (err) {
        console.error('Error cargando puestos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPuestos()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error al cerrar sesion:', error)
    }
  }

  const handlePuestoClick = (puesto) => {
    navigate(`/puesto/${puesto.id}`)
  }

  const handlePuestoAgregado = (nuevoPuesto) => {
    setPuestos([...puestos, nuevoPuesto])
    setMostrarModalAgregar(false)
    setTabActiva('explorar')
  }

  // Filtrar puestos
  let puestosFiltrados = puestos.map(p => ({
    ...p,
    promedio: calcularPromedio(p),
    distancia: userLocation && p.latitud && p.longitud
      ? calcularDistancia(userLocation[0], userLocation[1], p.latitud, p.longitud)
      : null,
    abierto: estaAbiertoAhora(p.horario_apertura, p.horario_cierre)
  }))

  // Filtro por tipo
  if (filtroTipo !== 'Todos') {
    puestosFiltrados = puestosFiltrados.filter(p => p.tipo_comida === filtroTipo)
  }

  // Filtro por búsqueda
  if (busqueda && busqueda.trim()) {
    const busquedaLower = busqueda.toLowerCase().trim()
    puestosFiltrados = puestosFiltrados.filter(p =>
      p.nombre.toLowerCase().includes(busquedaLower) ||
      (p.tipo_comida && p.tipo_comida.toLowerCase().includes(busquedaLower)) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(busquedaLower))
    )
  }

  // Filtro por abierto
  if (filtroAbierto) {
    puestosFiltrados = puestosFiltrados.filter(p => p.abierto)
  }

  // Filtro por estrellas
  if (filtroEstrellas > 0) {
    puestosFiltrados = puestosFiltrados.filter(p => p.promedio >= filtroEstrellas)
  }

  // Ordenar
  puestosFiltrados.sort((a, b) => {
    if (ordenarPor === 'distancia') {
      if (a.distancia === null) return 1
      if (b.distancia === null) return -1
      return a.distancia - b.distancia
    } else if (ordenarPor === 'nota') {
      return b.promedio - a.promedio
    } else if (ordenarPor === 'reciente') {
      return new Date(b.created_at) - new Date(a.created_at)
    }
    return 0
  })

  return (
    <div className="flex flex-col" style={{ background: 'var(--bg-primary)', height: '100dvh', overflow: 'hidden' }}>
      {/* Contenido Principal */}
      <div className="flex-1 overflow-hidden relative">
        {/* Vista Mapa */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${tabActiva === 'explorar' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <Mapa
            userLocation={userLocation}
            onUserLocationChange={setUserLocation}
            puestos={puestosFiltrados}
            mapCenter={mapCenter}
            onPuestoClick={handlePuestoClick}
          />

          {/* Barra de búsqueda flotante sobre el mapa */}
          <div className="absolute top-4 left-4 right-4 z-[1000]">
            <SearchBar
              busqueda={busqueda}
              onBusquedaChange={setBusqueda}
              filtroTipo={filtroTipo}
              onFiltroTipoChange={setFiltroTipo}
              filtroAbierto={filtroAbierto}
              onFiltroAbiertoChange={setFiltroAbierto}
              filtroEstrellas={filtroEstrellas}
              onFiltroEstrellasChange={setFiltroEstrellas}
            />
          </div>

          {/* Botón flotante de agregar - Estilo Uber */}
          <button
            onClick={() => setMostrarModalAgregar(true)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: 'var(--gray-900)',
              color: 'white',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <AgregarIcon />
          </button>
        </div>

        {/* Vista Lista */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${tabActiva === 'buscar' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
            {/* Barra de búsqueda */}
            <div className="sticky top-0 z-20 px-4 pt-4 pb-3" style={{ background: 'var(--bg-primary)' }}>
              <SearchBar
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                filtroTipo={filtroTipo}
                onFiltroTipoChange={setFiltroTipo}
                filtroAbierto={filtroAbierto}
                onFiltroAbiertoChange={setFiltroAbierto}
                filtroEstrellas={filtroEstrellas}
                onFiltroEstrellasChange={setFiltroEstrellas}
                ordenarPor={ordenarPor}
                onOrdenarPorChange={setOrdenarPor}
                mostrarOrdenar={true}
              />
            </div>

            {/* Contador */}
            <div className="px-4 pb-3">
              <p className="text-[13px]" style={{ color: 'var(--gray-500)' }}>
                <span className="font-semibold" style={{ color: 'var(--gray-900)' }}>
                  {puestosFiltrados.length}
                </span>
                {' '}{puestosFiltrados.length === 1 ? 'lugar' : 'lugares'}
              </p>
            </div>

            {/* Lista de puestos */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="spinner" />
              </div>
            ) : puestosFiltrados.length > 0 ? (
              <div className="px-4 pb-24 space-y-3">
                {puestosFiltrados.map((puesto, index) => (
                  <div
                    key={puesto.id}
                    onClick={() => handlePuestoClick(puesto)}
                    className="cursor-pointer animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 0.03}s`,
                      background: 'var(--white)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-xs)',
                      overflow: 'hidden'
                    }}
                  >
                    <div className="flex gap-3 p-3">
                      {/* Imagen */}
                      <div className="flex-shrink-0">
                        {puesto.foto_url ? (
                          <img
                            src={puesto.foto_url}
                            alt={puesto.nombre}
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                        ) : (
                          <div
                            className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl"
                            style={{ background: 'var(--gray-100)' }}
                          >
                            {FOOD_EMOJIS[puesto.tipo_comida] || FOOD_EMOJIS.default}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 py-0.5">
                        <h3
                          className="font-semibold text-[15px] truncate mb-1"
                          style={{ color: 'var(--gray-900)' }}
                        >
                          {puesto.nombre}
                        </h3>

                        {/* Rating */}
                        <div className="mb-1.5">
                          {puesto.promedio > 0 ? (
                            <StarRating rating={puesto.promedio} />
                          ) : (
                            <span className="text-[12px]" style={{ color: 'var(--gray-400)' }}>Sin reseñas</span>
                          )}
                        </div>

                        {/* Tipo, estado y distancia */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[12px] font-medium" style={{ color: 'var(--gray-600)' }}>
                            {FOOD_EMOJIS[puesto.tipo_comida] || '🍽️'} {puesto.tipo_comida || 'Comida'}
                          </span>

                          {puesto.abierto ? (
                            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                              Abierto
                            </span>
                          ) : (
                            <span className="text-[11px]" style={{ color: 'var(--gray-400)' }}>
                              Cerrado
                            </span>
                          )}

                          {puesto.distancia !== null && (
                            <span className="inline-flex items-center gap-1 text-[12px]" style={{ color: 'var(--gray-400)' }}>
                              <MapPinIcon />
                              {puesto.distancia < 1
                                ? `${(puesto.distancia * 1000).toFixed(0)}m`
                                : `${puesto.distancia.toFixed(1)}km`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Flecha */}
                      <div className="flex-shrink-0 flex items-center" style={{ color: 'var(--gray-300)' }}>
                        <ChevronIcon />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-20 text-center">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
                  style={{ background: 'var(--gray-100)' }}
                >
                  🔍
                </div>
                <p className="text-[16px] font-semibold mb-1" style={{ color: 'var(--gray-900)' }}>
                  Sin resultados
                </p>
                <p className="text-[13px]" style={{ color: 'var(--gray-500)' }}>
                  Prueba con otros filtros
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vista Perfil */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${tabActiva === 'perfil' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          {!user ? (
            <LoginScreen />
          ) : (
            <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
              <div className="max-w-lg mx-auto px-5 py-8">
                {/* Avatar y nombre */}
                <div className="text-center mb-8">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover"
                      style={{ border: '3px solid var(--border-light)' }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
                      style={{ background: 'var(--gray-100)' }}
                    >
                      👤
                    </div>
                  )}
                  <h1 className="text-[20px] font-semibold" style={{ color: 'var(--gray-900)' }}>
                    {user.user_metadata?.full_name || user.user_metadata?.name || 'Mi Perfil'}
                  </h1>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--gray-500)' }}>
                    {user.email}
                  </p>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { value: '0', label: 'Favoritos' },
                    { value: '0', label: 'Reseñas' },
                    { value: '0', label: 'Agregados' }
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="p-4 text-center rounded-xl"
                      style={{ background: 'var(--white)', border: '1px solid var(--border-light)' }}
                    >
                      <p className="text-[20px] font-semibold" style={{ color: 'var(--gray-900)' }}>{stat.value}</p>
                      <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--gray-400)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Opciones del menú */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ background: 'var(--white)', border: '1px solid var(--border-light)' }}
                >
                  {[
                    { icon: '❤️', label: 'Mis favoritos' },
                    { icon: '⭐', label: 'Mis reseñas' },
                    { icon: '📍', label: 'Puestos agregados' },
                    { icon: '⚙️', label: 'Configuración' }
                  ].map((item, index, arr) => (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-4 p-4 text-left transition-colors active:bg-gray-50"
                      style={{ borderBottom: index < arr.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="flex-1 text-[14px] font-medium" style={{ color: 'var(--gray-900)' }}>{item.label}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  ))}
                </div>

                {/* Botón cerrar sesión */}
                <button
                  onClick={handleSignOut}
                  className="w-full mt-4 py-3.5 px-4 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98]"
                  style={{
                    background: 'var(--error-light)',
                    color: 'var(--error)'
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Estilo Uber */}
      <nav
        className="flex-shrink-0 safe-area-bottom"
        style={{
          background: 'var(--white)',
          borderTop: '1px solid var(--border-light)'
        }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Mapa */}
          <button
            onClick={() => setTabActiva('explorar')}
            className="flex flex-col items-center gap-1 py-3 px-6 transition-all"
          >
            <MapaIcon active={tabActiva === 'explorar'} />
            <span
              className="text-[11px] font-medium"
              style={{ color: tabActiva === 'explorar' ? COLORS.primary : COLORS.gray400 }}
            >
              Mapa
            </span>
          </button>

          {/* Lista */}
          <button
            onClick={() => setTabActiva('buscar')}
            className="flex flex-col items-center gap-1 py-3 px-6 transition-all"
          >
            <ListaIcon active={tabActiva === 'buscar'} />
            <span
              className="text-[11px] font-medium"
              style={{ color: tabActiva === 'buscar' ? COLORS.primary : COLORS.gray400 }}
            >
              Lista
            </span>
          </button>

          {/* Perfil */}
          <button
            onClick={() => setTabActiva('perfil')}
            className="flex flex-col items-center gap-1 py-3 px-6 transition-all"
          >
            <PerfilIcon active={tabActiva === 'perfil'} />
            <span
              className="text-[11px] font-medium"
              style={{ color: tabActiva === 'perfil' ? COLORS.primary : COLORS.gray400 }}
            >
              Perfil
            </span>
          </button>
        </div>
      </nav>

      {/* Modal Agregar Puesto */}
      {mostrarModalAgregar && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
          style={{ background: 'var(--bg-overlay)' }}
          onClick={(e) => e.target === e.currentTarget && setMostrarModalAgregar(false)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-hidden animate-slide-up rounded-t-3xl sm:rounded-2xl"
            style={{ background: 'var(--white)' }}
          >
            {/* Handle indicator */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--gray-300)' }} />
            </div>

            {/* Header */}
            <div
              className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
              style={{ background: 'var(--white)', borderBottom: '1px solid var(--border-light)' }}
            >
              <div>
                <h2 className="text-[18px] font-semibold" style={{ color: 'var(--gray-900)' }}>
                  Agregar lugar
                </h2>
                <p className="text-[13px]" style={{ color: 'var(--gray-500)' }}>
                  Comparte tu descubrimiento
                </p>
              </div>
              <button
                onClick={() => setMostrarModalAgregar(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Contenido */}
            <div className="overflow-y-auto p-5" style={{ maxHeight: 'calc(90vh - 100px)' }}>
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
