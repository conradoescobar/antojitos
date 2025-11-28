import { useState } from 'react'

// Iconos minimalistas
const SearchIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const FilterIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M7 12h10M10 18h4" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const TIPOS_COMIDA = [
  { id: 'Todos', emoji: '🍽️' },
  { id: 'Tacos', emoji: '🌮' },
  { id: 'Tortas', emoji: '🥪' },
  { id: 'Quesadillas', emoji: '🧀' },
  { id: 'Tamales', emoji: '🫔' },
  { id: 'Antojitos', emoji: '🌯' },
  { id: 'Bebidas', emoji: '🥤' },
  { id: 'Postres', emoji: '🍮' }
]

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
  const contadorFiltros = (filtroTipo !== 'Todos' ? 1 : 0) + (filtroAbierto ? 1 : 0) + (filtroEstrellas > 0 ? 1 : 0)

  return (
    <div className={`${className}`}>
      {/* Barra de búsqueda principal - Estilo Uber */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={busqueda || ''}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Buscar antojitos cerca..."
            className="w-full h-12 pl-12 pr-10 rounded-xl text-[15px] font-medium transition-all"
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border-default)',
              color: 'var(--gray-900)',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-400)' }}>
            <SearchIcon />
          </div>
          {busqueda && (
            <button
              onClick={() => onBusquedaChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-gray-100"
              style={{ color: 'var(--gray-400)' }}
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Botón filtros - Badge con contador */}
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="relative flex items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-95"
          style={{
            background: hayFiltrosActivos ? 'var(--gray-900)' : 'var(--white)',
            color: hayFiltrosActivos ? 'var(--white)' : 'var(--gray-600)',
            border: `1px solid ${hayFiltrosActivos ? 'var(--gray-900)' : 'var(--border-default)'}`,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <FilterIcon />
          {contadorFiltros > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              {contadorFiltros}
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros expandible - Estilo Bottom Sheet */}
      {mostrarFiltros && (
        <div
          className="mt-3 rounded-2xl overflow-hidden animate-fade-in"
          style={{
            background: 'var(--white)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {/* Header del panel */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border-light)' }}
          >
            <h3 className="text-[15px] font-semibold" style={{ color: 'var(--gray-900)' }}>
              Filtros
            </h3>
            {hayFiltrosActivos && (
              <button
                onClick={() => {
                  onFiltroTipoChange('Todos')
                  onFiltroAbiertoChange(false)
                  onFiltroEstrellasChange(0)
                }}
                className="text-[13px] font-medium transition-colors"
                style={{ color: 'var(--primary)' }}
              >
                Limpiar todo
              </button>
            )}
          </div>

          <div className="p-5 space-y-6">
            {/* Tipo de comida - Chips horizontales */}
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--gray-400)' }}>
                Tipo de comida
              </p>
              <div className="flex flex-wrap gap-2">
                {TIPOS_COMIDA.map((tipo) => (
                  <button
                    key={tipo.id}
                    onClick={() => onFiltroTipoChange(tipo.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium transition-all active:scale-95"
                    style={{
                      background: filtroTipo === tipo.id ? 'var(--gray-900)' : 'var(--gray-50)',
                      color: filtroTipo === tipo.id ? 'var(--white)' : 'var(--gray-600)',
                      border: `1px solid ${filtroTipo === tipo.id ? 'var(--gray-900)' : 'var(--border-default)'}`
                    }}
                  >
                    <span>{tipo.emoji}</span>
                    <span>{tipo.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Abierto ahora - Toggle estilo iOS */}
            <div>
              <button
                onClick={() => onFiltroAbiertoChange(!filtroAbierto)}
                className="flex items-center justify-between w-full p-4 rounded-xl transition-all"
                style={{
                  background: 'var(--gray-50)',
                  border: `1px solid ${filtroAbierto ? 'var(--primary)' : 'var(--border-default)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🕐</span>
                  <span className="text-[14px] font-medium" style={{ color: 'var(--gray-900)' }}>
                    Abierto ahora
                  </span>
                </div>
                <div
                  className="w-11 h-6 rounded-full p-0.5 transition-all"
                  style={{ background: filtroAbierto ? 'var(--primary)' : 'var(--gray-300)' }}
                >
                  <div
                    className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                    style={{ transform: filtroAbierto ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </div>
              </button>
            </div>

            {/* Puntuación mínima - Botones segmentados */}
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--gray-400)' }}>
                Puntuación mínima
              </p>
              <div
                className="flex rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border-default)' }}
              >
                {ESTRELLAS_OPCIONES.map((opcion, index) => (
                  <button
                    key={opcion.value}
                    onClick={() => onFiltroEstrellasChange(opcion.value)}
                    className="flex-1 py-3 text-[13px] font-medium transition-all flex items-center justify-center gap-1"
                    style={{
                      background: filtroEstrellas === opcion.value ? 'var(--gray-900)' : 'var(--white)',
                      color: filtroEstrellas === opcion.value ? 'var(--white)' : 'var(--gray-600)',
                      borderRight: index < ESTRELLAS_OPCIONES.length - 1 ? '1px solid var(--border-default)' : 'none'
                    }}
                  >
                    {opcion.value > 0 && <span className="text-[11px]">⭐</span>}
                    {opcion.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ordenar por (solo si mostrarOrdenar) */}
            {mostrarOrdenar && (
              <div>
                <p className="text-[12px] font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--gray-400)' }}>
                  Ordenar por
                </p>
                <div className="space-y-2">
                  {[
                    { value: 'distancia', label: 'Más cercanos', icon: '📍' },
                    { value: 'nota', label: 'Mejor puntuación', icon: '⭐' },
                    { value: 'reciente', label: 'Agregados recientemente', icon: '🆕' }
                  ].map((opcion) => (
                    <button
                      key={opcion.value}
                      onClick={() => onOrdenarPorChange(opcion.value)}
                      className="flex items-center w-full p-3 rounded-xl transition-all"
                      style={{
                        background: ordenarPor === opcion.value ? 'var(--gray-50)' : 'transparent',
                        border: `1px solid ${ordenarPor === opcion.value ? 'var(--gray-900)' : 'var(--border-light)'}`
                      }}
                    >
                      <span className="text-lg mr-3">{opcion.icon}</span>
                      <span
                        className="text-[14px] font-medium flex-1 text-left"
                        style={{ color: 'var(--gray-900)' }}
                      >
                        {opcion.label}
                      </span>
                      {ordenarPor === opcion.value && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--gray-900)', color: 'white' }}
                        >
                          <CheckIcon />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer con botón aplicar */}
          <div
            className="px-5 py-4"
            style={{ borderTop: '1px solid var(--border-light)', background: 'var(--gray-50)' }}
          >
            <button
              onClick={() => setMostrarFiltros(false)}
              className="w-full py-3.5 rounded-xl text-[15px] font-semibold transition-all active:scale-[0.98]"
              style={{
                background: 'var(--gray-900)',
                color: 'var(--white)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              Ver resultados
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
