import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import FormularioResena from '../components/FormularioResena'
import ModalReporte from '../components/ModalReporte'
import { Card, Button, Badge, Spinner, EmptyState } from '../components/ui'
import 'leaflet/dist/leaflet.css'

const tipoIconos = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌽',
  'Bebidas': '🥤',
  'Postres': '🍮'
}

const puestoIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" width="40" height="48">
      <path d="M20 0 L4 8 v16 c0 8 5.5 15.5 13 17.3 L20 42 l3-0.7 c7.5-1.8 13-9.3 13-17.3 V8 L20 0z" fill="#F97316" stroke="#fff" stroke-width="2"/>
      <circle cx="20" cy="18" r="6" fill="#fff"/>
    </svg>
  `),
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -48]
})

function StarRating({ rating, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((num) => (
        <svg
          key={num}
          className={`${sizeClass} ${num <= Math.round(rating) ? 'star-filled' : 'star-empty'}`}
          fill={num <= Math.round(rating) ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
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
  const [isGuardado, setIsGuardado] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('antojitos_guardados')
    if (saved) {
      setIsGuardado(JSON.parse(saved).includes(id))
    }
  }, [id])

  const toggleGuardado = () => {
    const saved = localStorage.getItem('antojitos_guardados')
    let guardados = saved ? JSON.parse(saved) : []
    guardados = isGuardado ? guardados.filter(gid => gid !== id) : [...guardados, id]
    localStorage.setItem('antojitos_guardados', JSON.stringify(guardados))
    setIsGuardado(!isGuardado)
  }

  const fetchResenas = async () => {
    try {
      const { data, error } = await supabase
        .from('resenas')
        .select('*')
        .eq('puesto_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setResenas(data || [])
    } catch (err) {
      console.error('Error cargando reseñas:', err)
    }
  }

  useEffect(() => {
    async function fetchPuestoYResenas() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('puestos')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setPuesto(data)
        await fetchResenas()
      } catch (err) {
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
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !puesto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-sm text-center">
          <EmptyState
            emoji="😕"
            title="Error al cargar"
            description="No pudimos encontrar este lugar"
            action={
              <Button onClick={() => navigate('/')}>Volver al inicio</Button>
            }
          />
        </Card>
      </div>
    )
  }

  const promedioEstrellas = resenas.length > 0
    ? resenas.reduce((sum, r) => sum + r.estrellas, 0) / resenas.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 glass safe-area-top">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-gray-900 truncate flex-1">
            {puesto.nombre}
          </h1>
          <button
            onClick={toggleGuardado}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              isGuardado
                ? 'bg-warm-100 text-warm-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={isGuardado ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 space-y-4 pt-4">
        {/* Hero image */}
        {puesto.foto_url && (
          <div className="relative rounded-2xl overflow-hidden shadow-lg animate-fade-in">
            <img
              src={puesto.foto_url}
              alt={puesto.nombre}
              className="w-full h-56 object-cover"
            />
            <div className="absolute bottom-3 left-3">
              <Badge variant="warm" size="lg">
                {tipoIconos[puesto.tipo_comida] || '🍽️'} {puesto.tipo_comida}
              </Badge>
            </div>
          </div>
        )}

        {/* Info Card */}
        <Card>
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {puesto.nombre}
              </h2>
              {!puesto.foto_url && puesto.tipo_comida && (
                <Badge variant="warm">{tipoIconos[puesto.tipo_comida] || '🍽️'} {puesto.tipo_comida}</Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <StarRating rating={promedioEstrellas} />
              <span className="text-sm text-gray-600">
                {promedioEstrellas > 0 ? (
                  <>
                    <span className="font-semibold text-warm-600">{promedioEstrellas.toFixed(1)}</span>
                    {' '}· {resenas.length} {resenas.length === 1 ? 'reseña' : 'reseñas'}
                  </>
                ) : (
                  'Sin reseñas aún'
                )}
              </span>
            </div>

            {/* Description */}
            {puesto.descripcion && (
              <p className="text-gray-600 leading-relaxed">
                {puesto.descripcion}
              </p>
            )}

            {/* Schedule */}
            {(puesto.horario_apertura || puesto.horario_cierre) && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Horario</p>
                  <p className="text-gray-900 font-medium">
                    {puesto.horario_apertura && puesto.horario_cierre
                      ? `${puesto.horario_apertura.slice(0, 5)} - ${puesto.horario_cierre.slice(0, 5)}`
                      : puesto.horario_apertura
                      ? `Abre a las ${puesto.horario_apertura.slice(0, 5)}`
                      : `Cierra a las ${puesto.horario_cierre.slice(0, 5)}`}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setMostrarModalReporte(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
              Reportar problema
            </button>
          </div>
        </Card>

        {/* Map */}
        {puesto.latitud && puesto.longitud && (
          <Card padding="none" className="overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Ubicación</span>
            </div>
            <div className="h-44">
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
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  maxZoom={20}
                />
                <Marker position={[puesto.latitud, puesto.longitud]} icon={puestoIcon} />
              </MapContainer>
            </div>
          </Card>
        )}

        {/* Review Form */}
        <FormularioResena puestoId={id} onResenaEnviada={fetchResenas} />

        {/* Reviews */}
        <Card padding="none">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Reseñas</span>
            <Badge variant="default" size="sm">{resenas.length}</Badge>
          </div>

          {resenas.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {resenas.map((resena, index) => (
                <div
                  key={resena.id}
                  className="p-4 stagger-item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={resena.estrellas} size="sm" />
                    <span className="text-xs text-gray-400">
                      {new Date(resena.created_at).toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {resena.comentario && (
                    <p className="text-sm text-gray-600">{resena.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-2xl mb-2">⭐</p>
              <p className="text-sm text-gray-500">Sin reseñas aún</p>
            </div>
          )}
        </Card>
      </div>

      {/* Report Modal */}
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
