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

const tipoOptions = Object.entries(tipoEmojis).map(([value, icon]) => ({
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
      <div className="space-y-2">
        <label className="block text-sm font-display text-[var(--text-dim)] tracking-wider uppercase">
          Nombre del lugar
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Tacos Don Pepe"
          className="input-dark"
          required
        />
      </div>

      {/* Tipo de comida */}
      <div className="space-y-2">
        <label className="block text-sm font-display text-[var(--text-dim)] tracking-wider uppercase">
          Tipo de comida
        </label>
        <div className="flex flex-wrap gap-2">
          {tipoOptions.map((tipo) => (
            <button
              key={tipo.value}
              type="button"
              onClick={() => setTipoComida(tipo.value === tipoComida ? '' : tipo.value)}
              className={`chip-neon ${tipoComida === tipo.value ? 'active' : ''}`}
            >
              <span>{tipo.icon}</span>
              <span>{tipo.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <label className="block text-sm font-display text-[var(--text-dim)] tracking-wider uppercase">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="input-dark resize-none"
          placeholder="Breve descripción..."
          maxLength={300}
        />
        <p className="text-xs text-[var(--text-muted)] text-right">{descripcion.length}/300</p>
      </div>

      {/* Horario */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-sm font-display text-[var(--text-dim)] tracking-wider uppercase">
            Apertura
          </label>
          <input
            type="time"
            value={horarioApertura}
            onChange={(e) => setHorarioApertura(e.target.value)}
            className="input-dark"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-display text-[var(--text-dim)] tracking-wider uppercase">
            Cierre
          </label>
          <input
            type="time"
            value={horarioCierre}
            onChange={(e) => setHorarioCierre(e.target.value)}
            className="input-dark"
          />
        </div>
      </div>

      {/* Foto */}
      <div className="space-y-2">
        <label className="block text-sm font-display text-[var(--text-dim)] tracking-wider uppercase">
          Foto (opcional)
        </label>

        {previsualizacion ? (
          <div className="relative rounded-2xl overflow-hidden border border-[var(--neon-pink)]/30">
            <img
              src={previsualizacion}
              alt="Preview"
              className="w-full h-40 object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setFoto(null)
                setPrevisualizacion(null)
              }}
              className="absolute top-3 right-3 w-10 h-10 rounded-xl bg-[var(--night-black)]/80 flex items-center justify-center text-[var(--neon-pink)] hover:bg-[var(--neon-pink)] hover:text-[var(--night-black)] transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--night-light)] rounded-2xl cursor-pointer hover:border-[var(--neon-cyan)]/50 hover:bg-[var(--neon-cyan)]/5 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[var(--night-medium)] flex items-center justify-center mb-2 group-hover:bg-[var(--neon-cyan)]/20 transition-all">
              <svg className="w-6 h-6 text-[var(--text-muted)] group-hover:text-[var(--neon-cyan)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-muted)] group-hover:text-[var(--neon-cyan)] transition-colors">Agregar foto</p>
            <p className="text-xs text-[var(--text-muted)]">Máx 5MB</p>
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
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)]/20">
        <div className="w-10 h-10 rounded-xl bg-[var(--neon-cyan)]/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-[var(--neon-cyan)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <p className="text-sm text-[var(--neon-cyan)]">
          Se usará tu ubicación actual
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--neon-pink)]/10 border border-[var(--neon-pink)]/20">
          <svg className="w-5 h-5 text-[var(--neon-pink)] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-[var(--neon-pink)]">{error}</p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-neon flex-1 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-[var(--night-black)] border-t-transparent rounded-full animate-spin" />
              Agregando...
            </>
          ) : (
            'Agregar lugar'
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
