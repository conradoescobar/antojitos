import { useState } from 'react'
import { supabase } from '../lib/supabase'

function EstrellaClickeable({ filled, onHover, onClick }) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onClick={onClick}
      className="focus:outline-none transition-all duration-300 hover:scale-125 active:scale-95"
    >
      <svg
        className={`w-10 h-10 transition-all duration-300 star-neon ${filled ? 'filled' : ''}`}
        fill={filled ? 'var(--neon-yellow)' : 'none'}
        stroke={filled ? 'var(--neon-yellow)' : 'var(--text-muted)'}
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </button>
  )
}

export default function FormularioResena({ puestoId, onResenaEnviada }) {
  const [estrellas, setEstrellas] = useState(0)
  const [hoverEstrellas, setHoverEstrellas] = useState(0)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (estrellas === 0) {
      setError('Por favor selecciona una calificación')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { error: insertError } = await supabase
        .from('resenas')
        .insert([
          {
            puesto_id: puestoId,
            estrellas,
            comentario: comentario.trim() || null
          }
        ])

      if (insertError) throw insertError

      setEstrellas(0)
      setComentario('')
      setExito(true)

      if (onResenaEnviada) {
        onResenaEnviada()
      }

      setTimeout(() => setExito(false), 3000)
    } catch (err) {
      console.error('Error enviando reseña:', err)
      setError('Error al enviar la reseña. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const displayEstrellas = hoverEstrellas || estrellas
  const starLabels = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

  return (
    <div className="neon-card rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-orange)] flex items-center justify-center" style={{ boxShadow: 'var(--glow-pink)' }}>
          <svg className="w-5 h-5 text-[var(--night-black)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <h3 className="font-display text-xl text-[var(--text-bright)] tracking-wide">
          DEJA TU RESEÑA
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Selector de estrellas */}
        <div>
          <label className="block text-sm font-display text-[var(--text-dim)] tracking-wider uppercase mb-4">
            Calificación
          </label>
          <div className="flex flex-col items-center">
            <div
              className="flex gap-2"
              onMouseLeave={() => setHoverEstrellas(0)}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <EstrellaClickeable
                  key={num}
                  filled={num <= displayEstrellas}
                  onHover={() => setHoverEstrellas(num)}
                  onClick={() => setEstrellas(num)}
                />
              ))}
            </div>
            <p className={`text-base font-display mt-3 h-6 tracking-wider transition-all duration-300 ${
              displayEstrellas > 0 ? 'text-[var(--neon-yellow)]' : 'text-[var(--text-muted)]'
            }`} style={displayEstrellas > 0 ? { textShadow: 'var(--glow-yellow)' } : {}}>
              {displayEstrellas > 0 ? starLabels[displayEstrellas].toUpperCase() : 'TOCA PARA CALIFICAR'}
            </p>
          </div>
        </div>

        {/* Campo de comentario */}
        <div className="space-y-2">
          <label className="block text-sm font-display text-[var(--text-dim)] tracking-wider uppercase">
            Comentario (opcional)
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            className="input-dark resize-none"
            placeholder="Cuéntanos sobre tu experiencia..."
            maxLength={500}
          />
          <p className="text-xs text-[var(--text-muted)] text-right">
            {comentario.length}/500
          </p>
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--neon-pink)]/10 border border-[var(--neon-pink)]/20 animate-fade-in">
            <svg className="w-5 h-5 text-[var(--neon-pink)] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-[var(--neon-pink)]">{error}</p>
          </div>
        )}

        {exito && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--neon-green)]/10 border border-[var(--neon-green)]/20 animate-fade-in">
            <svg className="w-5 h-5 text-[var(--neon-green)] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-[var(--neon-green)]">¡Reseña enviada con éxito!</p>
          </div>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading || estrellas === 0}
          className="btn-neon w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-[var(--night-black)] border-t-transparent rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Enviar reseña
            </>
          )}
        </button>
      </form>
    </div>
  )
}
