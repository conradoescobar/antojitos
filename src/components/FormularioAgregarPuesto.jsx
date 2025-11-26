import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Input, Button, Select } from './ui'

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

const tipoOptions = Object.entries(tipoIconos).map(([value, icon]) => ({
  value,
  label: value,
  icon
}))

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

    try {
      setLoading(true)
      setError(null)

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
        await supabase
          .from('puestos')
          .update({ foto_url: fotoUrl })
          .eq('id', nuevoPuesto.id)
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
        setError('No se pudo obtener tu ubicación')
      } else {
        setError('Error al agregar. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <Input
        label="Nombre del lugar"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Ej: Tacos Don Pepe"
        required
      />

      {/* Tipo de comida */}
      <Select
        label="Tipo de comida"
        options={tipoOptions}
        value={tipoComida}
        onChange={setTipoComida}
      />

      {/* Descripción */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="w-full px-3 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl resize-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-accent-500 focus:ring-accent-500/20 hover:border-gray-300"
          placeholder="Breve descripción..."
          maxLength={300}
        />
        <p className="text-xs text-gray-400 text-right">{descripcion.length}/300</p>
      </div>

      {/* Horario */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Apertura"
          type="time"
          value={horarioApertura}
          onChange={(e) => setHorarioApertura(e.target.value)}
        />
        <Input
          label="Cierre"
          type="time"
          value={horarioCierre}
          onChange={(e) => setHorarioCierre(e.target.value)}
        />
      </div>

      {/* Foto */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Foto (opcional)
        </label>

        {previsualizacion ? (
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={previsualizacion}
              alt="Preview"
              className="w-full h-36 object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setFoto(null)
                setPrevisualizacion(null)
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-gray-900/60 rounded-lg flex items-center justify-center text-white hover:bg-gray-900/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-accent-400 hover:bg-accent-50/50 transition-all">
            <svg className="w-7 h-7 text-gray-400 mb-1.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-sm text-gray-500">Agregar foto</p>
            <p className="text-xs text-gray-400">Máx 5MB</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Info ubicación */}
      <div className="flex items-center gap-3 p-3 bg-accent-50 border border-accent-100 rounded-xl">
        <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-accent-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <p className="text-sm text-accent-700">
          Se usará tu ubicación actual
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-3 bg-error-50 border border-error-100 rounded-xl">
          <svg className="w-5 h-5 text-error-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-error-600">{error}</p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          loading={loading}
          fullWidth
        >
          Agregar lugar
        </Button>
        {onCancelar && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancelar}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
