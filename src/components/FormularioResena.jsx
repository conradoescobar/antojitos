import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Button } from './ui'

function EstrellaClickeable({ filled, onHover, onClick }) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onClick={onClick}
      className="focus:outline-none transition-all duration-200 hover:scale-110 active:scale-95"
    >
      <svg
        className={`w-8 h-8 transition-all duration-200 ${
          filled
            ? 'star-filled'
            : 'text-gray-300 hover:text-gray-400'
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
  const starLabels = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-4">
        Deja tu reseña
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de estrellas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
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
            <p className={`text-sm font-medium mt-2 h-5 transition-all duration-200 ${
              displayEstrellas > 0 ? 'text-warm-600' : 'text-gray-400'
            }`}>
              {displayEstrellas > 0 ? starLabels[displayEstrellas] : 'Toca para calificar'}
            </p>
          </div>
        </div>

        {/* Campo de comentario */}
        <div className="space-y-1.5">
          <label htmlFor="comentario" className="block text-sm font-medium text-gray-700">
            Comentario (opcional)
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl resize-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-accent-500 focus:ring-accent-500/20 hover:border-gray-300"
            placeholder="Cuéntanos sobre tu experiencia..."
            maxLength={500}
          />
          <p className="text-xs text-gray-400 text-right">
            {comentario.length}/500
          </p>
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="flex items-center gap-3 p-3 bg-error-50 border border-error-100 rounded-xl">
            <svg className="w-5 h-5 text-error-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-error-600">{error}</p>
          </div>
        )}

        {exito && (
          <div className="flex items-center gap-3 p-3 bg-success-50 border border-success-100 rounded-xl animate-fade-in">
            <svg className="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-success-600">¡Reseña enviada con éxito!</p>
          </div>
        )}

        {/* Botón de envío */}
        <Button
          type="submit"
          loading={loading}
          disabled={estrellas === 0}
          fullWidth
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          Enviar reseña
        </Button>
      </form>
    </Card>
  )
}
