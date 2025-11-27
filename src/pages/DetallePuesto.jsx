import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import FormularioResena from '../components/FormularioResena'
import ModalReporte from '../components/ModalReporte'
import 'leaflet/dist/leaflet.css'

// Ícono personalizado para el mapa
const puestoIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B6B"/>
      <stop offset="100%" style="stop-color:#F59E0B"/>
    </linearGradient>
  </defs>
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="url(#grad)" stroke="white" stroke-width="1.5"/>
  <circle cx="12" cy="9" r="3" fill="white"/>
</svg>`

const puestoIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(puestoIconSvg),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
})

// Iconos SVG
const BackIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const AlertIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const StarIcon = ({ filled, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`star ${filled ? 'star-filled' : ''}`}
    style={{ color: filled ? 'var(--accent-amber)' : 'var(--text-muted)' }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

function PromedioEstrellas({ promedio, total }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((num) => (
          <StarIcon key={num} filled={num <= Math.round(promedio)} size={22} />
        ))}
      </div>
      <span style={{ color: 'var(--text-secondary)' }}>
        {promedio > 0 ? (
          <>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {promedio.toFixed(1)}
            </span>
            {' · '}{total} {total === 1 ? 'reseña' : 'reseñas'}
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-deep)' }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 animate-spin"
            style={{
              border: '3px solid var(--bg-elevated)',
              borderTopColor: 'var(--accent-amber)'
            }}
          />
          <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !puesto) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'var(--bg-deep)' }}
      >
        <div className="text-center max-w-sm">
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(255, 107, 107, 0.15)' }}
          >
            <AlertIcon />
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--accent-coral)' }}>
            No encontrado
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Este puesto no existe o fue eliminado
          </p>
          <button onClick={() => navigate('/')} className="btn-primary w-full">
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
    <div className="min-h-screen pb-8" style={{ background: 'var(--bg-deep)' }}>
      {/* Header fijo con blur */}
      <header
        className="sticky top-0 z-50 glass-heavy animate-slide-down"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)'
            }}
          >
            <BackIcon />
          </button>
          <h1
            className="text-lg font-bold truncate flex-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {puesto.nombre}
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 space-y-5 pt-5">
        {/* Imagen del puesto */}
        {puesto.foto_url && (
          <div
            className="rounded-3xl overflow-hidden animate-fade-in-up"
            style={{
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <img
              src={puesto.foto_url}
              alt={puesto.nombre}
              className="w-full h-72 sm:h-80 object-cover"
            />
          </div>
        )}

        {/* Información principal */}
        <div
          className="rounded-3xl p-6 space-y-5 animate-fade-in-up stagger-1"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {/* Título y tipo */}
          <div>
            <h2 className="font-display text-3xl font-bold mb-3 text-gradient-fire">
              {puesto.nombre}
            </h2>
            {puesto.tipo_comida && (
              <span
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: 'var(--gradient-fire)',
                  color: 'white'
                }}
              >
                {puesto.tipo_comida}
              </span>
            )}
          </div>

          {/* Rating */}
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <PromedioEstrellas promedio={promedioEstrellas} total={resenas.length} />
          </div>

          {/* Descripción */}
          {puesto.descripcion && (
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {puesto.descripcion}
            </p>
          )}

          {/* Horario */}
          {(puesto.horario_apertura || puesto.horario_cierre) && (
            <div
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-amber)'
                }}
              >
                <ClockIcon />
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  Horario
                </p>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {puesto.horario_apertura && puesto.horario_cierre
                    ? `${puesto.horario_apertura.slice(0, 5)} - ${puesto.horario_cierre.slice(0, 5)}`
                    : puesto.horario_apertura
                    ? `Abre a las ${puesto.horario_apertura.slice(0, 5)}`
                    : `Cierra a las ${puesto.horario_cierre.slice(0, 5)}`}
                </p>
              </div>
            </div>
          )}

          {/* Botón reportar */}
          <button
            onClick={() => setMostrarModalReporte(true)}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <AlertIcon />
            Reportar problema
          </button>
        </div>

        {/* Mapa */}
        {puesto.latitud && puesto.longitud && (
          <div
            className="rounded-3xl overflow-hidden animate-fade-in-up stagger-2"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-amber)'
                }}
              >
                <MapPinIcon />
              </div>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Ubicación
              </span>
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
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[puesto.latitud, puesto.longitud]} icon={puestoIcon} />
              </MapContainer>
            </div>
          </div>
        )}

        {/* Formulario de reseña */}
        <div className="animate-fade-in-up stagger-3">
          <FormularioResena puestoId={id} onResenaEnviada={fetchResenas} />
        </div>

        {/* Lista de reseñas */}
        <div
          className="rounded-3xl overflow-hidden animate-fade-in-up stagger-4"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              Reseñas
              {resenas.length > 0 && (
                <span
                  className="ml-2 text-sm font-normal"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ({resenas.length})
                </span>
              )}
            </h3>
          </div>

          {resenas.length > 0 ? (
            <div>
              {resenas.map((resena, index) => (
                <div
                  key={resena.id}
                  className="p-6 transition-colors"
                  style={{
                    borderBottom: index < resenas.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                  }}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <StarIcon key={num} filled={num <= resena.estrellas} size={18} />
                      ))}
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(resena.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {resena.comentario && (
                    <p
                      className="leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {resena.comentario}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <StarIcon filled={false} size={32} />
              </div>
              <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Sin reseñas todavía
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                ¡Sé el primero en compartir tu experiencia!
              </p>
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
