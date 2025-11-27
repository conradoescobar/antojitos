import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((num) => (
        <svg
          key={num}
          className={`w-4 h-4 star-neon ${num <= Math.round(rating) ? 'filled' : ''}`}
          fill={num <= Math.round(rating) ? 'var(--neon-yellow)' : 'none'}
          stroke={num <= Math.round(rating) ? 'var(--neon-yellow)' : 'var(--text-muted)'}
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function RankingBadge({ position }) {
  const badges = {
    1: { bg: 'from-[var(--neon-yellow)] to-[var(--neon-orange)]', glow: 'var(--glow-yellow)', icon: '👑' },
    2: { bg: 'from-gray-300 to-gray-400', glow: 'none', icon: '🥈' },
    3: { bg: 'from-amber-600 to-amber-700', glow: 'none', icon: '🥉' }
  }

  const badge = badges[position]

  if (badge) {
    return (
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${badge.bg} flex items-center justify-center flex-shrink-0 font-display text-lg text-[var(--night-black)]`}
        style={{ boxShadow: badge.glow }}
      >
        {badge.icon}
      </div>
    )
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-[var(--night-medium)] flex items-center justify-center flex-shrink-0 font-display text-lg text-[var(--text-muted)]">
      {position}
    </div>
  )
}

export default function VistaMejores({ onPuestoClick }) {
  const [puestos, setPuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    async function fetchMejores() {
      try {
        setLoading(true)

        const { data: puestosData, error: puestosError } = await supabase
          .from('puestos')
          .select('*')
          .eq('activo', true)

        if (puestosError) throw puestosError

        const { data: resenasData, error: resenasError } = await supabase
          .from('resenas')
          .select('puesto_id, estrellas')

        if (resenasError) throw resenasError

        const puestosConRating = puestosData.map(puesto => {
          const resenasDelPuesto = resenasData.filter(r => r.puesto_id === puesto.id)
          const totalResenas = resenasDelPuesto.length
          const promedio = totalResenas > 0
            ? resenasDelPuesto.reduce((sum, r) => sum + r.estrellas, 0) / totalResenas
            : 0

          return { ...puesto, promedio, totalResenas }
        })

        const mejores = puestosConRating
          .filter(p => p.totalResenas > 0)
          .sort((a, b) => {
            if (b.promedio !== a.promedio) return b.promedio - a.promedio
            return b.totalResenas - a.totalResenas
          })

        setPuestos(mejores)
      } catch (err) {
        console.error('Error cargando mejores:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMejores()
  }, [])

  const tiposUnicos = ['todos', ...new Set(puestos.map(p => p.tipo_comida).filter(Boolean))]
  const puestosFiltrados = filtro === 'todos' ? puestos : puestos.filter(p => p.tipo_comida === filtro)

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--night-black)] bg-grid">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--neon-yellow)]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--neon-yellow)] animate-spin" style={{ boxShadow: 'var(--glow-yellow)' }} />
            <span className="absolute inset-0 flex items-center justify-center text-4xl animate-float-up">⭐</span>
          </div>
          <p className="text-[var(--text-muted)] font-display text-xl tracking-widest">CARGANDO...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[var(--night-black)] bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-20 glass-dark border-b border-white/5 safe-area-top">
        <div className="px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--neon-yellow)] to-[var(--neon-orange)] flex items-center justify-center" style={{ boxShadow: 'var(--glow-yellow)' }}>
              <svg className="w-6 h-6 text-[var(--night-black)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-3xl gradient-text tracking-wide">TOP LUGARES</h1>
              <p className="text-sm text-[var(--text-muted)]">Los mejor calificados</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="px-5 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-1 px-1">
            {tiposUnicos.map((tipo, index) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`chip-neon whitespace-nowrap animate-scale-in ${filtro === tipo ? 'active' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {tipo === 'todos' ? (
                  <>
                    <span>✨</span>
                    <span>Todos</span>
                  </>
                ) : (
                  <>
                    <span>{tipoEmojis[tipo] || '🍽️'}</span>
                    <span>{tipo}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28 scrollbar-hide">
        {puestosFiltrados.length > 0 ? (
          <div className="p-5 space-y-4">
            {puestosFiltrados.map((puesto, index) => (
              <div
                key={puesto.id}
                onClick={() => onPuestoClick(puesto)}
                className="food-card cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-4 p-4">
                  {/* Ranking */}
                  <RankingBadge position={index + 1} />

                  {/* Image or Emoji */}
                  <div className="flex-shrink-0">
                    {puesto.foto_url ? (
                      <img
                        src={puesto.foto_url}
                        alt={puesto.nombre}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[var(--neon-pink)]/20 to-[var(--neon-orange)]/20 flex items-center justify-center border border-[var(--neon-pink)]/20">
                        <span className="text-4xl">
                          {tipoEmojis[puesto.tipo_comida] || '🍽️'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-1">
                    <h3 className="font-display text-xl text-[var(--text-bright)] mb-2 truncate tracking-wide">
                      {puesto.nombre}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={puesto.promedio} />
                      <span className="text-sm font-display text-[var(--neon-yellow)]" style={{ textShadow: 'var(--glow-yellow)' }}>
                        {puesto.promedio.toFixed(1)}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        ({puesto.totalResenas})
                      </span>
                    </div>

                    {puesto.tipo_comida && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--neon-orange)]/15 text-[var(--neon-orange)] border border-[var(--neon-orange)]/30">
                        <span>{tipoEmojis[puesto.tipo_comida] || '🍽️'}</span>
                        {puesto.tipo_comida}
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-[var(--night-light)] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20 px-8">
            <div className="w-28 h-28 rounded-full bg-[var(--night-medium)] flex items-center justify-center mb-6 animate-float-up">
              <span className="text-6xl">⭐</span>
            </div>
            <h3 className="font-display text-2xl text-[var(--text-bright)] mb-2 text-center tracking-wide">
              SIN RANKINGS
            </h3>
            <p className="text-[var(--text-muted)] text-center max-w-xs">
              Los lugares aparecerán cuando tengan reseñas
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
