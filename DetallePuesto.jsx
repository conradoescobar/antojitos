import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import FormularioResena from '../components/FormularioResena'
import ModalReporte from '../components/ModalReporte'
import 'leaflet/dist/leaflet.css'

// Emojis para tipos de comida
const tipoEmojis = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌶️',
  'Bebidas': '🥤',
  'Postres': '🍮',
  'Otro': '🍽️'
}

// Ícono personalizado para el mapa
const puestoIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E63946"/>
          <stop offset="100%" style="stop-color:#FFB703"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30C40 9 31 0 20 0z" 
            fill="url(#grad)" filter="url(#shadow)"/>
      <circle cx="20" cy="18" r="8" fill="white"/>
    </svg>
  `),
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50]
})

function EstrellaIcono({ filled, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'w-7 h-7' : 'w-5 h-5'
  return (
    <svg
      className={`${sizeClass} transition-all duration-200`}
      fill={filled ? '#FFB703' : 'none'}
      stroke={filled ? '#FFB703' : '#D1D5DB'}
      strokeWidth="2"
      viewBox="0 0 24 24"
      style={filled ? { filter: 'drop-shadow(0 2px 4px rgba(255, 183, 3, 0.4))' } : {}}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function PromedioEstrellas({ promedio, total }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <EstrellaIcono key={num} filled={num <= Math.round(promedio)} size="lg" />
        ))}
      </div>
      <div>
        <span className="text-2xl font-bold text-[var(--color-carbon)]">
          {promedio > 0 ? promedio.toFixed(1) : '—'}
        </span>
        <span className="text-gray-500 text-sm ml-2">
          ({total} {total === 1 ? 'reseña' : 'reseñas'})
        </span>
      </div>
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
  const [imageLoaded, setImageLoaded] = useState(false)

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--color-mango)]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-salsa)] animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-4xl animate-wiggle">🌮</span>
          </div>
          <p className="text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !puesto) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="glass-card p-8 rounded-3xl text-center max-w-sm">
          <span className="text-5xl block mb-4">😢</span>
          <p className="text-[var(--color-salsa)] font-bold text-lg mb-4">No encontramos este puesto</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            <span>Volver al inicio</span>
          </button>
        </div>
      </div>
    )
  }

  const promedioEstrellas = resenas.length > 0
    ? resenas.reduce((sum, r) => sum + r.estrellas, 0) / resenas.length
    : 0

  return (
    <div className="min-h-screen pb-8">
      {/* Header flotante con efecto glass */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-card mx-4 mt-4 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg animate-slide-down">
          <button
            onClick={() => navigate('/')}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center hover:from-[var(--color-salsa)] hover:to-[var(--color-mango)] hover:text-white transition-all duration-300 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-bold text-[var(--color-carbon)] truncate">
              {puesto.nombre}
            </h1>
          </div>
          <button
            onClick={() => setMostrarModalReporte(true)}
            className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-[var(--color-salsa)] transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Imagen hero */}
      <div className="relative h-80 overflow-hidden">
        {puesto.foto_url ? (
          <>
            <img
              src={puesto.foto_url}
              alt={puesto.nombre}
              className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton" />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--color-mango-light)] via-[var(--color-mango)] to-[var(--color-salsa)] flex items-center justify-center">
            <span className="text-8xl animate-float">
              {tipoEmojis[puesto.tipo_comida] || '🍽️'}
            </span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-tortilla)] via-transparent to-transparent" />
      </div>

      {/* Contenido principal */}
      <div className="relative -mt-16 px-5 space-y-5">
        {/* Tarjeta de info principal */}
        <div className="glass-card rounded-3xl p-6 shadow-xl animate-slide-up">
          {/* Nombre y tipo */}
          <div className="mb-5">
            <h2 className="font-display text-3xl font-bold text-[var(--color-carbon)] mb-3">
              {puesto.nombre}
            </h2>
            {puesto.tipo_comida && (
              <span className="chip">
                <span className="text-lg mr-1">{tipoEmojis[puesto.tipo_comida] || '🍽️'}</span>
                {puesto.tipo_comida}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--color-mango)]/10 to-[var(--color-salsa)]/10 mb-5">
            <PromedioEstrellas promedio={promedioEstrellas} total={resenas.length} />
          </div>

          {/* Descripción */}
          {puesto.descripcion && (
            <p className="text-gray-600 leading-relaxed text-lg mb-5">
              {puesto.descripcion}
            </p>
          )}

          {/* Horario */}
          {(puesto.horario_apertura || puesto.horario_cierre) && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-salsa)] to-[var(--color-mango)] flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Horario de atención</p>
                <p className="text-lg font-bold text-[var(--color-carbon)]">
                  {puesto.horario_apertura && puesto.horario_cierre
                    ? `${puesto.horario_apertura.slice(0, 5)} - ${puesto.horario_cierre.slice(0, 5)}`
                    : puesto.horario_apertura
                    ? `Abre a las ${puesto.horario_apertura.slice(0, 5)}`
                    : `Cierra a las ${puesto.horario_cierre.slice(0, 5)}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mapa */}
        {puesto.latitud && puesto.longitud && (
          <div className="glass-card rounded-3xl overflow-hidden shadow-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-aguacate-light)] to-[var(--color-aguacate)] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--color-carbon)]">Ubicación</h3>
              </div>
            </div>
            <div className="h-52">
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
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <FormularioResena puestoId={id} onResenaEnviada={fetchResenas} />
        </div>

        {/* Lista de reseñas */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-xl animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-mango-light)] to-[var(--color-mango)] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--color-carbon)]">
                  Reseñas
                </h3>
              </div>
              <span className="chip text-xs py-1 px-3">{resenas.length}</span>
            </div>
          </div>

          {resenas.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {resenas.map((resena, index) => (
                <div 
                  key={resena.id} 
                  className="p-5 hover:bg-gray-50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <EstrellaIcono key={num} filled={num <= resena.estrellas} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400 font-medium">
                      {new Date(resena.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {resena.comentario && (
                    <p className="text-gray-600 leading-relaxed">{resena.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⭐</span>
              </div>
              <h4 className="font-display text-lg font-bold text-[var(--color-carbon)] mb-2">
                Sin reseñas aún
              </h4>
              <p className="text-gray-500">¡Sé el primero en compartir tu experiencia!</p>
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
