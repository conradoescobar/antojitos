import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import FormularioResena from '../components/FormularioResena'
import ModalReporte from '../components/ModalReporte'
import 'leaflet/dist/leaflet.css'

// Iconos para tipos de comida
const tipoIconos = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌽',
  'Bebidas': '🥤',
  'Postres': '🍮'
}

// Ícono ámbar para el mapa
const puestoIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
            fill="#FFB800" stroke="#0D0D0D" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4" fill="#0D0D0D"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
})

function EstrellaIcono({ filled }) {
  return (
    <svg
      className={`w-5 h-5 ${filled ? 'star-filled' : 'star-empty'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function PromedioEstrellas({ promedio, total }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((num) => (
          <EstrellaIcono key={num} filled={num <= Math.round(promedio)} />
        ))}
      </div>
      <span className="text-sm text-crema-100/60 font-medium">
        {promedio > 0 ? (
          <>
            <span className="text-ambar-400 font-bold">{promedio.toFixed(1)}</span>
            {' '}· {total} {total === 1 ? 'reseña' : 'reseñas'}
          </>
        ) : (
          'Sin reseñas aún'
        )}
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

        const { data: puestoData, error: puestoError } = await supabase
          .from('puestos')
          .select('*')
          .eq('id', id)
          .single()

        if (puestoError) throw puestoError
        setPuesto(puestoData)

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
      <div className="min-h-screen bg-noche-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-noche-700 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-ambar-500 rounded-full animate-spin" />
          </div>
          <p className="text-crema-100/60 font-medium">Cargando puesto...</p>
        </div>
      </div>
    )
  }

  if (error || !puesto) {
    return (
      <div className="min-h-screen bg-noche-950 flex items-center justify-center p-4">
        <div className="text-center card-dark p-8 max-w-sm">
          <div className="w-16 h-16 bg-rosa-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rosa-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-rosa-400 font-semibold mb-4">Error al cargar el puesto</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
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
    <div className="min-h-screen bg-noche-950 pb-8 relative">
      {/* Efecto de luz ambiental */}
      <div className="ambient-glow w-96 h-96 bg-ambar-500 -top-48 -right-48 rounded-full" />

      {/* Header flotante con glassmorphism */}
      <div className="sticky top-0 z-50 glass-dark border-b border-noche-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-noche-700/50 hover:bg-noche-600/50 transition-colors text-crema-100 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-display font-bold text-crema-50 truncate flex-1">
            {puesto.nombre}
          </h1>
          <span className="text-2xl">{tipoIconos[puesto.tipo_comida] || '🍽️'}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-5 pt-5 relative">
        {/* Hero image con overlay */}
        {puesto.foto_url && (
          <div className="relative rounded-2xl overflow-hidden animate-fade-in">
            <img
              src={puesto.foto_url}
              alt={puesto.nombre}
              className="w-full h-72 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noche-950 via-noche-950/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="type-badge">
                {tipoIconos[puesto.tipo_comida] || '🍽️'} {puesto.tipo_comida}
              </span>
            </div>
          </div>
        )}

        {/* Tarjeta de información principal */}
        <div className="card-dark p-6 space-y-5 animate-stagger-1">
          {/* Título y tipo */}
          <div>
            <h2 className="text-3xl font-display font-bold text-crema-50 mb-3">
              {puesto.nombre}
            </h2>
            {!puesto.foto_url && puesto.tipo_comida && (
              <span className="type-badge">
                {tipoIconos[puesto.tipo_comida] || '🍽️'} {puesto.tipo_comida}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="bg-noche-700/40 rounded-xl p-4 border border-noche-600/30">
            <PromedioEstrellas promedio={promedioEstrellas} total={resenas.length} />
          </div>

          {/* Descripción */}
          {puesto.descripcion && (
            <p className="text-crema-100/70 leading-relaxed">
              {puesto.descripcion}
            </p>
          )}

          {/* Horario */}
          {(puesto.horario_apertura || puesto.horario_cierre) && (
            <div className="flex items-center gap-4 p-4 bg-noche-700/30 rounded-xl border border-noche-600/30">
              <div className="w-12 h-12 bg-ambar-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-ambar-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-crema-100/40 font-medium uppercase tracking-wider">Horario</p>
                <p className="text-crema-100 font-semibold text-lg">
                  {puesto.horario_apertura && puesto.horario_cierre
                    ? `${puesto.horario_apertura.slice(0, 5)} - ${puesto.horario_cierre.slice(0, 5)}`
                    : puesto.horario_apertura
                    ? `Abre a las ${puesto.horario_apertura.slice(0, 5)}`
                    : `Cierra a las ${puesto.horario_cierre.slice(0, 5)}`}
                </p>
              </div>
            </div>
          )}

          {/* Botón de reportar */}
          <button
            onClick={() => setMostrarModalReporte(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-noche-600 text-crema-100/70 rounded-xl hover:border-rosa-500/50 hover:text-rosa-400 active:scale-98 transition-all font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Reportar problema
          </button>
        </div>

        {/* Mapa */}
        {puesto.latitud && puesto.longitud && (
          <div className="card-dark overflow-hidden animate-stagger-2">
            <div className="px-5 py-4 border-b border-noche-600/30 flex items-center gap-3">
              <div className="w-8 h-8 bg-lima-500/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-lima-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-crema-50">Ubicación</h3>
            </div>
            <div className="h-56">
              <MapContainer
                center={[puesto.latitud, puesto.longitud]}
                zoom={17}
                className="w-full h-full"
                zoomControl={false}
                attributionControl={false}
                dragging={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  maxZoom={20}
                />
                <Marker position={[puesto.latitud, puesto.longitud]} icon={puestoIcon} />
              </MapContainer>
            </div>
          </div>
        )}

        {/* Formulario de reseña */}
        <div className="animate-stagger-3">
          <FormularioResena puestoId={id} onResenaEnviada={fetchResenas} />
        </div>

        {/* Reseñas */}
        <div className="card-dark overflow-hidden animate-stagger-4">
          <div className="px-5 py-4 border-b border-noche-600/30 flex items-center justify-between">
            <h3 className="font-display font-bold text-crema-50 text-lg">
              Reseñas
            </h3>
            <span className="text-sm text-crema-100/40 font-medium">
              {resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'}
            </span>
          </div>

          {resenas.length > 0 ? (
            <div className="divide-y divide-noche-600/30">
              {resenas.map((resena, index) => (
                <div
                  key={resena.id}
                  className="p-5 hover:bg-noche-700/30 transition-colors stagger-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <EstrellaIcono key={num} filled={num <= resena.estrellas} />
                      ))}
                    </div>
                    <span className="text-sm text-crema-100/40 font-medium">
                      {new Date(resena.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {resena.comentario && (
                    <p className="text-crema-100/70 leading-relaxed">{resena.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4 opacity-40">⭐</div>
              <p className="text-crema-100/60 font-medium mb-1">Aún no hay reseñas</p>
              <p className="text-sm text-crema-100/40">¡Sé el primero en dejar una!</p>
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

      {/* Noise overlay */}
      <div className="noise-overlay" />
    </div>
  )
}
