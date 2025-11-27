import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Iconos
const SearchIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const ChevronIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const ImageIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
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

export default function ListaPuestos({ userLocation, onPuestoClick, puestos, setPuestos, filtroTipo, onFiltroChange, busqueda, onBusquedaChange }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const tiposDisponibles = ['Todos', 'Tacos', 'Tortas', 'Quesadillas', 'Tamales', 'Antojitos', 'Bebidas', 'Postres']

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
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPuestos()
  }, [setPuestos])

  // Filtrar
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

  // Calcular distancias y ordenar
  const puestosConDistancia = puestosFiltrados.map(puesto => {
    if (userLocation && puesto.latitud && puesto.longitud) {
      const distancia = calcularDistancia(
        userLocation[0],
        userLocation[1],
        puesto.latitud,
        puesto.longitud
      )
      return { ...puesto, distancia }
    }
    return { ...puesto, distancia: null }
  }).sort((a, b) => {
    if (a.distancia === null) return 1
    if (b.distancia === null) return -1
    return a.distancia - b.distancia
  })

  if (loading) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ background: 'var(--bg-deep)' }}
      >
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-full mx-auto mb-5 animate-spin"
            style={{
              border: '3px solid var(--bg-elevated)',
              borderTopColor: 'var(--accent-amber)'
            }}
          />
          <p style={{ color: 'var(--text-secondary)' }}>Buscando antojitos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="h-full flex items-center justify-center p-6"
        style={{ background: 'var(--bg-deep)' }}
      >
        <div className="text-center max-w-sm">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(255, 107, 107, 0.15)' }}
          >
            <svg className="w-8 h-8" style={{ color: 'var(--accent-coral)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="font-semibold mb-2" style={{ color: 'var(--accent-coral)' }}>
            Error al cargar
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto pattern-dots" style={{ background: 'var(--bg-deep)' }}>
      {/* Barra de búsqueda */}
      <div
        className="sticky top-0 z-20 px-4 pt-4 pb-2"
        style={{ background: 'linear-gradient(180deg, var(--bg-deep) 80%, transparent 100%)' }}
      >
        <div className="relative">
          <input
            type="text"
            value={busqueda || ''}
            onChange={(e) => onBusquedaChange && onBusquedaChange(e.target.value)}
            placeholder="Buscar por nombre, tipo..."
            className="input-field pl-12 pr-12"
            style={{ fontSize: '0.95rem' }}
          />
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          >
            <SearchIcon />
          </div>
          {busqueda && (
            <button
              onClick={() => onBusquedaChange && onBusquedaChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {/* Chips de filtro */}
      <div
        className="sticky top-[72px] z-10 px-4 pb-3"
        style={{ background: 'var(--bg-deep)' }}
      >
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {tiposDisponibles.map((tipo) => (
            <button
              key={tipo}
              onClick={() => onFiltroChange && onFiltroChange(tipo)}
              className={`chip whitespace-nowrap transition-all duration-300 ${
                filtroTipo === tipo ? 'chip-active' : 'chip-default'
              }`}
              style={filtroTipo === tipo ? {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
              } : {}}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Contador */}
      <div className="px-4 pb-3">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {puestosConDistancia.length}
          </span>
          {' '}{puestosConDistancia.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
          {filtroTipo !== 'Todos' && (
            <span style={{ color: 'var(--accent-amber)' }}> · {filtroTipo}</span>
          )}
        </p>
      </div>

      {/* Lista de puestos */}
      {puestosConDistancia.length > 0 ? (
        <div className="px-4 pb-24 space-y-3">
          {puestosConDistancia.map((puesto, index) => (
            <div
              key={puesto.id}
              onClick={() => onPuestoClick(puesto)}
              className={`rounded-2xl overflow-hidden cursor-pointer card-hover animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div className="flex gap-4 p-4">
                {/* Imagen */}
                <div className="flex-shrink-0">
                  {puesto.foto_url ? (
                    <img
                      src={puesto.foto_url}
                      alt={puesto.nombre}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <ImageIcon />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1">
                  <h3
                    className="font-bold text-lg truncate mb-1.5"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {puesto.nombre}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: 'var(--accent-amber)'
                      }}
                    >
                      {puesto.tipo_comida || 'Comida'}
                    </span>
                    {puesto.distancia !== null && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <MapPinIcon />
                        {puesto.distancia < 1
                          ? `${(puesto.distancia * 1000).toFixed(0)}m`
                          : `${puesto.distancia.toFixed(1)}km`}
                      </span>
                    )}
                  </div>
                  {puesto.descripcion && (
                    <p
                      className="text-sm line-clamp-2 leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {puesto.descripcion}
                    </p>
                  )}
                </div>

                {/* Flecha */}
                <div
                  className="flex-shrink-0 flex items-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ChevronIcon />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-16 text-center">
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'var(--bg-card)' }}
          >
            <span className="text-4xl">🔍</span>
          </div>
          <p className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
            No hay resultados
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Intenta con otros filtros o términos de búsqueda
          </p>
        </div>
      )}
    </div>
  )
}
