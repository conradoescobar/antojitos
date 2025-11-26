import { useState } from 'react'
import { supabase } from '../lib/supabase'

function EstrellaClickeable({ filled, onHover, onClick }) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onClick={onClick}
      className="focus:outline-none transition-transform hover:scale-110"
    >
      <svg
        className="w-8 h-8"
        fill={filled ? '#F97316' : 'none'}
        stroke="#F97316"
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

      // Limpiar formulario
      setEstrellas(0)
      setComentario('')
      setExito(true)

      // Notificar al padre que se envió una reseña
      if (onResenaEnviada) {
        onResenaEnviada()
      }

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setExito(false), 3000)
    } catch (err) {
      console.error('Error enviando reseña:', err)
      setError('Error al enviar la reseña. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const displayEstrellas = hoverEstrellas || estrellas

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Deja tu reseña</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selector de estrellas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación
          </label>
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
        </div>

        {/* Campo de comentario */}
        <div>
          <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-2">
            Comentario (opcional)
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            placeholder="Cuéntanos sobre tu experiencia..."
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comentario.length}/500 caracteres
          </p>
        </div>

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {exito && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm">
            ¡Reseña enviada con éxito!
          </div>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading || estrellas === 0}
          className="w-full bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Enviando...' : 'Enviar reseña'}
        </button>
      </form>
    </div>
  )
}
