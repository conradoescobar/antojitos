import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Iconos
const CloseIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

export default function ModalReporte({ puestoId, nombrePuesto, onCerrar }) {
  const [tipoReporte, setTipoReporte] = useState('')
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const tiposReporte = [
    { value: 'Ya no existe', icon: '🚫' },
    { value: 'Esta cerrado permanentemente', icon: '🔒' },
    { value: 'Ubicacion incorrecta', icon: '📍' },
    { value: 'Otro', icon: '💬' }
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

  // Vista de exito
  if (enviado) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
        style={{ background: 'rgba(26, 25, 21, 0.5)' }}
      >
        <div
          className="max-w-sm w-full p-8 text-center animate-scale-in rounded-2xl"
          style={{ background: 'var(--bg-card)' }}
        >
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#16a34a'
            }}
          >
            <CheckIcon />
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Gracias
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Revisaremos tu reporte pronto
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
      style={{ background: 'rgba(26, 25, 21, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <div
        className="max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in rounded-2xl"
        style={{ background: 'var(--bg-card)' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-5 flex items-start justify-between"
          style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-light)'
          }}
        >
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Reportar problema
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {nombrePuesto}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tipo de reporte */}
          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Que problema tiene este puesto?
            </label>
            <div className="space-y-2">
              {tiposReporte.map((tipo) => (
                <label
                  key={tipo.value}
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: tipoReporte === tipo.value ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    border: tipoReporte === tipo.value ? '2px solid var(--primary)' : '2px solid transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value={tipo.value}
                    checked={tipoReporte === tipo.value}
                    onChange={(e) => setTipoReporte(e.target.value)}
                    className="hidden"
                  />
                  <span className="text-xl">{tipo.icon}</span>
                  <span
                    className="font-medium"
                    style={{
                      color: tipoReporte === tipo.value ? 'var(--primary)' : 'var(--text-primary)'
                    }}
                  >
                    {tipo.value}
                  </span>
                  {tipoReporte === tipo.value && (
                    <div className="ml-auto">
                      <svg
                        className="w-5 h-5"
                        style={{ color: 'var(--primary)' }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Comentario opcional */}
          <div>
            <label
              htmlFor="comentario"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Detalles adicionales <span style={{ color: 'var(--text-muted)' }}>(opcional)</span>
            </label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              className="input-field"
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
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
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
