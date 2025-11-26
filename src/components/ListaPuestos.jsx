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
    <div className="h-full bg-white overflow-y-auto">
      <div className="sticky top-0 bg-white shadow-md z-10">
        {/* Header */}
        <div className="bg-orange-500 text-white px-4 py-3">
          <h2 className="text-lg font-bold">Puestos Cercanos</h2>
          <p className="text-sm opacity-90">
            {puestosConDistancia.length} {puestosConDistancia.length === 1 ? 'puesto' : 'puestos'}
            {filtroTipo !== 'Todos' && ` de ${filtroTipo}`}
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <input
              type="text"
              value={busqueda || ''}
              onChange={(e) => onBusquedaChange && onBusquedaChange(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {busqueda && (
              <button
                onClick={() => onBusquedaChange && onBusquedaChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Chips de filtro */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {tiposDisponibles.map((tipo) => (
              <button
                key={tipo}
                onClick={() => onFiltroChange && onFiltroChange(tipo)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                  filtroTipo === tipo
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {puestosConDistancia.map((puesto) => (
          <div
            key={puesto.id}
            onClick={() => onPuestoClick(puesto)}
            className="p-4 hover:bg-orange-50 cursor-pointer transition-colors duration-150"
          >
            <div className="flex gap-3">
              {/* Miniatura de foto */}
              {puesto.foto_url ? (
                <img
                  src={puesto.foto_url}
                  alt={puesto.nombre}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {puesto.nombre}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {puesto.tipo_comida || 'Comida variada'}
                </p>
                {puesto.descripcion && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {puesto.descripcion}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0 text-right">
                {puesto.distancia !== null ? (
                  <>
                    <div className="text-lg font-bold text-orange-600">
                      {puesto.distancia < 1
                        ? `${(puesto.distancia * 1000).toFixed(0)}m`
                        : `${puesto.distancia.toFixed(1)}km`}
                    </div>
                    <div className="text-xs text-gray-500">distancia</div>
                  </>
                ) : (
                  <div className="text-sm text-gray-400">-</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
