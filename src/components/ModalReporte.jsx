import { useState } from 'react'
import { supabase } from '../lib/supabase'

const tiposReporte = [
  { id: 'cerrado', label: 'Ya no existe o está cerrado', icon: '🚫' },
  { id: 'ubicacion', label: 'Ubicación incorrecta', icon: '📍' },
  { id: 'info', label: 'Información incorrecta', icon: '📝' },
  { id: 'otro', label: 'Otro problema', icon: '❓' }
]

export default function ModalReporte({ puestoId, nombrePuesto, onCerrar }) {
  const [tipoReporte, setTipoReporte] = useState('')
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tipoReporte) return

    try {
      setLoading(true)

      const { error } = await supabase
        .from('reportes')
        .insert([{
          puesto_id: puestoId,
          tipo: tipoReporte,
          comentario: comentario.trim() || null
        }])

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
      <div className="modal-overlay animate-fade-in" onClick={onCerrar}>
        <div className="modal-content max-w-sm mx-4 p-8 text-center rounded-3xl animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--color-carbon)] mb-2">
            ¡Gracias!
          </h3>
          <p className="text-gray-600">
            Tu reporte nos ayuda a mantener la información actualizada.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay animate-fade-in" onClick={onCerrar}>
      <div 
        className="modal-content mx-4 sm:mx-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 glass-card border-b border-white/20 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--color-carbon)]">
              Reportar problema
            </h2>
            <p className="text-sm text-gray-500 mt-1 truncate max-w-[200px]">
              {nombrePuesto}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:rotate-90"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tipo de reporte */}
          <div>
            <label className="block text-sm font-bold text-[var(--color-carbon)] mb-3">
              ¿Qué problema tiene este puesto?
            </label>
            <div className="space-y-2">
              {tiposReporte.map((tipo, index) => (
                <button
                  key={tipo.id}
                  type="button"
                  onClick={() => setTipoReporte(tipo.label)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 animate-fade-in ${
                    tipoReporte === tipo.label
                      ? 'bg-gradient-to-r from-[var(--color-salsa)]/10 to-[var(--color-mango)]/10 border-2 border-[var(--color-salsa)] shadow-lg'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="text-2xl">{tipo.icon}</span>
                  <span className={`font-medium ${tipoReporte === tipo.label ? 'text-[var(--color-salsa)]' : 'text-gray-700'}`}>
                    {tipo.label}
                  </span>
                  {tipoReporte === tipo.label && (
                    <svg className="w-5 h-5 text-[var(--color-salsa)] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-bold text-[var(--color-carbon)] mb-2">
              Detalles adicionales <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Cuéntanos más sobre el problema..."
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
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar reporte'
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
