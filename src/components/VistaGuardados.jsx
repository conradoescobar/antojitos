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

export default function VistaGuardados({ onPuestoClick }) {
  const [guardados, setGuardados] = useState([])
  const [puestosGuardados, setPuestosGuardados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('antojitos_guardados')
    if (saved) {
      setGuardados(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    async function fetchPuestosGuardados() {
      if (guardados.length === 0) {
        setPuestosGuardados([])
        return
      }

      try {
        const { data, error } = await supabase
          .from('puestos')
          .select('*')
          .in('id', guardados)

        if (error) throw error
        setPuestosGuardados(data || [])
      } catch (err) {
        console.error('Error cargando guardados:', err)
      }
    }

    fetchPuestosGuardados()
  }, [guardados])

  const removeFromSaved = (puestoId) => {
    const newGuardados = guardados.filter(id => id !== puestoId)
    setGuardados(newGuardados)
    localStorage.setItem('antojitos_guardados', JSON.stringify(newGuardados))
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--night-black)] bg-grid">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--neon-yellow)]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--neon-yellow)] animate-spin" style={{ boxShadow: 'var(--glow-yellow)' }} />
            <span className="absolute inset-0 flex items-center justify-center text-4xl animate-float-up">📑</span>
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
                <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-3xl gradient-text tracking-wide">GUARDADOS</h1>
              <p className="text-sm text-[var(--text-muted)]">
                {puestosGuardados.length} {puestosGuardados.length === 1 ? 'lugar guardado' : 'lugares guardados'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28 scrollbar-hide">
        {puestosGuardados.length > 0 ? (
          <div className="p-5 space-y-4">
            {puestosGuardados.map((puesto, index) => (
              <div
                key={puesto.id}
                className="food-card cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-4 p-4">
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
                  <div className="flex-1 min-w-0 py-1" onClick={() => onPuestoClick(puesto)}>
                    <h3 className="font-display text-xl text-[var(--text-bright)] mb-1 truncate tracking-wide">
                      {puesto.nombre}
                    </h3>

                    {puesto.tipo_comida && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--neon-orange)]/15 text-[var(--neon-orange)] border border-[var(--neon-orange)]/30 mb-2">
                        <span>{tipoEmojis[puesto.tipo_comida] || '🍽️'}</span>
                        {puesto.tipo_comida}
                      </span>
                    )}

                    {puesto.descripcion && (
                      <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                        {puesto.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onPuestoClick(puesto)}
                      className="w-10 h-10 rounded-xl bg-[var(--night-light)] flex items-center justify-center hover:bg-[var(--neon-cyan)]/20 hover:text-[var(--neon-cyan)] transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromSaved(puesto.id)
                      }}
                      className="w-10 h-10 rounded-xl bg-[var(--neon-pink)]/10 text-[var(--neon-pink)] flex items-center justify-center hover:bg-[var(--neon-pink)]/20 transition-all duration-300 border border-[var(--neon-pink)]/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20 px-8">
            <div className="w-28 h-28 rounded-full bg-[var(--night-medium)] flex items-center justify-center mb-6 animate-float-up">
              <span className="text-6xl">📑</span>
            </div>
            <h3 className="font-display text-2xl text-[var(--text-bright)] mb-2 text-center tracking-wide">
              NADA GUARDADO
            </h3>
            <p className="text-[var(--text-muted)] text-center max-w-xs">
              Guarda tus spots favoritos para acceso rápido
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
