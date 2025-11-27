import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Iconos
const CameraIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

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
      setError('Error de configuración: Variables de Supabase no configuradas.')
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
        setError('Error subiendo la foto. Verifica el bucket en Supabase.')
      } else if (err.message) {
        let errorMessage = err.message
        if (err.message.includes('permission denied') || err.message.includes('row-level security')) {
          errorMessage = 'Error de permisos. Verifica las políticas RLS en Supabase.'
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
        <label
          htmlFor="nombre"
          className="block text-sm font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Nombre del puesto <span style={{ color: 'var(--accent-coral)' }}>*</span>
        </label>
        <input
          type="text"
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input-field"
          placeholder="Ej: Tacos Don Pepe"
          required
        />
      </div>

      {/* Tipo de comida */}
      <div>
        <label
          htmlFor="tipo"
          className="block text-sm font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Tipo de comida
        </label>
        <select
          id="tipo"
          value={tipoComida}
          onChange={(e) => setTipoComida(e.target.value)}
          className="input-field"
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
        <label
          htmlFor="descripcion"
          className="block text-sm font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Descripción
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="input-field"
          placeholder="Breve descripción del puesto..."
          maxLength={300}
        />
        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
          {descripcion.length}/300 caracteres
        </p>
      </div>

      {/* Horario */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Horario
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="horarioApertura" className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Apertura
            </label>
            <input
              type="time"
              id="horarioApertura"
              value={horarioApertura}
              onChange={(e) => setHorarioApertura(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="horarioCierre" className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Cierre
            </label>
            <input
              type="time"
              id="horarioCierre"
              value={horarioCierre}
              onChange={(e) => setHorarioCierre(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Foto */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Foto (opcional)
        </label>
        {previsualizacion ? (
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src={previsualizacion}
              alt="Previsualización"
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setFoto(null)
                setPrevisualizacion(null)
              }}
              className="absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{
                background: 'rgba(13, 11, 14, 0.8)',
                color: 'var(--text-primary)'
              }}
            >
              <CloseIcon />
            </button>
          </div>
        ) : (
          <label
            className="flex flex-col items-center justify-center w-full h-40 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
            style={{
              background: 'var(--bg-elevated)',
              border: '2px dashed var(--border-subtle)',
              color: 'var(--text-muted)'
            }}
          >
            <CameraIcon />
            <span className="text-sm mt-2">Toca para agregar foto</span>
            <span className="text-xs mt-1">Máx. 5MB</span>
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
      <div
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{
          background: 'rgba(34, 211, 238, 0.1)',
          border: '1px solid rgba(34, 211, 238, 0.2)'
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(34, 211, 238, 0.15)', color: 'var(--accent-cyan)' }}
        >
          <MapPinIcon />
        </div>
        <p className="text-sm" style={{ color: 'var(--accent-cyan)' }}>
          Se usará tu ubicación actual para marcar el puesto
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 rounded-2xl"
          style={{
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.2)',
            color: 'var(--accent-coral)'
          }}
        >
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {ubicacionPendiente ? (
            <>
              <div
                className="w-5 h-5 rounded-full animate-spin"
                style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }}
              />
              Obteniendo ubicación...
            </>
          ) : loading ? (
            <>
              <div
                className="w-5 h-5 rounded-full animate-spin"
                style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }}
              />
              Guardando...
            </>
          ) : (
            'Agregar Puesto'
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
