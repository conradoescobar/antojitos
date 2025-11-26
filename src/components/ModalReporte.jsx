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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="absolute inset-0 bg-noche-950/80 backdrop-blur-sm" onClick={onCerrar} />
        <div className="relative card-dark p-8 max-w-sm w-full text-center animate-scale-in">
          <div className="w-16 h-16 bg-lima-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-lima-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-display font-bold text-crema-50 mb-2">
            Gracias por tu reporte
          </h3>
          <p className="text-crema-100/60">
            Revisaremos la información que nos enviaste.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-noche-950/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative card-dark p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-xl font-display font-bold text-crema-50">
              Reportar problema
            </h3>
            <p className="text-sm text-crema-100/50 mt-1">
              {nombrePuesto}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-noche-700/50 hover:bg-noche-600/50 transition-colors text-crema-100/60 hover:text-crema-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo de reporte */}
          <div>
            <label className="block text-sm font-medium text-crema-100/70 mb-3">
              ¿Qué problema tiene este puesto? <span className="text-rosa-400">*</span>
            </label>
            <div className="space-y-2">
              {tiposReporte.map((tipo) => (
                <label
                  key={tipo.id}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                    tipoReporte === tipo.label
                      ? 'bg-rosa-500/10 border-rosa-500/50 text-crema-50'
                      : 'bg-noche-700/30 border-noche-600/50 text-crema-100/70 hover:border-noche-500 hover:bg-noche-700/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value={tipo.label}
                    checked={tipoReporte === tipo.label}
                    onChange={(e) => setTipoReporte(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-xl">{tipo.icon}</span>
                  <span className="font-medium">{tipo.label}</span>
                  {tipoReporte === tipo.label && (
                    <svg className="w-5 h-5 text-rosa-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Comentario opcional */}
          <div>
            <label htmlFor="comentario" className="block text-sm font-medium text-crema-100/70 mb-2">
              Comentario adicional (opcional)
            </label>
            <textarea
              id="comentario"
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
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!tipoReporte || loading}
              className="flex-1 relative overflow-hidden px-6 py-3 font-display font-semibold text-crema-50 bg-gradient-to-r from-rosa-500 to-rosa-600 rounded-xl transition-all duration-300 hover:shadow-glow-rosa active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-crema-100/30 border-t-crema-100 rounded-full animate-spin" />
                  Enviando...
                </span>
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
