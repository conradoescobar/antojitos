import { useState } from 'react'

// Iconos
const SearchIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const FilterIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
)

const TIPOS_COMIDA = ['Todos', 'Tacos', 'Tortas', 'Quesadillas', 'Tamales', 'Antojitos', 'Bebidas', 'Postres']
const ESTRELLAS_OPCIONES = [
  { value: 0, label: 'Todas' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 4.5, label: '4.5+' }
]

export default function SearchBar({
  busqueda,
  onBusquedaChange,
  filtroTipo,
  onFiltroTipoChange,
  filtroAbierto,
  onFiltroAbiertoChange,
  filtroEstrellas,
  onFiltroEstrellasChange,
  ordenarPor,
  onOrdenarPorChange,
  mostrarOrdenar = false,
  className = ''
}) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const hayFiltrosActivos = filtroTipo !== 'Todos' || filtroAbierto || filtroEstrellas > 0

  return (
    <div className={`${className}`}>
      {/* Barra de búsqueda principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={busqueda || ''}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Buscar antojitos..."
            className="w-full py-3 pl-11 pr-10 rounded-xl text-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              color: 'var(--text-primary)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}
          />
          <div
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          >
            <SearchIcon />
          </div>
          {busqueda && (
            <button
              onClick={() => onBusquedaChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Botón filtros */}
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center justify-center w-12 h-12 rounded-xl transition-all"
          style={{
            background: hayFiltrosActivos ? 'var(--primary)' : 'rgba(255, 255, 255, 0.9)',
            color: hayFiltrosActivos ? 'white' : 'var(--text-secondary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <FilterIcon />
        </button>
      </div>

      {/* Panel de filtros expandible */}
      {mostrarFiltros && (
        <div
          className="mt-3 p-4 rounded-xl animate-fade-in"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Tipo de comida */}
          <div className="mb-4">
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Tipo de comida
            </p>
            <div className="flex flex-wrap gap-2">
              {TIPOS_COMIDA.map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => onFiltroTipoChange(tipo)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: filtroTipo === tipo ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: filtroTipo === tipo ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Abierto ahora */}
          <div className="mb-4">
            <button
              onClick={() => onFiltroAbiertoChange(!filtroAbierto)}
              className="flex items-center gap-3 w-full p-3 rounded-xl transition-all"
              style={{
                background: filtroAbierto ? 'var(--primary-light)' : 'var(--bg-secondary)'
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background: filtroAbierto ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {filtroAbierto && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: filtroAbierto ? 'var(--primary)' : 'var(--text-primary)' }}
              >
                Abierto ahora
              </span>
              <span className="text-lg ml-auto">🕐</span>
            </button>
          </div>

          {/* Estrellas mínimas */}
          <div className="mb-4">
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Puntuación mínima
            </p>
            <div className="flex gap-2">
              {ESTRELLAS_OPCIONES.map((opcion) => (
                <button
                  key={opcion.value}
                  onClick={() => onFiltroEstrellasChange(opcion.value)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
                  style={{
                    background: filtroEstrellas === opcion.value ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: filtroEstrellas === opcion.value ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {opcion.value > 0 && <span>⭐</span>}
                  {opcion.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ordenar por (solo si mostrarOrdenar) */}
          {mostrarOrdenar && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Ordenar por
              </p>
              <div className="flex gap-2">
                {[
                  { value: 'distancia', label: 'Más cerca', icon: '📍' },
                  { value: 'nota', label: 'Mejor nota', icon: '⭐' },
                  { value: 'reciente', label: 'Recientes', icon: '🆕' }
                ].map((opcion) => (
                  <button
                    key={opcion.value}
                    onClick={() => onOrdenarPorChange(opcion.value)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
                    style={{
                      background: ordenarPor === opcion.value ? 'var(--primary)' : 'var(--bg-secondary)',
                      color: ordenarPor === opcion.value ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    <span>{opcion.icon}</span>
                    {opcion.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botón limpiar filtros */}
          {hayFiltrosActivos && (
            <button
              onClick={() => {
                onFiltroTipoChange('Todos')
                onFiltroAbiertoChange(false)
                onFiltroEstrellasChange(0)
              }}
              className="w-full mt-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ color: 'var(--primary)' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
