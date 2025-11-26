import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Mapa from '../components/Mapa'
import FormularioAgregarPuesto from '../components/FormularioAgregarPuesto'
import BottomNav from '../components/BottomNav'
import VistaGuardados from '../components/VistaGuardados'
import VistaMejores from '../components/VistaMejores'
import { supabase } from '../lib/supabase'

export default function Home() {
  const navigate = useNavigate()
  const [userLocation, setUserLocation] = useState(null)
  const [puestos, setPuestos] = useState([])
  const [mapCenter, setMapCenter] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [activeTab, setActiveTab] = useState('mapa')

  // Cargar puestos desde Supabase
  useEffect(() => {
    async function fetchPuestos() {
      try {
        const { data, error } = await supabase
          .from('puestos')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setPuestos(data || [])
      } catch (err) {
        console.error('Error cargando puestos:', err)
      }
    }

    fetchPuestos()
  }, [])

  // Centrar mapa en ubicación del usuario cuando se obtiene
  useEffect(() => {
    if (userLocation && !mapCenter) {
      setMapCenter(userLocation)
    }
  }, [userLocation, mapCenter])

  const handlePuestoClick = (puesto) => {
    navigate(`/puesto/${puesto.id}`)
  }

  const handlePuestoAgregado = (nuevoPuesto) => {
    setPuestos([nuevoPuesto, ...puestos])
    setMostrarFormulario(false)
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-noche-950 relative overflow-hidden">
      {/* Efectos de luz ambiental */}
      <div className="ambient-glow w-96 h-96 bg-ambar-500 -top-48 -left-48 rounded-full" />
      <div className="ambient-glow w-64 h-64 bg-rosa-500 -bottom-32 -right-32 rounded-full" />

      {/* Header - solo visible en mapa */}
      {activeTab === 'mapa' && (
        <header className="relative z-20 glass-dark border-b border-noche-700/50 safe-area-top">
          <div className="px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-ambar-400 to-ambar-600 rounded-xl flex items-center justify-center shadow-glow-ambar">
                <span className="text-xl">🌮</span>
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-crema-50">
                  Antojitos
                </h1>
                <p className="text-xs text-crema-100/50">
                  {puestos.length} puestos cerca de ti
                </p>
              </div>
            </div>

            {/* Indicador de ubicación */}
            {userLocation ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-lima-500/10 border border-lima-500/30 rounded-full">
                <div className="w-2 h-2 bg-lima-400 rounded-full animate-pulse" />
                <span className="text-xs text-lima-400 font-medium">GPS</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-noche-700/50 border border-noche-600/50 rounded-full">
                <div className="w-2 h-2 bg-crema-100/30 rounded-full" />
                <span className="text-xs text-crema-100/50 font-medium">Buscando...</span>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Contenido Principal */}
      <div className="flex-1 overflow-hidden relative">
        {/* Vista de Mapa */}
        <div className={`absolute inset-0 transition-all duration-400 ${
          activeTab === 'mapa'
            ? 'opacity-100 z-10 translate-x-0'
            : activeTab === 'guardados'
            ? 'opacity-0 z-0 pointer-events-none -translate-x-8'
            : 'opacity-0 z-0 pointer-events-none -translate-x-8'
        }`}>
          <Mapa
            userLocation={userLocation}
            onUserLocationChange={setUserLocation}
            puestos={puestos}
            mapCenter={mapCenter}
            onPuestoClick={handlePuestoClick}
          />
        </div>

        {/* Vista de Guardados */}
        <div className={`absolute inset-0 transition-all duration-400 ${
          activeTab === 'guardados'
            ? 'opacity-100 z-10 translate-x-0'
            : activeTab === 'mapa'
            ? 'opacity-0 z-0 pointer-events-none translate-x-8'
            : 'opacity-0 z-0 pointer-events-none -translate-x-8'
        }`}>
          <VistaGuardados onPuestoClick={handlePuestoClick} />
        </div>

        {/* Vista de Mejores */}
        <div className={`absolute inset-0 transition-all duration-400 ${
          activeTab === 'mejores'
            ? 'opacity-100 z-10 translate-x-0'
            : 'opacity-0 z-0 pointer-events-none translate-x-8'
        }`}>
          <VistaMejores onPuestoClick={handlePuestoClick} />
        </div>
      </div>

      {/* FAB - Botón flotante (solo visible en la pestaña del mapa) */}
      {activeTab === 'mapa' && (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="fixed bottom-24 right-5 group z-30"
          aria-label="Agregar puesto"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-ambar-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />

          {/* Button */}
          <div className="relative w-14 h-14 bg-gradient-to-br from-ambar-400 to-ambar-600 rounded-full shadow-glow-ambar flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95">
            <svg className="w-6 h-6 text-noche-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </button>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setMostrarFormulario(false)}
        >
          {/* Overlay con blur */}
          <div className="absolute inset-0 bg-noche-950/80 backdrop-blur-sm" />

          {/* Modal content */}
          <div className="relative w-full max-w-lg bg-noche-800 border border-noche-600/50 rounded-t-3xl shadow-3xl max-h-[85vh] overflow-hidden animate-slide-up safe-area-bottom">
            {/* Header del modal */}
            <div className="sticky top-0 glass-dark border-b border-noche-600/50 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-crema-50">Agregar Puesto</h2>
                <p className="text-sm text-crema-100/50">Comparte un nuevo antojito</p>
              </div>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-noche-600/50 transition-colors text-crema-100/60 hover:text-crema-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              <FormularioAgregarPuesto
                onPuestoAgregado={handlePuestoAgregado}
                onCancelar={() => setMostrarFormulario(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Noise overlay sutil */}
      <div className="noise-overlay" />
    </div>
  )
}
