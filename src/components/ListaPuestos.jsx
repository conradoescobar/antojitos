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

  // Filtrar por tipo si no es "Todos"
  if (filtroTipo !== 'Todos') {
    puestosFiltrados = puestosFiltrados.filter(p => p.tipo_comida === filtroTipo)
  }

  // Filtrar por búsqueda
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
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando puestos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error al cargar puestos</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (puestos.length === 0) {
    return (
      <div className="h-full bg-white flex items-center justify-center p-4">
        <p className="text-gray-500">No hay puestos disponibles en este momento</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Barra de búsqueda flotante */}
      <div className="sticky top-0 bg-gradient-to-b from-gray-50 to-transparent z-10 px-4 pt-4 pb-2">
        <div className="relative">
          <input
            type="text"
            value={busqueda || ''}
            onChange={(e) => onBusquedaChange && onBusquedaChange(e.target.value)}
            placeholder="Buscar puestos..."
            className="w-full px-4 py-3 pl-12 pr-12 bg-white border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all shadow-sm"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {busqueda && (
            <button
              onClick={() => onBusquedaChange && onBusquedaChange('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Chips de filtro */}
      <div className="px-4 pb-3 sticky top-[72px] bg-gray-50 z-10">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tiposDisponibles.map((tipo) => (
            <button
              key={tipo}
              onClick={() => onFiltroChange && onFiltroChange(tipo)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
                filtroTipo === tipo
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-600 font-medium">
          {puestosConDistancia.length} {puestosConDistancia.length === 1 ? 'puesto encontrado' : 'puestos encontrados'}
          {filtroTipo !== 'Todos' && ` · ${filtroTipo}`}
        </p>
      </div>

      {/* Tarjetas de puestos */}
      <div className="px-4 pb-4 space-y-3">
        {puestosConDistancia.map((puesto) => (
          <div
            key={puesto.id}
            onClick={() => onPuestoClick(puesto)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl active:scale-98 cursor-pointer transition-all duration-200 overflow-hidden border border-gray-100"
          >
            <div className="flex gap-4 p-4">
              {/* Miniatura de foto */}
              <div className="flex-shrink-0">
                {puesto.foto_url ? (
                  <img
                    src={puesto.foto_url}
                    alt={puesto.nombre}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Información */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 mb-1 text-lg truncate">
                  {puesto.nombre}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                    {puesto.tipo_comida || 'Comida'}
                  </span>
                  {puesto.distancia !== null && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {puesto.descripcion}
                  </p>
                )}
              </div>

              {/* Flecha indicadora */}
              <div className="flex-shrink-0 flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
