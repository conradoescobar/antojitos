import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ModalReporte({ puestoId, nombrePuesto, onCerrar }) {
  const [tipoReporte, setTipoReporte] = useState('')
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const tiposReporte = [
    { id: 'no_existe', label: 'Ya no existe', icon: '🚫' },
    { id: 'cerrado', label: 'Está cerrado permanentemente', icon: '🔒' },
    { id: 'ubicacion', label: 'Ubicación incorrecta', icon: '📍' },
    { id: 'otro', label: 'Otro problema', icon: '⚠️' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!tipoReporte) return

    try {
      setLoading(true)

      const { error } = await supabase
        .from('reportes')
        .insert([
          {
            puesto_id: puestoId,
            tipo: tipoReporte,
            comentario: comentario.trim() || null
          }
        ])

      if (error) throw error

      setEnviado(true)

      setTimeout(() => {
        onCerrar && onCerrar()
      }, 2000)
    } catch (err) {
      console.error('Error enviando reporte:', err)
      alert('Error al enviar el reporte. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Estado de éxito
  if (enviado) {
    return (
      <div className="modal-overlay animate-fade-in">
        <div className="modal-content p-8 max-w-sm text-center animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--neon-green)] to-[var(--neon-cyan)] flex items-center justify-center mx-auto mb-4" style={{ boxShadow: 'var(--glow-cyan)' }}>
            <svg className="w-8 h-8 text-[var(--night-black)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-display text-2xl gradient-text mb-2 tracking-wide">
            ¡GRACIAS!
          </h3>
          <p className="text-[var(--text-muted)]">
            Revisaremos la información que nos enviaste.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      {/* Modal */}
      <div className="modal-content animate-slide-up safe-area-bottom">
        {/* Header */}
        <div className="sticky top-0 glass-dark px-6 py-5 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="font-display text-xl gradient-text tracking-wide">
              REPORTAR PROBLEMA
            </h3>
            <p className="text-sm text-[var(--text-muted)] truncate max-w-[200px]">
              {nombrePuesto}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="w-10 h-10 rounded-xl bg-[var(--night-medium)] flex items-center justify-center hover:bg-[var(--neon-pink)] hover:text-[var(--night-black)] transition-all duration-300 hover:rotate-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tipo de reporte */}
          <div>
            <label className="block text-sm font-display text-[var(--text-dim)] tracking-wider uppercase mb-3">
              ¿Qué problema tiene este lugar?
            </label>
            <div className="space-y-2">
              {tiposReporte.map((tipo) => (
                <label
                  key={tipo.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    tipoReporte === tipo.label
                      ? 'bg-[var(--neon-pink)]/10 border-[var(--neon-pink)]/50 text-[var(--text-bright)]'
                      : 'bg-[var(--night-medium)] border-transparent text-[var(--text-dim)] hover:border-white/10'
                  }`}
                  style={tipoReporte === tipo.label ? { boxShadow: '0 0 20px rgba(255, 46, 99, 0.1)' } : {}}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value={tipo.label}
                    checked={tipoReporte === tipo.label}
                    onChange={(e) => setTipoReporte(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-2xl">{tipo.icon}</span>
                  <span className="text-sm font-semibold flex-1">{tipo.label}</span>
                  {tipoReporte === tipo.label && (
                    <div className="w-6 h-6 rounded-full bg-[var(--neon-pink)] flex items-center justify-center" style={{ boxShadow: 'var(--glow-pink)' }}>
                      <svg className="w-4 h-4 text-[var(--night-black)]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Comentario opcional */}
          <div className="space-y-2">
            <label className="block text-sm font-display text-[var(--text-dim)] tracking-wider uppercase">
              Comentario adicional (opcional)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              className="input-dark resize-none"
              placeholder="Agrega cualquier detalle adicional..."
              maxLength={300}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!tipoReporte || loading}
              className="btn-neon flex-1 flex items-center justify-center gap-2"
              style={{ background: tipoReporte ? 'linear-gradient(135deg, var(--neon-pink) 0%, #ff1744 100%)' : undefined }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--night-black)] border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar reporte'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
