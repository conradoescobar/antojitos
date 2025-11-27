import { useState } from 'react'
import { supabase } from '../lib/supabase'

function EstrellaClickeable({ filled, onHover, onClick, index }) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onClick={onClick}
      className="focus:outline-none transition-all duration-200 hover:scale-125 active:scale-95"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <svg
        className="w-10 h-10 transition-all duration-200"
        fill={filled ? '#FFB703' : 'none'}
        stroke={filled ? '#FFB703' : '#D1D5DB'}
        strokeWidth="2"
        viewBox="0 0 24 24"
        style={filled ? { 
          filter: 'drop-shadow(0 4px 8px rgba(255, 183, 3, 0.4))',
          transform: 'rotate(-5deg)'
        } : {}}
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
        .insert([{
          puesto_id: puestoId,
          estrellas,
          comentario: comentario.trim() || null
        }])

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

  // Mensajes según la calificación
  const mensajesCalificacion = {
    1: '😢 Muy malo',
    2: '😕 Malo',
    3: '😐 Regular',
    4: '😊 Bueno',
    5: '🤩 ¡Excelente!'
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-[var(--color-mango)]/5 to-[var(--color-salsa)]/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-salsa)] to-[var(--color-mango)] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="font-display text-lg font-bold text-[var(--color-carbon)]">
            Deja tu reseña
          </h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Selector de estrellas */}
        <div className="text-center">
          <label className="block text-sm font-bold text-[var(--color-carbon)] mb-4">
            ¿Qué te pareció?
          </label>
          
          <div
            className="flex justify-center gap-2 mb-3"
            onMouseLeave={() => setHoverEstrellas(0)}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <EstrellaClickeable
                key={num}
                index={num}
                filled={num <= displayEstrellas}
                onHover={() => setHoverEstrellas(num)}
                onClick={() => setEstrellas(num)}
              />
            ))}
          </div>

          {/* Mensaje de calificación */}
          <div className={`h-8 transition-all duration-300 ${displayEstrellas > 0 ? 'opacity-100' : 'opacity-0'}`}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-[var(--color-mango)]/20 to-[var(--color-salsa)]/20 text-sm font-semibold text-[var(--color-carbon)]">
              {mensajesCalificacion[displayEstrellas]}
            </span>
          </div>
        </div>

        {/* Campo de comentario */}
        <div>
          <label className="block text-sm font-bold text-[var(--color-carbon)] mb-2">
            Comentario <span className="font-normal text-gray-400">(opcional)</span>
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="Cuéntanos tu experiencia..."
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {comentario.length}/500
          </p>
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 animate-scale-in">
            <span className="text-xl">⚠️</span>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {exito && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200 animate-scale-in">
            <span className="text-xl">🎉</span>
            <p className="text-sm text-green-800 font-medium">¡Gracias por tu reseña!</p>
          </div>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading || estrellas === 0}
          className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <span>✨</span>
                Enviar reseña
              </>
            )}
          </span>
        </button>
      </form>
    </div>
  )
}
