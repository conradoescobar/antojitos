import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function FormularioAgregarPuesto({ onPuestoAgregado, onCancelar }) {
  const [nombre, setNombre] = useState('')
  const [tipoComida, setTipoComida] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [horario, setHorario] = useState('')
  const [foto, setFoto] = useState(null)
  const [previsualizacion, setPrevisualizacion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ubicacionPendiente, setUbicacionPendiente] = useState(false)

  const tipos = ['Tacos', 'Tortas', 'Quesadillas', 'Tamales', 'Antojitos', 'Bebidas', 'Postres', 'Otro']

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB máximo
        setError('La foto no debe superar 5MB')
        return
      }
      setFoto(file)
      setPrevisualizacion(URL.createObjectURL(file))
    }
  }

  const subirFoto = async (puestoId) => {
    if (!foto) return null

    try {
      const fileExt = foto.name.split('.').pop()
      const fileName = `${puestoId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('fotos-puestos')
        .upload(filePath, foto)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('fotos-puestos')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (err) {
      console.error('Error subiendo foto:', err)
      throw err
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    // Verificar variables de entorno
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Error de configuración: Las variables de entorno de Supabase no están configuradas. Verifica la configuración en Vercel.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setUbicacionPendiente(true)

      // Obtener ubicación actual
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        })
      })

      const { latitude, longitude } = position.coords

      // Insertar puesto
      const { data: nuevoPuesto, error: insertError } = await supabase
        .from('puestos')
        .insert([
          {
            nombre: nombre.trim(),
            tipo_comida: tipoComida || null,
            descripcion: descripcion.trim() || null,
            horario: horario.trim() || null,
            latitud: latitude,
            longitud: longitude,
            activo: true
          }
        ])
        .select()
        .single()

      if (insertError) throw insertError

      // Subir foto si existe
      let fotoUrl = null
      if (foto) {
        fotoUrl = await subirFoto(nuevoPuesto.id)

        // Actualizar puesto con URL de foto
        const { error: updateError } = await supabase
          .from('puestos')
          .update({ foto_url: fotoUrl })
          .eq('id', nuevoPuesto.id)

        if (updateError) throw updateError
      }

      // Limpiar formulario
      setNombre('')
      setTipoComida('')
      setDescripcion('')
      setHorario('')
      setFoto(null)
      setPrevisualizacion(null)

      if (onPuestoAgregado) {
        onPuestoAgregado({ ...nuevoPuesto, foto_url: fotoUrl })
      }
    } catch (err) {
      console.error('Error agregando puesto:', err)
      if (err.code === 1) {
        setError('No se pudo obtener tu ubicación. Por favor permite el acceso a tu ubicación.')
      } else if (err.message && err.message.includes('fotos-puestos')) {
        setError('Error subiendo la foto. Asegúrate de que el bucket "fotos-puestos" esté configurado en Supabase.')
      } else if (err.message) {
        // Mostrar el mensaje de error específico de Supabase
        let errorMessage = err.message
        if (err.message.includes('permission denied') || err.message.includes('new row violates row-level security')) {
          errorMessage = 'Error de permisos. Verifica las políticas RLS en Supabase para la tabla "puestos".'
        } else if (err.message.includes('relation') && err.message.includes('does not exist')) {
          errorMessage = 'La tabla "puestos" no existe en Supabase. Verifica la estructura de la base de datos.'
        } else if (err.message.includes('column') && err.message.includes('does not exist')) {
          errorMessage = 'Error en la estructura de la tabla. Verifica que todas las columnas existan en Supabase.'
        }
        setError(`Error: ${errorMessage}`)
      } else {
        setError('Error al agregar el puesto. Intenta de nuevo. Revisa la consola para más detalles.')
      }
    } finally {
      setLoading(false)
      setUbicacionPendiente(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Agregar Puesto</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del puesto *
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Ej: Tacos Don Pepe"
            required
          />
        </div>

        {/* Tipo de comida */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de comida
          </label>
          <select
            id="tipo"
            value={tipoComida}
            onChange={(e) => setTipoComida(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Selecciona un tipo</option>
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            placeholder="Breve descripción del puesto..."
            maxLength={300}
          />
        </div>

        {/* Horario */}
        <div>
          <label htmlFor="horario" className="block text-sm font-medium text-gray-700 mb-1">
            Horario
          </label>
          <input
            type="text"
            id="horario"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Ej: Lun-Vie 8am-6pm"
          />
        </div>

        {/* Foto */}
        <div>
          <label htmlFor="foto" className="block text-sm font-medium text-gray-700 mb-1">
            Foto (opcional)
          </label>
          <input
            type="file"
            id="foto"
            accept="image/*"
            onChange={handleFotoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Máximo 5MB - JPG, PNG o WebP</p>

          {previsualizacion && (
            <div className="mt-2">
              <img
                src={previsualizacion}
                alt="Previsualización"
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Info de ubicación */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            📍 Se usará tu ubicación actual para marcar el puesto en el mapa.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {ubicacionPendiente ? 'Obteniendo ubicación...' : loading ? 'Guardando...' : 'Agregar Puesto'}
          </button>
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
