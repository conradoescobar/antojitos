import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import FormularioResena from '../components/FormularioResena'
import ModalReporte from '../components/ModalReporte'
import 'leaflet/dist/leaflet.css'

// Ícono naranja para el mapa pequeño
const puestoIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
            fill="#F97316" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
})

function EstrellaIcono({ filled }) {
  return (
    <svg
      className="w-5 h-5"
      fill={filled ? '#F97316' : 'none'}
      stroke="#F97316"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function PromedioEstrellas({ promedio, total }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((num) => (
          <EstrellaIcono key={num} filled={num <= Math.round(promedio)} />
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {promedio > 0 ? promedio.toFixed(1) : 'Sin reseñas'} ({total} {total === 1 ? 'reseña' : 'reseñas'})
      </span>
    </div>
  )
}

export default function DetallePuesto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [puesto, setPuesto] = useState(null)
  const [resenas, setResenas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mostrarModalReporte, setMostrarModalReporte] = useState(false)

  const fetchResenas = async () => {
    try {
      const { data: resenasData, error: resenasError } = await supabase
        .from('resenas')
        .select('*')
        .eq('puesto_id', id)
        .order('created_at', { ascending: false })

      if (resenasError) throw resenasError
      setResenas(resenasData || [])
    } catch (err) {
      console.error('Error cargando reseñas:', err)
    }
  }

  useEffect(() => {
    async function fetchPuestoYResenas() {
      try {
        setLoading(true)

        // Fetch puesto
        const { data: puestoData, error: puestoError } = await supabase
          .from('puestos')
          .select('*')
          .eq('id', id)
          .single()

        if (puestoError) throw puestoError
        setPuesto(puestoData)

        // Fetch reseñas
        await fetchResenas()
      } catch (err) {
        console.error('Error cargando puesto:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPuestoYResenas()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando puesto...</p>
        </div>
      </div>
    )
  }

  if (error || !puesto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">Error al cargar el puesto</p>
          <button
            onClick={() => navigate('/')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            Volver al mapa
          </button>
        </div>
      </div>
    )
  }

  const promedioEstrellas = resenas.length > 0
    ? resenas.reduce((sum, r) => sum + r.estrellas, 0) / resenas.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 truncate">{puesto.nombre}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Foto del puesto */}
        {puesto.foto_url && (
          <div className="bg-white rounded-lg overflow-hidden shadow">
            <img
              src={puesto.foto_url}
              alt={puesto.nombre}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Información principal */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{puesto.nombre}</h2>
            {puesto.tipo_comida && (
              <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {puesto.tipo_comida}
              </span>
            )}
          </div>

          {puesto.descripcion && (
            <p className="text-gray-700">{puesto.descripcion}</p>
          )}

          {puesto.horario && (
            <div className="flex items-start gap-2 text-gray-600">
              <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{puesto.horario}</span>
            </div>
          )}

          <div className="pt-2 border-t">
            <PromedioEstrellas promedio={promedioEstrellas} total={resenas.length} />
          </div>

          {/* Botón de reportar */}
          <button
            onClick={() => setMostrarModalReporte(true)}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Reportar problema
          </button>
        </div>

        {/* Mapa pequeño */}
        {puesto.latitud && puesto.longitud && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-3 border-b">
              <h3 className="font-semibold text-gray-900">Ubicación</h3>
            </div>
            <div className="h-48">
              <MapContainer
                center={[puesto.latitud, puesto.longitud]}
                zoom={16}
                className="w-full h-full"
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[puesto.latitud, puesto.longitud]} icon={puestoIcon} />
              </MapContainer>
            </div>
          </div>
        )}

        {/* Formulario de reseña */}
        <FormularioResena puestoId={id} onResenaEnviada={fetchResenas} />

        {/* Reseñas */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">
              Reseñas ({resenas.length})
            </h3>
          </div>

          {resenas.length > 0 ? (
            <div className="divide-y">
              {resenas.map((resena) => (
                <div key={resena.id} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <EstrellaIcono key={num} filled={num <= resena.estrellas} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(resena.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {resena.comentario && (
                    <p className="text-gray-700">{resena.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>Aún no hay reseñas para este puesto.</p>
              <p className="text-sm mt-1">¡Sé el primero en dejar una!</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de reporte */}
      {mostrarModalReporte && (
        <ModalReporte
          puestoId={id}
          nombrePuesto={puesto.nombre}
          onCerrar={() => setMostrarModalReporte(false)}
        />
      )}
    </div>
  )
}
