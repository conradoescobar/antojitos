import { useState } from 'react'
import { supabase } from '../lib/supabase'

const tipoEmojis = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌶️',
  'Bebidas': '🥤',
  'Postres': '🍮',
  'Otro': '🍽️'
}

export default function FormularioAgregarPuesto({ onPuestoAgregado, onCancelar }) {
  const [nombre, setNombre] = useState('')
  const [tipoComida, setTipoComida] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [horarioApertura, setHorarioApertura] = useState('')
  const [horarioCierre, setHorarioCierre] = useState('')
  const [foto, setFoto] = useState(null)
  const [previsualizacion, setPrevisualizacion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ubicacionPendiente, setUbicacionPendiente] = useState(false)

  const tipos = ['Tacos', 'Tortas', 'Quesadillas', 'Tamales', 'Antojitos', 'Bebidas', 'Postres', 'Otro']

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
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

      const { error: uploadError } = await supabase.storage
        .from('fotos-puestos')
        .upload(fileName, foto)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('fotos-puestos')
        .getPublicUrl(fileName)

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

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Error de configuración: Las variables de entorno de Supabase no están configuradas.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setUbicacionPendiente(true)

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        })
      })

      const { latitude, longitude } = position.coords

      const puestoData = {
        nombre: nombre.trim(),
        tipo_comida: tipoComida || null,
        descripcion: descripcion.trim() || null,
        horario_apertura: horarioApertura || null,
        horario_cierre: horarioCierre || null,
        latitud: latitude,
        longitud: longitude,
        activo: true
      }

      const { data: nuevoPuesto, error: insertError } = await supabase
        .from('puestos')
        .insert([puestoData])
        .select()
        .single()

      if (insertError) throw insertError

      let fotoUrl = null
      if (foto) {
        fotoUrl = await subirFoto(nuevoPuesto.id)
        const { error: updateError } = await supabase
          .from('puestos')
          .update({ foto_url: fotoUrl })
          .eq('id', nuevoPuesto.id)

        if (updateError) throw updateError
      }

      setNombre('')
      setTipoComida('')
      setDescripcion('')
      setHorarioApertura('')
      setHorarioCierre('')
      setFoto(null)
      setPrevisualizacion(null)

      if (onPuestoAgregado) {
        onPuestoAgregado({ ...nuevoPuesto, foto_url: fotoUrl })
      }
    } catch (err) {
      console.error('Error agregando puesto:', err)
      if (err.code === 1) {
        setError('No se pudo obtener tu ubicación. Por favor permite el acceso.')
      } else if (err.message) {
        setError(`Error: ${err.message}`)
      } else {
        setError('Error al agregar el puesto. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
      setUbicacionPendiente(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-bold text-[var(--color-carbon)] mb-2">
          Nombre del puesto <span className="text-[var(--color-salsa)]">*</span>
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input-field"
          placeholder="Ej: Tacos Don Pepe"
          required
        />
      </div>

      {/* Tipo de comida con chips */}
      <div>
        <label className="block text-sm font-bold text-[var(--color-carbon)] mb-3">
          Tipo de comida
        </label>
        <div className="flex flex-wrap gap-2">
          {tipos.map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setTipoComida(tipoComida === tipo ? '' : tipo)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                tipoComida === tipo
                  ? 'bg-gradient-to-r from-[var(--color-salsa)] to-[var(--color-mango)] text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tipoEmojis[tipo]}</span>
              <span>{tipo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-bold text-[var(--color-carbon)] mb-2">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="input-field resize-none"
          placeholder="Cuéntanos sobre este lugar..."
          maxLength={300}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{descripcion.length}/300</p>
      </div>

      {/* Horario */}
      <div>
        <label className="block text-sm font-bold text-[var(--color-carbon)] mb-2">
          Horario
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Apertura</label>
            <input
              type="time"
              value={horarioApertura}
              onChange={(e) => setHorarioApertura(e.target.value)}
              className="input-field py-3"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Cierre</label>
            <input
              type="time"
              value={horarioCierre}
              onChange={(e) => setHorarioCierre(e.target.value)}
              className="input-field py-3"
            />
          </div>
        </div>
      </div>

      {/* Foto */}
      <div>
        <label className="block text-sm font-bold text-[var(--color-carbon)] mb-2">
          Foto
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="hidden"
            id="foto-input"
          />
          <label
            htmlFor="foto-input"
            className="flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[var(--color-mango)] cursor-pointer transition-all duration-300"
          >
            {previsualizacion ? (
              <img
                src={previsualizacion}
                alt="Previsualización"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-mango-light)] to-[var(--color-mango)] flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600">Toca para agregar foto</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG • Máx. 5MB</p>
              </>
            )}
          </label>
          {previsualizacion && (
            <button
              type="button"
              onClick={() => {
                setFoto(null)
                setPrevisualizacion(null)
              }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Info de ubicación */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-sm text-blue-800">
          Se usará tu ubicación actual para marcar el puesto en el mapa
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed ${loading ? '' : ''}`}
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {ubicacionPendiente ? 'Obteniendo ubicación...' : 'Guardando...'}
            </>
          ) : (
            <>
              <span>🌮</span>
              Agregar Puesto
            </>
          )}
        </span>
      </button>
    </form>
  )
}
