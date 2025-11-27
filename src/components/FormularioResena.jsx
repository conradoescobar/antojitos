import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Componente de estrella interactiva
const StarIcon = ({ filled, size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-all duration-200"
    style={{
      color: filled ? '#D97757' : 'var(--text-muted)'
    }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

function EstrellaClickeable({ filled, onHover, onClick }) {
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onClick={onClick}
      className="focus:outline-none transition-transform hover:scale-125 active:scale-95"
    >
      <StarIcon filled={filled} />
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
      setError('Por favor selecciona una calificacion')
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
      console.error('Error enviando resena:', err)
      setError('Error al enviar la resena. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const displayEstrellas = hoverEstrellas || estrellas

  return (
    <div className="card p-6">
      <h3
        className="font-semibold text-lg mb-5"
        style={{ color: 'var(--text-primary)' }}
      >
        Deja tu resena
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Selector de estrellas */}
        <div>
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Calificacion
          </label>
          <div
            className="flex gap-2 p-4 rounded-xl justify-center"
            style={{ background: 'var(--bg-secondary)' }}
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
          <label
            htmlFor="comentario"
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Comentario <span style={{ color: 'var(--text-muted)' }}>(opcional)</span>
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Cuentanos sobre tu experiencia..."
            maxLength={500}
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {comentario.length}/500 caracteres
          </p>
        </div>

        {/* Mensajes de error/exito */}
        {error && (
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(217, 119, 87, 0.1)',
              border: '1px solid rgba(217, 119, 87, 0.2)',
              color: 'var(--primary)'
            }}
          >
            <p className="text-sm">{error}</p>
          </div>
        )}

        {exito && (
          <div
            className="p-4 rounded-xl flex items-center gap-3"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              color: '#16a34a'
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-sm font-medium">Resena enviada con exito</p>
          </div>
        )}

        {/* Boton de envio */}
        <button
          type="submit"
          disabled={loading || estrellas === 0}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
              Enviando...
            </>
          ) : (
            'Enviar resena'
          )}
        </button>
      </form>
    </div>
  )
}
