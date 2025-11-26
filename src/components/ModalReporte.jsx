import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from './ui'

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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
        <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={onCerrar} />
        <div className="relative bg-white rounded-t-2xl sm:rounded-2xl p-8 max-w-sm w-full text-center animate-slide-up sm:animate-scale-in shadow-xl">
          <div className="w-14 h-14 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-success-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Gracias por tu reporte
          </h3>
          <p className="text-sm text-gray-500">
            Revisaremos la información que nos enviaste.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-scale-in shadow-xl safe-area-bottom">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex justify-between items-center rounded-t-2xl">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Reportar problema
            </h3>
            <p className="text-sm text-gray-500 truncate max-w-[200px]">
              {nombrePuesto}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Tipo de reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Qué problema tiene este lugar?
            </label>
            <div className="space-y-2">
              {tiposReporte.map((tipo) => (
                <label
                  key={tipo.id}
                  className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-150 border ${
                    tipoReporte === tipo.label
                      ? 'bg-accent-50 border-accent-200 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
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
                  <span className="text-lg">{tipo.icon}</span>
                  <span className="text-sm font-medium flex-1">{tipo.label}</span>
                  {tipoReporte === tipo.label && (
                    <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Comentario opcional */}
          <div className="space-y-1.5">
            <label htmlFor="comentario" className="block text-sm font-medium text-gray-700">
              Comentario adicional (opcional)
            </label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl resize-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-accent-500 focus:ring-accent-500/20 hover:border-gray-300"
              placeholder="Agrega cualquier detalle adicional..."
              maxLength={300}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onCerrar}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={!tipoReporte}
              loading={loading}
              className="flex-1"
            >
              Enviar reporte
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
