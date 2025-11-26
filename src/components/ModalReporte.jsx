import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ModalReporte({ puestoId, nombrePuesto, onCerrar }) {
  const [tipoReporte, setTipoReporte] = useState('')
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const tiposReporte = [
    'Ya no existe',
    'Está cerrado permanentemente',
    'Ubicación incorrecta',
    'Otro'
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

      // Cerrar modal después de 2 segundos
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

  if (enviado) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Gracias por tu reporte
          </h3>
          <p className="text-gray-600">
            Revisaremos la información que nos enviaste.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Reportar problema
          </h3>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Estás reportando un problema con: <strong>{nombrePuesto}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Qué problema tiene este puesto? *
            </label>
            <div className="space-y-2">
              {tiposReporte.map((tipo) => (
                <label
                  key={tipo}
                  className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="tipo"
                    value={tipo}
                    checked={tipoReporte === tipo}
                    onChange={(e) => setTipoReporte(e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{tipo}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Comentario opcional */}
          <div>
            <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mb-2">
              Comentario adicional (opcional)
            </label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Agrega cualquier detalle adicional..."
              maxLength={300}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!tipoReporte || loading}
              className="flex-1 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
