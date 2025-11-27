import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import { supabase } from '../lib/supabase'
import 'leaflet/dist/leaflet.css'

// Icono del marcador
const markerIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" width="40" height="48">
  <path d="M20 2C12.27 2 6 8.27 6 16c0 10 14 28 14 28s14-18 14-28c0-7.73-6.27-14-14-14z"
        fill="#D97757" stroke="white" stroke-width="2"/>
  <circle cx="20" cy="16" r="6" fill="white"/>
  <circle cx="20" cy="16" r="3" fill="#D97757"/>
</svg>`

const markerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(markerIconSvg),
  iconSize: [40, 48],
  iconAnchor: [20, 48]
})

// Iconos
const CameraIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const MenuIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
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

// Componente para seleccionar ubicación en el mapa
function LocationPicker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng])
    }
  })

  return position ? <Marker position={position} icon={markerIcon} /> : null
}

// Componente para centrar el mapa
function MapCenterer({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 16)
    }
  }, [center, map])
  return null
}

export default function FormularioAgregarPuesto({ onPuestoAgregado, onCancelar, userLocation }) {
  const [nombre, setNombre] = useState('')
  const [tipoComida, setTipoComida] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [horarioApertura, setHorarioApertura] = useState('')
  const [horarioCierre, setHorarioCierre] = useState('')
  const [foto, setFoto] = useState(null)
  const [previsualizacion, setPrevisualizacion] = useState(null)
  const [fotoCarta, setFotoCarta] = useState(null)
  const [previsualizacionCarta, setPrevisualizacionCarta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null)
  const [mostrarMapa, setMostrarMapa] = useState(false)

  const tipos = ['Tacos', 'Tortas', 'Quesadillas', 'Tamales', 'Antojitos', 'Bebidas', 'Postres', 'Otro']

  // Inicializar ubicación con la del usuario
  useEffect(() => {
    if (userLocation && !ubicacionSeleccionada) {
      setUbicacionSeleccionada(userLocation)
    }
  }, [userLocation])

  const handleFotoChange = (e, tipo) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La foto no debe superar 5MB')
        return
      }
      if (tipo === 'puesto') {
        setFoto(file)
        setPrevisualizacion(URL.createObjectURL(file))
      } else {
        setFotoCarta(file)
        setPrevisualizacionCarta(URL.createObjectURL(file))
      }
    }
  }

  const subirFoto = async (puestoId, file, sufijo = '') => {
    if (!file) return null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${puestoId}${sufijo}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('fotos-puestos')
        .upload(fileName, file)

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

    if (!ubicacionSeleccionada) {
      setError('Selecciona la ubicacion del puesto en el mapa')
      return
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Error de configuracion: Variables de Supabase no configuradas.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const puestoData = {
        nombre: nombre.trim(),
        tipo_comida: tipoComida || null,
        descripcion: descripcion.trim() || null,
        horario_apertura: horarioApertura || null,
        horario_cierre: horarioCierre || null,
        latitud: ubicacionSeleccionada[0],
        longitud: ubicacionSeleccionada[1],
        activo: true
      }

      const { data: nuevoPuesto, error: insertError } = await supabase
        .from('puestos')
        .insert([puestoData])
        .select()
        .single()

      if (insertError) throw insertError

      let fotoUrl = null
      let fotoCartaUrl = null

      if (foto) {
        fotoUrl = await subirFoto(nuevoPuesto.id, foto)
      }
      if (fotoCarta) {
        fotoCartaUrl = await subirFoto(nuevoPuesto.id, fotoCarta, '-carta')
      }

      if (fotoUrl || fotoCartaUrl) {
        const updateData = {}
        if (fotoUrl) updateData.foto_url = fotoUrl
        if (fotoCartaUrl) updateData.foto_carta_url = fotoCartaUrl

        const { error: updateError } = await supabase
          .from('puestos')
          .update(updateData)
          .eq('id', nuevoPuesto.id)

        if (updateError) throw updateError
      }

      // Limpiar formulario
      setNombre('')
      setTipoComida('')
      setDescripcion('')
      setHorarioApertura('')
      setHorarioCierre('')
      setFoto(null)
      setPrevisualizacion(null)
      setFotoCarta(null)
      setPrevisualizacionCarta(null)
      setUbicacionSeleccionada(null)

      if (onPuestoAgregado) {
        onPuestoAgregado({ ...nuevoPuesto, foto_url: fotoUrl, foto_carta_url: fotoCartaUrl })
      }
    } catch (err) {
      console.error('Error agregando puesto:', err)
      if (err.message) {
        let errorMessage = err.message
        if (err.message.includes('permission denied') || err.message.includes('row-level security')) {
          errorMessage = 'Error de permisos. Verifica las politicas RLS en Supabase.'
        }
        setError(`Error: ${errorMessage}`)
      } else {
        setError('Error al agregar el puesto. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label
          htmlFor="nombre"
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Nombre del puesto <span style={{ color: 'var(--primary)' }}>*</span>
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
          className="block text-sm font-medium mb-2"
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

      {/* Descripcion */}
      <div>
        <label
          htmlFor="descripcion"
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Descripcion
        </label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          className="input-field"
          placeholder="Breve descripcion del puesto..."
          maxLength={300}
        />
      </div>

      {/* Horario */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
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

      {/* Fotos */}
      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Fotos
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Foto del puesto */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Foto del puesto</p>
            {previsualizacion ? (
              <div className="relative rounded-xl overflow-hidden aspect-square">
                <img
                  src={previsualizacion}
                  alt="Previsualizacion"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFoto(null)
                    setPrevisualizacion(null)
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255, 255, 255, 0.9)', color: 'var(--text-primary)' }}
                >
                  <CloseIcon />
                </button>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center aspect-square rounded-xl cursor-pointer transition-all hover:border-[var(--primary)]"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '2px dashed var(--border)',
                  color: 'var(--text-muted)'
                }}
              >
                <CameraIcon />
                <span className="text-xs mt-1">Puesto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFotoChange(e, 'puesto')}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Foto de la carta */}
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Carta / Menu</p>
            {previsualizacionCarta ? (
              <div className="relative rounded-xl overflow-hidden aspect-square">
                <img
                  src={previsualizacionCarta}
                  alt="Carta"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFotoCarta(null)
                    setPrevisualizacionCarta(null)
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255, 255, 255, 0.9)', color: 'var(--text-primary)' }}
                >
                  <CloseIcon />
                </button>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center aspect-square rounded-xl cursor-pointer transition-all hover:border-[var(--primary)]"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '2px dashed var(--border)',
                  color: 'var(--text-muted)'
                }}
              >
                <MenuIcon />
                <span className="text-xs mt-1">Carta</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFotoChange(e, 'carta')}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Selector de ubicación */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Ubicacion <span style={{ color: 'var(--primary)' }}>*</span>
        </label>

        {!mostrarMapa ? (
          <button
            type="button"
            onClick={() => setMostrarMapa(true)}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-xl transition-all hover:border-[var(--primary)]"
            style={{
              background: ubicacionSeleccionada ? 'var(--primary-light)' : 'var(--bg-secondary)',
              border: ubicacionSeleccionada ? '2px solid var(--primary)' : '2px dashed var(--border)',
              color: ubicacionSeleccionada ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            <MapPinIcon />
            <span className="text-sm font-medium">
              {ubicacionSeleccionada ? 'Ubicacion seleccionada - Toca para cambiar' : 'Seleccionar en el mapa'}
            </span>
          </button>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="h-64 relative">
              <MapContainer
                center={ubicacionSeleccionada || userLocation || [19.4326, -99.1332]}
                zoom={16}
                className="w-full h-full"
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <LocationPicker
                  position={ubicacionSeleccionada}
                  onPositionChange={setUbicacionSeleccionada}
                />
                <MapCenterer center={ubicacionSeleccionada || userLocation} />
              </MapContainer>
            </div>
            <div className="p-3 flex items-center justify-between" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Toca en el mapa para marcar la ubicacion
              </p>
              <button
                type="button"
                onClick={() => setMostrarMapa(false)}
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                Listo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(217, 119, 87, 0.1)',
            border: '1px solid rgba(217, 119, 87, 0.2)',
            color: 'var(--primary)'
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
          {loading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
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
