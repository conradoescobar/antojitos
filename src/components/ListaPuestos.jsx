import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Función para calcular distancia entre dos coordenadas (fórmula de Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distancia = R * c
  return distancia
}

// Iconos para cada tipo de comida
const tipoIconos = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌽',
  'Bebidas': '🥤',
  'Postres': '🍮',
  'Todos': '✨'
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

  // Filtrar por tipo y búsqueda
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

  // Calcular distancias y ordenar por cercanía
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
      <div className="h-full bg-noche-950 flex items-center justify-center">
        <div className="text-center">
          {/* Animated loader */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-noche-700 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-ambar-500 rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-transparent border-t-rosa-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <p className="text-crema-100/60 font-medium">Buscando antojitos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-noche-950 flex items-center justify-center p-4">
        <div className="text-center card-dark p-8 max-w-sm">
          <div className="w-16 h-16 bg-rosa-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rosa-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-rosa-400 font-semibold mb-2">Error al cargar</p>
          <p className="text-crema-100/50 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (puestos.length === 0) {
    return (
      <div className="h-full bg-noche-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🌮</div>
          <p className="text-crema-100/60">No hay puestos disponibles</p>
          <p className="text-crema-100/40 text-sm mt-1">Sé el primero en agregar uno</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-noche-950 overflow-y-auto">
      {/* Barra de búsqueda con estilo dark */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-2 glass-dark">
        <div className="relative">
          <input
            type="text"
            value={busqueda || ''}
            onChange={(e) => onBusquedaChange && onBusquedaChange(e.target.value)}
            placeholder="Buscar antojitos..."
            className="input-dark pl-12 pr-12"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-crema-100/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {busqueda && (
            <button
              onClick={() => onBusquedaChange && onBusquedaChange('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-crema-100/40 hover:text-crema-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Chips de filtro con iconos */}
      <div className="px-4 pb-3 sticky top-[68px] glass-dark z-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {tiposDisponibles.map((tipo) => (
            <button
              key={tipo}
              onClick={() => onFiltroChange && onFiltroChange(tipo)}
              className={`chip whitespace-nowrap flex items-center gap-1.5 ${
                filtroTipo === tipo ? 'chip-active' : 'chip-inactive'
              }`}
            >
              <span>{tipoIconos[tipo] || '🍽️'}</span>
              <span>{tipo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="px-4 pb-3">
        <p className="text-sm text-crema-100/50 font-medium">
          <span className="text-ambar-400">{puestosConDistancia.length}</span>
          {' '}{puestosConDistancia.length === 1 ? 'puesto encontrado' : 'puestos encontrados'}
          {filtroTipo !== 'Todos' && (
            <span className="text-crema-100/30"> · {filtroTipo}</span>
          )}
        </p>
      </div>

      {/* Tarjetas de puestos con animación escalonada */}
      <div className="px-4 pb-24 space-y-3">
        {puestosConDistancia.map((puesto, index) => (
          <div
            key={puesto.id}
            onClick={() => onPuestoClick(puesto)}
            className="card-dark-hover cursor-pointer overflow-hidden stagger-item"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex gap-4 p-4">
              {/* Miniatura de foto con overlay gradient */}
              <div className="flex-shrink-0 relative">
                {puesto.foto_url ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden">
                    <img
                      src={puesto.foto_url}
                      alt={puesto.nombre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noche-900/60 to-transparent" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-noche-700 to-noche-800 rounded-xl flex items-center justify-center border border-noche-600/50">
                    <span className="text-4xl opacity-60">
                      {tipoIconos[puesto.tipo_comida] || '🍽️'}
                    </span>
                  </div>
                )}
              </div>

              {/* Información */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-display font-bold text-crema-50 mb-1.5 text-lg truncate">
                  {puesto.nombre}
                </h3>

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* Badge de tipo */}
                  <span className="type-badge text-xs">
                    {tipoIconos[puesto.tipo_comida] || '🍽️'} {puesto.tipo_comida || 'Comida'}
                  </span>

                  {/* Badge de distancia */}
                  {puesto.distancia !== null && (
                    <span className="distance-badge">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {puesto.distancia < 1
                        ? `${(puesto.distancia * 1000).toFixed(0)}m`
                        : `${puesto.distancia.toFixed(1)}km`}
                    </span>
                  )}
                </div>

                {puesto.descripcion && (
                  <p className="text-sm text-crema-100/50 line-clamp-2 leading-relaxed">
                    {puesto.descripcion}
                  </p>
                )}
              </div>

              {/* Flecha indicadora con efecto */}
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 rounded-full bg-noche-700/50 flex items-center justify-center group-hover:bg-ambar-500/20 transition-colors">
                  <svg className="w-4 h-4 text-crema-100/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Línea de acento inferior */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-ambar-500/20 to-transparent" />
          </div>
        ))}
      </div>

      {/* Empty state para búsqueda sin resultados */}
      {puestosConDistancia.length === 0 && puestos.length > 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-5xl mb-4 opacity-50">🔍</div>
          <p className="text-crema-100/60 font-medium text-center">
            No encontramos resultados
          </p>
          <p className="text-crema-100/40 text-sm text-center mt-1">
            Intenta con otra búsqueda o filtro
          </p>
          <button
            onClick={() => {
              onBusquedaChange && onBusquedaChange('')
              onFiltroChange && onFiltroChange('Todos')
            }}
            className="mt-4 btn-secondary text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
