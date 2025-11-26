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
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold truncate">{puesto.nombre}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-4 -mt-4">
        {/* Foto del puesto con esquinas redondeadas superiores */}
        {puesto.foto_url && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <img
              src={puesto.foto_url}
              alt={puesto.nombre}
              className="w-full h-72 object-cover"
            />
          </div>
        )}

        {/* Tarjeta de información principal */}
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-gray-100">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{puesto.nombre}</h2>
                {puesto.tipo_comida && (
                  <span className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                    {puesto.tipo_comida}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <PromedioEstrellas promedio={promedioEstrellas} total={resenas.length} />
            </div>
          </div>

          {puesto.descripcion && (
            <div className="pt-3">
              <p className="text-gray-700 leading-relaxed text-base">{puesto.descripcion}</p>
            </div>
          )}

          {puesto.horario && (
            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Horario</p>
                <p className="font-semibold">{puesto.horario}</p>
              </div>
            </div>
          )}

          {/* Botón de reportar con mejor diseño */}
          <button
            onClick={() => setMostrarModalReporte(true)}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 active:scale-98 transition-all font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Reportar problema
          </button>
        </div>

        {/* Mapa con mejor diseño */}
        {puesto.latitud && puesto.longitud && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="font-bold text-gray-900">Ubicación</h3>
              </div>
            </div>
            <div className="h-56">
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

        {/* Reseñas con mejor diseño */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
            <h3 className="font-bold text-gray-900 text-lg">
              Reseñas · {resenas.length}
            </h3>
          </div>

          {resenas.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {resenas.map((resena) => (
                <div key={resena.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <EstrellaIcono key={num} filled={num <= resena.estrellas} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      {new Date(resena.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {resena.comentario && (
                    <p className="text-gray-700 leading-relaxed">{resena.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-1">Aún no hay reseñas</p>
              <p className="text-sm text-gray-500">¡Sé el primero en dejar una reseña!</p>
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
