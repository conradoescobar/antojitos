import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Colores del sistema de diseño
const COLORS = {
  primary: '#FF6F3C',
  gray900: '#1A1A1A',
  gray600: '#525253',
  gray400: '#A1A1A2'
}

// Emojis por tipo de comida
const FOOD_EMOJIS = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌯',
  'Bebidas': '🥤',
  'Postres': '🍮',
  'default': '🍽️'
}

// Iconos minimalistas
const MapPinIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const ChevronIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// Componente de estrellas compacto
function StarRating({ rating, size = 12 }) {
  const fullStars = Math.floor(rating || 0)
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < fullStars ? COLORS.primary : 'none'} stroke={i < fullStars ? COLORS.primary : '#D4D4D5'} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-[12px] font-medium" style={{ color: COLORS.gray600 }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

// Función para calcular distancia (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calcular promedio de reseñas
function calcularPromedio(puesto) {
  const campos = ['sabor', 'precio', 'higiene', 'cantidad', 'atencion']
  const valores = campos.map(c => puesto[c]).filter(v => v != null && v > 0)
  if (valores.length === 0) return 0
  return valores.reduce((a, b) => a + b, 0) / valores.length
}

export default function ListaPuestos({ userLocation, onPuestoClick, puestos, setPuestos, filtroTipo, onFiltroChange, busqueda, onBusquedaChange, filtroEstrellas = 0, ordenarPor = 'distancia' }) {
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

  // Filtrar
  let puestosFiltrados = puestos

  if (filtroTipo !== 'Todos') {
    puestosFiltrados = puestosFiltrados.filter(p => p.tipo_comida === filtroTipo)
  }

  if (busqueda && busqueda.trim()) {
    const busquedaLower = busqueda.toLowerCase().trim()
    puestosFiltrados = puestosFiltrados.filter(p =>
      p.nombre.toLowerCase().includes(busquedaLower) ||
      (p.tipo_comida && p.tipo_comida.toLowerCase().includes(busquedaLower)) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(busquedaLower))
    )
  }

  // Filtrar por estrellas
  if (filtroEstrellas > 0) {
    puestosFiltrados = puestosFiltrados.filter(p => calcularPromedio(p) >= filtroEstrellas)
  }

  // Calcular distancias
  const puestosConDistancia = puestosFiltrados.map(puesto => {
    const promedio = calcularPromedio(puesto)
    if (userLocation && puesto.latitud && puesto.longitud) {
      const distancia = calcularDistancia(
        userLocation[0],
        userLocation[1],
        puesto.latitud,
        puesto.longitud
      )
      return { ...puesto, distancia, promedio }
    }
    return { ...puesto, distancia: null, promedio }
  })

  // Ordenar según criterio
  puestosConDistancia.sort((a, b) => {
    if (ordenarPor === 'nota') {
      return (b.promedio || 0) - (a.promedio || 0)
    } else if (ordenarPor === 'reciente') {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    } else {
      // Por defecto ordenar por distancia
      if (a.distancia === null) return 1
      if (b.distancia === null) return -1
      return a.distancia - b.distancia
    }
  })

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-[14px]" style={{ color: 'var(--gray-500)' }}>Cargando lugares...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center max-w-xs">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--error-light)' }}
          >
            <svg className="w-7 h-7" style={{ color: 'var(--error)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--gray-900)' }}>
            Error al cargar
          </p>
          <p className="text-[13px]" style={{ color: 'var(--gray-500)' }}>
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      {/* Header con contador */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <p className="text-[13px]" style={{ color: 'var(--gray-500)' }}>
            <span className="font-semibold" style={{ color: 'var(--gray-900)' }}>
              {puestosConDistancia.length}
            </span>
            {' '}{puestosConDistancia.length === 1 ? 'lugar' : 'lugares'}
            {filtroTipo !== 'Todos' && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                {filtroTipo}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Lista de puestos */}
      {puestosConDistancia.length > 0 ? (
        <div className="px-4 pb-24 space-y-3">
          {puestosConDistancia.map((puesto, index) => (
            <div
              key={puesto.id}
              onClick={() => onPuestoClick(puesto)}
              className="cursor-pointer animate-fade-in-up"
              style={{
                animationDelay: `${index * 0.03}s`,
                background: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-xs)',
                overflow: 'hidden',
                transition: 'all 150ms ease'
              }}
            >
              <div className="flex gap-3 p-3">
                {/* Imagen */}
                <div className="flex-shrink-0">
                  {puesto.foto_url ? (
                    <img
                      src={puesto.foto_url}
                      alt={puesto.nombre}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: 'var(--gray-100)' }}
                    >
                      {FOOD_EMOJIS[puesto.tipo_comida] || FOOD_EMOJIS.default}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5">
                  <h3
                    className="font-semibold text-[15px] truncate mb-1"
                    style={{ color: 'var(--gray-900)' }}
                  >
                    {puesto.nombre}
                  </h3>

                  {/* Rating */}
                  <div className="mb-1.5">
                    {puesto.promedio > 0 ? (
                      <StarRating rating={puesto.promedio} />
                    ) : (
                      <span className="text-[12px]" style={{ color: 'var(--gray-400)' }}>Sin reseñas</span>
                    )}
                  </div>

                  {/* Tipo y distancia */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="inline-flex items-center gap-1 text-[12px] font-medium"
                      style={{ color: 'var(--gray-600)' }}
                    >
                      {FOOD_EMOJIS[puesto.tipo_comida] || '🍽️'} {puesto.tipo_comida || 'Comida'}
                    </span>
                    {puesto.distancia !== null && (
                      <span
                        className="inline-flex items-center gap-1 text-[12px]"
                        style={{ color: 'var(--gray-400)' }}
                      >
                        <MapPinIcon />
                        {puesto.distancia < 1
                          ? `${(puesto.distancia * 1000).toFixed(0)}m`
                          : `${puesto.distancia.toFixed(1)}km`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Flecha */}
                <div
                  className="flex-shrink-0 flex items-center"
                  style={{ color: 'var(--gray-300)' }}
                >
                  <ChevronIcon />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-20 text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
            style={{ background: 'var(--gray-100)' }}
          >
            🔍
          </div>
          <p className="text-[16px] font-semibold mb-1" style={{ color: 'var(--gray-900)' }}>
            Sin resultados
          </p>
          <p className="text-[13px]" style={{ color: 'var(--gray-500)' }}>
            Prueba con otros filtros o términos
          </p>
        </div>
      )}
    </div>
  )
}
