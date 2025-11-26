import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Iconos para tipos de comida
const tipoIconos = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌽',
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
      } else if (err.message && err.message.includes('fotos-puestos')) {
        setError('Error subiendo la foto. Verifica la configuración del bucket.')
      } else if (err.message) {
        let errorMessage = err.message
        if (err.message.includes('permission denied') || err.message.includes('row-level security')) {
          errorMessage = 'Error de permisos. Verifica las políticas RLS en Supabase.'
        } else if (err.message.includes('does not exist')) {
          errorMessage = 'Error en la estructura de la base de datos.'
        }
        setError(`Error: ${errorMessage}`)
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
        <label htmlFor="nombre" className="block text-sm font-medium text-crema-100/70 mb-2">
          Nombre del puesto <span className="text-rosa-400">*</span>
        </label>
        <input
          type="text"
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input-dark"
          placeholder="Ej: Tacos Don Pepe"
          required
        />
      </div>

      {/* Tipo de comida con chips */}
      <div>
        <label className="block text-sm font-medium text-crema-100/70 mb-2">
          Tipo de comida
        </label>
        <div className="flex flex-wrap gap-2">
          {tipos.map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setTipoComida(tipo === tipoComida ? '' : tipo)}
              className={`chip flex items-center gap-1.5 ${
                tipoComida === tipo ? 'chip-active' : 'chip-inactive'
              }`}
            >
              <span>{tipoIconos[tipo]}</span>
              <span>{tipo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-crema-100/70 mb-2">
          Descripción
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="input-dark resize-none"
          placeholder="Breve descripción del puesto..."
          maxLength={300}
        />
        <p className="text-xs text-crema-100/40 mt-1 text-right">
          {descripcion.length}/300
        </p>
      </div>

      {/* Horario */}
      <div>
        <label className="block text-sm font-medium text-crema-100/70 mb-2">
          Horario
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="horarioApertura" className="block text-xs text-crema-100/40 mb-1">
              Apertura
            </label>
            <input
              type="time"
              id="horarioApertura"
              value={horarioApertura}
              onChange={(e) => setHorarioApertura(e.target.value)}
              className="input-dark"
            />
          </div>
          <div>
            <label htmlFor="horarioCierre" className="block text-xs text-crema-100/40 mb-1">
              Cierre
            </label>
            <input
              type="time"
              id="horarioCierre"
              value={horarioCierre}
              onChange={(e) => setHorarioCierre(e.target.value)}
              className="input-dark"
            />
          </div>
        </div>
      </div>

      {/* Foto */}
      <div>
        <label className="block text-sm font-medium text-crema-100/70 mb-2">
          Foto (opcional)
        </label>

        {previsualizacion ? (
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={previsualizacion}
              alt="Previsualización"
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noche-900/80 to-transparent" />
            <button
              type="button"
              onClick={() => {
                setFoto(null)
                setPrevisualizacion(null)
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-noche-900/60 backdrop-blur-sm rounded-full flex items-center justify-center text-crema-100 hover:bg-rosa-500/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-noche-600 rounded-xl cursor-pointer hover:border-ambar-500/50 hover:bg-noche-700/30 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 text-crema-100/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-crema-100/40">Toca para agregar foto</p>
              <p className="text-xs text-crema-100/30 mt-1">Máx 5MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Info de ubicación */}
      <div className="flex items-center gap-3 p-3 bg-lima-500/10 border border-lima-500/30 rounded-xl">
        <div className="w-8 h-8 bg-lima-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-lima-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
        </div>
        <p className="text-sm text-lima-400">
          Se usará tu ubicación actual para marcar el puesto
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-3 bg-rosa-500/10 border border-rosa-500/30 rounded-xl">
          <svg className="w-5 h-5 text-rosa-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-rosa-400">{error}</p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-noche-900/30 border-t-noche-900 rounded-full animate-spin" />
              {ubicacionPendiente ? 'Obteniendo ubicación...' : 'Guardando...'}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Puesto
            </>
          )}
        </button>
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="btn-secondary"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
