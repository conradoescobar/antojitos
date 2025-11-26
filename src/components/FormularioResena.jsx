import { useState } from 'react'
import { supabase } from '../lib/supabase'

function EstrellaClickeable({ filled, onHover, onClick }) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onClick={onClick}
      className="focus:outline-none transition-all duration-200 hover:scale-125 active:scale-110"
    >
      <svg
        className={`w-9 h-9 transition-all duration-200 ${
          filled
            ? 'text-ambar-400 drop-shadow-[0_0_8px_rgba(255,184,0,0.6)]'
            : 'text-noche-500 hover:text-noche-400'
        }`}
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
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

  // Labels para las estrellas
  const starLabels = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

  return (
    <div className="card-dark p-5">
      <h3 className="font-display font-bold text-crema-50 text-lg mb-4">
        Deja tu reseña
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de estrellas */}
        <div>
          <label className="block text-sm font-medium text-crema-100/70 mb-3">
            Calificación
          </label>
          <div className="flex flex-col items-center">
            <div
              className="flex gap-1"
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
            {/* Label de la calificación */}
            <p className={`text-sm font-medium mt-2 h-5 transition-all duration-200 ${
              displayEstrellas > 0 ? 'text-ambar-400' : 'text-crema-100/30'
            }`}>
              {displayEstrellas > 0 ? starLabels[displayEstrellas] : 'Toca para calificar'}
            </p>
          </div>
        </div>

        {/* Campo de comentario */}
        <div>
          <label htmlFor="comentario" className="block text-sm font-medium text-crema-100/70 mb-2">
            Comentario (opcional)
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            className="input-dark resize-none"
            placeholder="Cuéntanos sobre tu experiencia..."
            maxLength={500}
          />
          <p className="text-xs text-crema-100/40 mt-1 text-right">
            {comentario.length}/500
          </p>
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rosa-500/10 border border-rosa-500/30 rounded-xl">
            <svg className="w-5 h-5 text-rosa-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-rosa-400">{error}</p>
          </div>
        )}

        {exito && (
          <div className="flex items-center gap-2 p-3 bg-lima-500/10 border border-lima-500/30 rounded-xl animate-fade-in">
            <svg className="w-5 h-5 text-lima-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-lima-400">¡Reseña enviada con éxito!</p>
          </div>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading || estrellas === 0}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-noche-900/30 border-t-noche-900 rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Enviar reseña
            </>
          )}
        </button>
      </form>
    </div>
  )
}
