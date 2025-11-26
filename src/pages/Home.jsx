import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Mapa from '../components/Mapa'
import FormularioAgregarPuesto from '../components/FormularioAgregarPuesto'
import BottomNav from '../components/BottomNav'
import VistaGuardados from '../components/VistaGuardados'
import VistaMejores from '../components/VistaMejores'
import { Modal } from '../components/ui'
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

  // Centrar mapa en ubicación del usuario
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
    <div className="h-[100dvh] flex flex-col bg-gray-50 relative overflow-hidden">
      {/* Header - solo visible en mapa */}
      {activeTab === 'mapa' && (
        <header className="relative z-20 glass safe-area-top">
          <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-warm-500 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-lg">🌮</span>
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">
                  Antojitos
                </h1>
                <p className="text-xs text-gray-500">
                  {puestos.length} lugares cerca
                </p>
              </div>
            </div>

            {/* Status de ubicación */}
            {userLocation ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success-50 rounded-full">
                <div className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-success-600">GPS</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                <span className="text-xs font-medium text-gray-500">Ubicando...</span>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Contenido Principal */}
      <div className="flex-1 overflow-hidden relative">
        {/* Vista de Mapa */}
        <div className={`absolute inset-0 transition-all duration-300 ease-smooth ${
          activeTab === 'mapa'
            ? 'opacity-100 z-10'
            : 'opacity-0 z-0 pointer-events-none'
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
        <div className={`absolute inset-0 transition-all duration-300 ease-smooth ${
          activeTab === 'guardados'
            ? 'opacity-100 z-10'
            : 'opacity-0 z-0 pointer-events-none'
        }`}>
          <VistaGuardados onPuestoClick={handlePuestoClick} />
        </div>

        {/* Vista de Mejores */}
        <div className={`absolute inset-0 transition-all duration-300 ease-smooth ${
          activeTab === 'mejores'
            ? 'opacity-100 z-10'
            : 'opacity-0 z-0 pointer-events-none'
        }`}>
          <VistaMejores onPuestoClick={handlePuestoClick} />
        </div>
      </div>

      {/* FAB - Botón flotante para agregar */}
      {activeTab === 'mapa' && (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="fixed bottom-24 right-4 z-30 w-12 h-12 bg-gray-900 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-gray-800 hover:shadow-xl hover:scale-105 active:scale-95"
          aria-label="Agregar puesto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modal de Formulario */}
      <Modal
        isOpen={mostrarFormulario}
        onClose={() => setMostrarFormulario(false)}
        title="Agregar lugar"
        description="Comparte un nuevo puesto de antojitos"
      >
        <FormularioAgregarPuesto
          onPuestoAgregado={handlePuestoAgregado}
          onCancelar={() => setMostrarFormulario(false)}
        />
      </Modal>
    </div>
  )
}
