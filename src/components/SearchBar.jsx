/**
 * SearchBar - Barra de búsqueda con filtros
 * Usa tokens del sistema de theming
 */
import { useState } from 'react'

// Iconos
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const FilterIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
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
      {/* Barra de búsqueda */}
      <div
        className="relative flex items-center"
        style={{
          height: '50px',
          borderRadius: '18px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}
      >
        {/* Icono de búsqueda */}
        <div
          className="absolute left-4 flex items-center justify-center"
          style={{ color: 'var(--text-muted)' }}
        >
          <SearchIcon />
        </div>

        {/* Input de búsqueda */}
        <input
          type="text"
          value={busqueda || ''}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar antojitos cerca…"
          className="w-full h-full bg-transparent border-none outline-none"
          style={{
            paddingLeft: '48px',
            paddingRight: busqueda ? '88px' : '56px',
            fontSize: '15px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Rubik", sans-serif',
            fontWeight: '400',
            color: 'var(--text-primary)',
          }}
        />

        {/* Botón de limpiar búsqueda */}
        {busqueda && (
          <button
            onClick={() => onBusquedaChange('')}
            className="absolute flex items-center justify-center transition-all active:scale-90"
            style={{
              right: '52px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)'
            }}
          >
            <CloseIcon />
          </button>
        )}

        {/* Separador vertical */}
        <div
          className="absolute"
          style={{
            right: '48px',
            height: '24px',
            width: '1px',
            background: 'var(--border)'
          }}
        />

        {/* Botón de filtros integrado */}
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="absolute flex items-center justify-center transition-all active:scale-95"
          style={{
            right: '6px',
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: hayFiltrosActivos ? 'var(--primary)' : 'transparent',
            color: hayFiltrosActivos ? 'var(--text-inverse)' : 'var(--text-secondary)'
          }}
        >
          <FilterIcon active={hayFiltrosActivos} />
          {hayFiltrosActivos && (
            <div
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center"
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'var(--primary-intense)',
                fontSize: '10px',
                fontWeight: '600',
                color: 'var(--text-inverse)'
              }}
            >
              {(filtroTipo !== 'Todos' ? 1 : 0) + (filtroAbierto ? 1 : 0) + (filtroEstrellas > 0 ? 1 : 0)}
            </div>
          )}
        </button>
      </div>

      {/* Panel de filtros expandible */}
      {mostrarFiltros && (
        <div
          className="mt-3 p-4 rounded-2xl animate-fade-in"
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {/* Tipo de comida */}
          <div className="mb-4">
            <p
              className="text-xs font-semibold mb-2 uppercase tracking-wide"
              style={{
                color: 'var(--text-muted)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
              }}
            >
              Tipo de comida
            </p>
            <div className="flex flex-wrap gap-2">
              {TIPOS_COMIDA.map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => onFiltroTipoChange(tipo)}
                  className="px-3.5 py-2 rounded-full text-sm font-medium transition-all active:scale-95"
                  style={{
                    background: filtroTipo === tipo ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: filtroTipo === tipo ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
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
              className="flex items-center gap-3 w-full p-3.5 rounded-xl transition-all active:scale-[0.99]"
              style={{
                background: filtroAbierto ? 'var(--primary-light)' : 'var(--bg-secondary)'
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: filtroAbierto ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {filtroAbierto && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span
                className="text-sm font-medium"
                style={{
                  color: filtroAbierto ? 'var(--primary)' : 'var(--text-primary)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
                }}
              >
                Abierto ahora
              </span>
              <span className="text-lg ml-auto">🕐</span>
            </button>
          </div>

          {/* Estrellas mínimas */}
          <div className="mb-4">
            <p
              className="text-xs font-semibold mb-2 uppercase tracking-wide"
              style={{
                color: 'var(--text-muted)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
              }}
            >
              Puntuación mínima
            </p>
            <div className="flex gap-2">
              {ESTRELLAS_OPCIONES.map((opcion) => (
                <button
                  key={opcion.value}
                  onClick={() => onFiltroEstrellasChange(opcion.value)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 active:scale-95"
                  style={{
                    background: filtroEstrellas === opcion.value ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: filtroEstrellas === opcion.value ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
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
              <p
                className="text-xs font-semibold mb-2 uppercase tracking-wide"
                style={{
                  color: 'var(--text-muted)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
                }}
              >
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
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 active:scale-95"
                    style={{
                      background: ordenarPor === opcion.value ? 'var(--primary)' : 'var(--bg-secondary)',
                      color: ordenarPor === opcion.value ? 'var(--text-inverse)' : 'var(--text-secondary)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
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
              className="w-full mt-4 py-3 text-sm font-semibold rounded-xl transition-all active:scale-[0.99]"
              style={{
                color: 'var(--primary)',
                background: 'var(--primary-light)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
