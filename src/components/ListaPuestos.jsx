import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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

// Emojis para cada tipo de comida
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

  // Calcular distancias y ordenar
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
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--color-mango)]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-salsa)] animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-3xl animate-wiggle">🌮</span>
          </div>
          <p className="text-gray-600 font-medium">Buscando antojitos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="glass-card p-8 rounded-3xl text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😢</span>
          </div>
          <p className="text-[var(--color-salsa)] font-bold text-lg mb-2">¡Ay caramba!</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide pt-6 pb-24">
      {/* Barra de búsqueda premium */}
      <div className="sticky top-0 z-20 px-5 pb-4 bg-gradient-to-b from-[var(--color-tortilla)] via-[var(--color-tortilla)] to-transparent">
        <div className={`relative transition-all duration-300 ${searchFocused ? 'transform scale-[1.02]' : ''}`}>
          <input
            type="text"
            value={busqueda || ''}
            onChange={(e) => onBusquedaChange && onBusquedaChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="¿Qué se te antoja hoy?"
            className="input-field pl-14 pr-12 text-lg"
          />

          {/* Search icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
              searchFocused
                ? 'bg-gradient-to-br from-[var(--color-salsa)] to-[var(--color-mango)]'
                : 'bg-gray-200'
            }`}>
              <svg
                className={`w-4 h-4 transition-colors ${searchFocused ? 'text-white' : 'text-gray-500'}`}
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
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-200 hover:bg-[var(--color-salsa)] hover:text-white transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Chips de filtro con scroll horizontal */}
      <div className="px-5 pb-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {tiposDisponibles.map((tipo, index) => (
            <button
              key={tipo}
              onClick={() => onFiltroChange && onFiltroChange(tipo)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all duration-300 animate-scale-in ${
                filtroTipo === tipo
                  ? 'bg-gradient-to-r from-[var(--color-salsa)] to-[var(--color-mango)] text-white shadow-lg scale-105'
                  : 'glass-card text-gray-700 hover:scale-105'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="text-lg">{tipoEmojis[tipo]}</span>
              <span>{tipo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">
            <span className="font-bold text-[var(--color-carbon)]">{puestosConDistancia.length}</span>
            {' '}
            {puestosConDistancia.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}
          </p>
          {userLocation && (
            <span className="distance-badge">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Ubicación activa
            </span>
          )}
        </div>
      </div>

      {/* Lista de tarjetas */}
      {puestosConDistancia.length > 0 ? (
        <div className="px-5 space-y-4">
          {puestosConDistancia.map((puesto, index) => (
            <div
              key={puesto.id}
              onClick={() => onPuestoClick(puesto)}
              className={`food-card cursor-pointer animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'backwards' }}
            >
              <div className="flex gap-4 p-4">
                {/* Imagen del puesto */}
                <div className="flex-shrink-0 relative group">
                  {puesto.foto_url ? (
                    <img
                      src={puesto.foto_url}
                      alt={puesto.nombre}
                      className="w-28 h-28 object-cover rounded-2xl shadow-md group-hover:shadow-xl transition-shadow"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[var(--color-mango-light)] to-[var(--color-mango)] flex items-center justify-center shadow-md">
                      <span className="text-5xl">
                        {tipoEmojis[puesto.tipo_comida] || '🍽️'}
                      </span>
                    </div>
                  )}

                  {/* Badge de distancia sobre la imagen */}
                  {puesto.distancia !== null && (
                    <div className="absolute -bottom-2 -right-2 distance-badge shadow-lg">
                      {puesto.distancia < 1
                        ? `${(puesto.distancia * 1000).toFixed(0)}m`
                        : `${puesto.distancia.toFixed(1)}km`}
                    </div>
                  )}
                </div>

                {/* Información del puesto */}
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="font-display text-xl font-bold text-[var(--color-carbon)] mb-2 truncate">
                    {puesto.nombre}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {puesto.tipo_comida && (
                      <span className="chip text-xs py-1 px-3">
                        <span className="mr-1">{tipoEmojis[puesto.tipo_comida] || '🍽️'}</span>
                        {puesto.tipo_comida}
                      </span>
                    )}
                    {puesto.horario_apertura && puesto.horario_cierre && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {puesto.horario_apertura.slice(0, 5)} - {puesto.horario_cierre.slice(0, 5)}
                      </span>
                    )}
                  </div>

                  {/* Descripción */}
                  {puesto.descripcion && (
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {puesto.descripcion}
                    </p>
                  )}
                </div>

                {/* Flecha indicadora */}
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-[var(--color-salsa)] group-hover:to-[var(--color-mango)] transition-all">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
            <span className="text-5xl">🔍</span>
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--color-carbon)] mb-2 text-center">
            No encontramos nada
          </h3>
          <p className="text-gray-500 text-center max-w-xs">
            Intenta con otros términos de búsqueda o explora diferentes categorías
          </p>
          {(busqueda || filtroTipo !== 'Todos') && (
            <button
              onClick={() => {
                onBusquedaChange && onBusquedaChange('')
                onFiltroChange && onFiltroChange('Todos')
              }}
              className="btn-primary mt-6"
            >
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      )}

      {/* Espacio extra al final */}
      <div className="h-8" />
    </div>
  )
}
