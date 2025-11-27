import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Categorías de puntuación
const CATEGORIAS = [
  { key: 'sabor', label: 'Sabor', emoji: '😋', desc: 'Qué tan rico está' },
  { key: 'precio', label: 'Precio', emoji: '💰', desc: 'Relación calidad-precio' },
  { key: 'higiene', label: 'Higiene', emoji: '✨', desc: 'Limpieza del puesto' },
  { key: 'cantidad', label: 'Cantidad', emoji: '🍽️', desc: 'Tamaño de las porciones' },
  { key: 'atencion', label: 'Atención', emoji: '🤝', desc: 'Trato del vendedor' }
]

// Icono de estrella
const StarIcon = ({ filled, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: filled ? '#D97757' : 'var(--border)' }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

// Selector de estrellas por categoría
function SelectorEstrellas({ value, onChange, size = 20 }) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div
      className="flex gap-0.5"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          onMouseEnter={() => setHover(num)}
          onClick={() => onChange(num)}
          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
        >
          <StarIcon filled={num <= display} size={size} />
        </button>
      ))}
    </div>
  )
}

// Iconos
const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function FormularioResena({ puestoId, onResenaEnviada }) {
  const [puntuaciones, setPuntuaciones] = useState({
    sabor: 0,
    precio: 0,
    higiene: 0,
    cantidad: 0,
    atencion: 0
  })
  const [comentario, setComentario] = useState('')
  const [fotos, setFotos] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  const handlePuntuacion = (categoria, valor) => {
    setPuntuaciones(prev => ({ ...prev, [categoria]: valor }))
  }

  const handleFotosChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + fotos.length > 4) {
      setError('Máximo 4 fotos por reseña')
      return
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Cada foto debe ser menor a 5MB')
        return false
      }
      return true
    })

    setFotos(prev => [...prev, ...validFiles])

    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target.result])
      }
      reader.readAsDataURL(file)
    })

    setError(null)
  }

  const removeFoto = (index) => {
    setFotos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const subirFoto = async (resenaId, file, index) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${resenaId}-${index}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('fotos-puestos')
      .upload(`resenas/${fileName}`, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('fotos-puestos')
      .getPublicUrl(`resenas/${fileName}`)

    return data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Verificar que al menos una categoría tenga puntuación
    const tieneAlgunaPuntuacion = Object.values(puntuaciones).some(v => v > 0)
    if (!tieneAlgunaPuntuacion) {
      setError('Puntúa al menos una categoría')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Preparar datos (solo incluir categorías puntuadas)
      const resenaData = {
        puesto_id: puestoId,
        comentario: comentario.trim() || null,
        sabor: puntuaciones.sabor || null,
        precio: puntuaciones.precio || null,
        higiene: puntuaciones.higiene || null,
        cantidad: puntuaciones.cantidad || null,
        atencion: puntuaciones.atencion || null
      }

      // Insertar reseña
      const { data: nuevaResena, error: insertError } = await supabase
        .from('resenas')
        .insert([resenaData])
        .select()
        .single()

      if (insertError) throw insertError

      // Subir fotos si hay
      if (fotos.length > 0) {
        const fotosPromises = fotos.map((foto, index) =>
          subirFoto(nuevaResena.id, foto, index)
        )
        const fotosUrls = await Promise.all(fotosPromises)

        // Guardar URLs en la tabla de fotos
        const fotosData = fotosUrls.map(url => ({
          resena_id: nuevaResena.id,
          foto_url: url
        }))

        const { error: fotosError } = await supabase
          .from('resenas_fotos')
          .insert(fotosData)

        if (fotosError) console.error('Error guardando fotos:', fotosError)
      }

      // Limpiar formulario
      setPuntuaciones({ sabor: 0, precio: 0, higiene: 0, cantidad: 0, atencion: 0 })
      setComentario('')
      setFotos([])
      setPreviews([])
      setExito(true)

      if (onResenaEnviada) {
        onResenaEnviada()
      }

      setTimeout(() => setExito(false), 3000)
    } catch (err) {
      console.error('Error enviando resena:', err)
      if (err.message?.includes('permission denied') || err.message?.includes('row-level security')) {
        setError('Error de permisos. Verifica las políticas RLS en Supabase.')
      } else if (err.code === '42P01') {
        setError('Tabla no encontrada. Ejecuta el SQL de configuración.')
      } else {
        setError(`Error: ${err.message || 'Intenta de nuevo.'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Calcular promedio actual
  const puntuacionesActivas = Object.values(puntuaciones).filter(v => v > 0)
  const promedio = puntuacionesActivas.length > 0
    ? (puntuacionesActivas.reduce((a, b) => a + b, 0) / puntuacionesActivas.length).toFixed(1)
    : null

  return (
    <div className="card overflow-hidden">
      <div
        className="px-6 py-4"
        style={{ borderBottom: '1px solid var(--border-light)' }}
      >
        <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
          Deja tu reseña
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Ayuda a otros a descubrir este puesto
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Categorías de puntuación */}
        <div className="space-y-4">
          <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Puntuación por categoría
          </label>

          <div className="space-y-3">
            {CATEGORIAS.map((cat) => (
              <div
                key={cat.key}
                className="flex items-center justify-between p-3 rounded-xl transition-colors"
                style={{
                  background: puntuaciones[cat.key] > 0 ? 'var(--primary-light)' : 'var(--bg-secondary)'
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.emoji}</span>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {cat.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {cat.desc}
                    </p>
                  </div>
                </div>
                <SelectorEstrellas
                  value={puntuaciones[cat.key]}
                  onChange={(val) => handlePuntuacion(cat.key, val)}
                  size={18}
                />
              </div>
            ))}
          </div>

          {/* Promedio */}
          {promedio && (
            <div
              className="flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{ background: 'var(--primary-light)' }}
            >
              <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                {promedio}
              </span>
              <span className="text-sm" style={{ color: 'var(--primary)' }}>
                promedio
              </span>
            </div>
          )}
        </div>

        {/* Fotos */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Fotos <span style={{ color: 'var(--text-muted)' }}>(opcional, máx. 4)</span>
          </label>

          <div className="flex flex-wrap gap-3">
            {/* Previews de fotos */}
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative w-20 h-20 rounded-xl overflow-hidden"
              >
                <img
                  src={preview}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
                >
                  <CloseIcon />
                </button>
              </div>
            ))}

            {/* Botón agregar foto */}
            {fotos.length < 4 && (
              <label
                className="w-20 h-20 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-[var(--primary)]"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '2px dashed var(--border)',
                  color: 'var(--text-muted)'
                }}
              >
                <CameraIcon />
                <span className="text-xs mt-1">Añadir</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFotosChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Comentario */}
        <div>
          <label
            htmlFor="comentario"
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Comentario <span style={{ color: 'var(--text-muted)' }}>(opcional)</span>
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Cuéntanos tu experiencia..."
            maxLength={500}
          />
          <p className="text-xs mt-1.5 text-right" style={{ color: 'var(--text-muted)' }}>
            {comentario.length}/500
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div
            className="p-4 rounded-xl"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#dc2626'
            }}
          >
            <p className="text-sm">{error}</p>
          </div>
        )}

        {exito && (
          <div
            className="p-4 rounded-xl flex items-center gap-3"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              color: '#16a34a'
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-sm font-medium">¡Reseña enviada!</p>
          </div>
        )}

        {/* Botón enviar */}
        <button
          type="submit"
          disabled={loading || !Object.values(puntuaciones).some(v => v > 0)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
              Enviando...
            </>
          ) : (
            'Publicar reseña'
          )}
        </button>
      </form>
    </div>
  )
}
