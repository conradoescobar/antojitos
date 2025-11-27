import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Haversine distance calculation
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

const tipoEmojis = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌶️',
  'Bebidas': '🥤',
  'Postres': '🍮',
  'Otro': '🍽️',
  'Todos': '✨'
}

export default function ListaPuestos({ 
  userLocation, 
  onPuestoClick, 
  puestos, 
  setPuestos, 
  filtroTipo, 
  onFiltroChange, 
  busqueda, 
  onBusquedaChange 
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchFocused, setSearchFocused] = useState(false)

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

  // Calculate distances and sort
  const puestosConDistancia = puestosFiltrados.map(puesto => {
    if (userLocation && puesto.latitud && puesto.longitud) {
      const distancia = calcularDistancia(
        userLocation[0], userLocation[1],
        puesto.latitud, puesto.longitud
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
      <div className="h-full flex items-center justify-center bg-[var(--night-black)] bg-grid">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--neon-pink)]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--neon-pink)] animate-spin" style={{ boxShadow: 'var(--glow-pink)' }} />
            <span className="absolute inset-0 flex items-center justify-center text-4xl animate-float-up">🌮</span>
          </div>
          <p className="text-[var(--text-muted)] font-display text-xl tracking-widest">BUSCANDO...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--night-black)] p-8">
        <div className="neon-card p-8 text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-[var(--neon-pink)]/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😢</span>
          </div>
          <p className="text-[var(--neon-pink)] font-display text-2xl mb-2">¡Ay caramba!</p>
          <p className="text-[var(--text-muted)] text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-[var(--night-black)] bg-grid pb-28">
      {/* Search Bar */}
      <div className="sticky top-0 z-20 px-5 py-4 bg-gradient-to-b from-[var(--night-black)] via-[var(--night-black)] to-transparent">
        <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
          <input
            type="text"
            value={busqueda || ''}
            onChange={(e) => onBusquedaChange && onBusquedaChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="¿Qué se te antoja?"
            className="input-dark pl-14 pr-12 text-lg"
          />
          
          {/* Search icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
              searchFocused 
                ? 'bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-orange)]' 
                : 'bg-[var(--night-light)]'
            }`}>
              <svg 
                className={`w-4 h-4 transition-colors ${searchFocused ? 'text-[var(--night-black)]' : 'text-[var(--text-muted)]'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Clear button */}
          {busqueda && (
            <button
              onClick={() => onBusquedaChange && onBusquedaChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--night-light)] hover:bg-[var(--neon-pink)] hover:text-[var(--night-black)] transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-5 pb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {tiposDisponibles.map((tipo, index) => (
            <button
              key={tipo}
              onClick={() => onFiltroChange && onFiltroChange(tipo)}
              className={`chip-neon whitespace-nowrap animate-scale-in ${filtroTipo === tipo ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="text-base">{tipoEmojis[tipo]}</span>
              <span>{tipo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          <span className="font-display text-xl text-[var(--neon-cyan)]" style={{ textShadow: 'var(--glow-cyan)' }}>
            {puestosConDistancia.length}
          </span>
          {' '}
          {puestosConDistancia.length === 1 ? 'lugar' : 'lugares'}
        </p>
        {userLocation && (
          <div className="badge-distance">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            GPS Activo
          </div>
        )}
      </div>

      {/* Food Cards */}
      {puestosConDistancia.length > 0 ? (
        <div className="px-5 space-y-4">
          {puestosConDistancia.map((puesto, index) => (
            <div
              key={puesto.id}
              onClick={() => onPuestoClick(puesto)}
              className="food-card cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'backwards' }}
            >
              <div className="flex gap-4 p-4">
                {/* Image */}
                <div className="flex-shrink-0 relative">
                  {puesto.foto_url ? (
                    <img
                      src={puesto.foto_url}
                      alt={puesto.nombre}
                      className="w-28 h-28 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-[var(--neon-pink)]/20 to-[var(--neon-orange)]/20 flex items-center justify-center border border-[var(--neon-pink)]/20">
                      <span className="text-5xl">
                        {tipoEmojis[puesto.tipo_comida] || '🍽️'}
                      </span>
                    </div>
                  )}
                  
                  {/* Distance badge */}
                  {puesto.distancia !== null && (
                    <div className="absolute -bottom-2 -right-2 badge-distance shadow-lg">
                      {puesto.distancia < 1
                        ? `${(puesto.distancia * 1000).toFixed(0)}m`
                        : `${puesto.distancia.toFixed(1)}km`}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="font-display text-xl text-[var(--text-bright)] mb-2 truncate tracking-wide">
                    {puesto.nombre}
                  </h3>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {puesto.tipo_comida && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--neon-orange)]/15 text-[var(--neon-orange)] border border-[var(--neon-orange)]/30">
                        <span>{tipoEmojis[puesto.tipo_comida] || '🍽️'}</span>
                        {puesto.tipo_comida}
                      </span>
                    )}
                    {puesto.horario_apertura && puesto.horario_cierre && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--night-light)] text-[var(--text-dim)]">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {puesto.horario_apertura.slice(0, 5)} - {puesto.horario_cierre.slice(0, 5)}
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  {puesto.descripcion && (
                    <p className="text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {puesto.descripcion}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-[var(--night-light)] flex items-center justify-center group-hover:bg-[var(--neon-pink)] transition-all">
                    <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-8">
          <div className="w-28 h-28 rounded-full bg-[var(--night-medium)] flex items-center justify-center mb-6 animate-float-up">
            <span className="text-6xl">🔍</span>
          </div>
          <h3 className="font-display text-2xl text-[var(--text-bright)] mb-2 text-center tracking-wide">
            NADA POR AQUÍ
          </h3>
          <p className="text-[var(--text-muted)] text-center max-w-xs mb-6">
            Intenta con otros términos o explora otras categorías
          </p>
          {(busqueda || filtroTipo !== 'Todos') && (
            <button
              onClick={() => {
                onBusquedaChange && onBusquedaChange('')
                onFiltroChange && onFiltroChange('Todos')
              }}
              className="btn-ghost"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
