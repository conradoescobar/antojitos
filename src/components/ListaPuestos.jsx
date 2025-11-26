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

export default function ListaPuestos({ userLocation, onPuestoClick, puestos, setPuestos }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  // Calcular distancias y ordenar por cercanía
  const puestosConDistancia = puestos.map(puesto => {
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
      <div className="sticky top-0 bg-orange-500 text-white px-4 py-3 shadow-md z-10">
        <h2 className="text-lg font-bold">Puestos Cercanos</h2>
        <p className="text-sm opacity-90">{puestos.length} puestos disponibles</p>
      </div>

      <div className="divide-y divide-gray-200">
        {puestosConDistancia.map((puesto) => (
          <div
            key={puesto.id}
            onClick={() => onPuestoClick(puesto)}
            className="p-4 hover:bg-orange-50 cursor-pointer transition-colors duration-150"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {puesto.nombre}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {puesto.tipo_comida || 'Comida variada'}
                </p>
                {puesto.descripcion && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {puesto.descripcion}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 text-right">
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
