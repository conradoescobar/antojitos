import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import FormularioResena from '../components/FormularioResena'
import ModalReporte from '../components/ModalReporte'
import 'leaflet/dist/leaflet.css'

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

// Neon puesto icon for map
const puestoIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 65" width="50" height="65">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF2E63"/>
          <stop offset="100%" style="stop-color:#FF6B35"/>
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M25 3C12 3 2 13 2 25c0 18 23 37 23 37s23-19 23-37C48 13 38 3 25 3z"
            fill="url(#grad)" filter="url(#glow)"/>
      <circle cx="25" cy="23" r="10" fill="#0A0A0F"/>
      <text x="25" y="28" text-anchor="middle" font-size="14">🌮</text>
    </svg>
  `),
  iconSize: [50, 65],
  iconAnchor: [25, 65],
  popupAnchor: [0, -65]
})

function StarIcon({ filled, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  return (
    <svg
      className={`${sizeClass} star-neon ${filled ? 'filled' : ''} transition-all duration-200`}
      fill={filled ? 'var(--neon-yellow)' : 'none'}
      stroke={filled ? 'var(--neon-yellow)' : 'var(--text-muted)'}
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function RatingDisplay({ promedio, total }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <StarIcon key={num} filled={num <= Math.round(promedio)} size="lg" />
        ))}
      </div>
      <div>
        <span className="text-3xl font-display text-[var(--neon-yellow)]" style={{ textShadow: 'var(--glow-yellow)' }}>
          {promedio > 0 ? promedio.toFixed(1) : '—'}
        </span>
        <span className="text-[var(--text-muted)] text-sm ml-2">
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
      <div className="min-h-screen bg-[var(--night-black)] bg-grid flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--neon-pink)]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--neon-pink)] animate-spin" style={{ boxShadow: 'var(--glow-pink)' }} />
            <span className="absolute inset-0 flex items-center justify-center text-5xl animate-float-up">🌮</span>
          </div>
          <p className="text-[var(--text-muted)] font-display text-xl tracking-widest">CARGANDO...</p>
        </div>
      </div>
    )
  }

  if (error || !puesto) {
    return (
      <div className="min-h-screen bg-[var(--night-black)] bg-grid flex items-center justify-center p-8">
        <div className="neon-card p-8 text-center max-w-sm">
          <span className="text-6xl block mb-4">😢</span>
          <p className="text-[var(--neon-pink)] font-display text-2xl mb-4">NO ENCONTRADO</p>
          <button onClick={() => navigate('/')} className="btn-neon">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const promedioEstrellas = resenas.length > 0
    ? resenas.reduce((sum, r) => sum + r.estrellas, 0) / resenas.length
    : 0

  return (
    <div className="min-h-screen bg-[var(--night-black)] bg-grid pb-8">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-gradient-to-r from-[var(--neon-pink)] via-[var(--neon-orange)] to-[var(--neon-yellow)] animate-gradient" />
        <div className="glass-dark mx-4 mt-4 rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/5 animate-slide-down">
          <button
            onClick={() => navigate('/')}
            className="w-11 h-11 rounded-xl bg-[var(--night-medium)] flex items-center justify-center hover:bg-[var(--neon-pink)] hover:text-[var(--night-black)] transition-all duration-300 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg text-[var(--text-bright)] truncate tracking-wide">
              {puesto.nombre}
            </h1>
          </div>
          <button
            onClick={toggleGuardado}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isGuardado
                ? 'bg-[var(--neon-yellow)]/20 text-[var(--neon-yellow)] border border-[var(--neon-yellow)]/50'
                : 'bg-[var(--night-medium)] hover:bg-[var(--neon-yellow)]/10 hover:text-[var(--neon-yellow)]'
            }`}
            style={isGuardado ? { boxShadow: 'var(--glow-yellow)' } : {}}
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
          <button
            onClick={() => setMostrarModalReporte(true)}
            className="w-11 h-11 rounded-xl bg-[var(--night-medium)] flex items-center justify-center hover:bg-[var(--neon-pink)]/20 hover:text-[var(--neon-pink)] transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Image */}
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
              <div className="absolute inset-0 bg-[var(--night-medium)] animate-pulse" />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--neon-pink)]/20 via-[var(--night-deep)] to-[var(--neon-orange)]/20 flex items-center justify-center">
            <span className="text-9xl animate-float-up">
              {tipoEmojis[puesto.tipo_comida] || '🍽️'}
            </span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--night-black)] via-transparent to-transparent" />
        {/* Neon line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--neon-pink)] via-[var(--neon-orange)] to-[var(--neon-yellow)]" style={{ boxShadow: '0 0 20px var(--neon-pink)' }} />
      </div>

      {/* Main Content */}
      <div className="relative -mt-16 px-5 space-y-5">
        {/* Main Info Card */}
        <div className="neon-card rounded-3xl p-6 animate-slide-up">
          {/* Name and type */}
          <div className="mb-5">
            <h2 className="font-display text-4xl gradient-text mb-3 tracking-wide">
              {puesto.nombre}
            </h2>
            {puesto.tipo_comida && (
              <span className="chip-neon">
                <span className="text-lg">{tipoEmojis[puesto.tipo_comida] || '🍽️'}</span>
                {puesto.tipo_comida}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="p-4 rounded-2xl bg-[var(--night-medium)] border border-[var(--neon-yellow)]/10 mb-5">
            <RatingDisplay promedio={promedioEstrellas} total={resenas.length} />
          </div>

          {/* Description */}
          {puesto.descripcion && (
            <p className="text-[var(--text-dim)] leading-relaxed text-lg mb-5">
              {puesto.descripcion}
            </p>
          )}

          {/* Schedule */}
          {(puesto.horario_apertura || puesto.horario_cierre) && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--night-medium)]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-cyan)]/50 flex items-center justify-center" style={{ boxShadow: 'var(--glow-cyan)' }}>
                <svg className="w-6 h-6 text-[var(--night-black)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Horario</p>
                <p className="text-lg font-semibold text-[var(--neon-cyan)]">
                  {puesto.horario_apertura && puesto.horario_cierre
                    ? `${puesto.horario_apertura.slice(0, 5)} - ${puesto.horario_cierre.slice(0, 5)}`
                    : puesto.horario_apertura
                    ? `Abre ${puesto.horario_apertura.slice(0, 5)}`
                    : `Cierra ${puesto.horario_cierre.slice(0, 5)}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        {puesto.latitud && puesto.longitud && (
          <div className="neon-card rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-green)] to-[var(--neon-cyan)] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--night-black)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl text-[var(--text-bright)] tracking-wide">UBICACIÓN</h3>
              </div>
            </div>
            <div className="h-52">
              <MapContainer
                center={[puesto.latitud, puesto.longitud]}
                zoom={16}
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

        {/* Review Form */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <FormularioResena puestoId={id} onResenaEnviada={fetchResenas} />
        </div>

        {/* Reviews List */}
        <div className="neon-card rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-yellow)] to-[var(--neon-orange)] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--night-black)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl text-[var(--text-bright)] tracking-wide">RESEÑAS</h3>
              </div>
              <span className="chip-neon text-xs py-1 px-3">{resenas.length}</span>
            </div>
          </div>

          {resenas.length > 0 ? (
            <div className="divide-y divide-white/5">
              {resenas.map((resena, index) => (
                <div
                  key={resena.id}
                  className="p-5 hover:bg-white/[0.02] transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <StarIcon key={num} filled={num <= resena.estrellas} />
                      ))}
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">
                      {new Date(resena.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {resena.comentario && (
                    <p className="text-[var(--text-dim)] leading-relaxed">{resena.comentario}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--night-medium)] flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⭐</span>
              </div>
              <h4 className="font-display text-xl text-[var(--text-bright)] mb-2 tracking-wide">
                SIN RESEÑAS
              </h4>
              <p className="text-[var(--text-muted)]">¡Sé el primero en opinar!</p>
            </div>
          )}
        </div>
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
