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
          .eq('activo', true)
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
    <div className="h-[100dvh] flex flex-col bg-[var(--night-black)] bg-grid relative overflow-hidden">
      {/* Header con efecto neón */}
      {activeTab === 'mapa' && (
        <header className="relative z-20">
          {/* Gradient line top */}
          <div className="h-1 bg-gradient-to-r from-[var(--neon-pink)] via-[var(--neon-orange)] to-[var(--neon-yellow)] animate-gradient" />

          <div className="glass-dark border-b border-white/5 safe-area-top">
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-orange)] flex items-center justify-center animate-float-up">
                      <span className="text-2xl">🌮</span>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-orange)] blur-xl opacity-50 -z-10" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl gradient-text animate-glow-flicker">
                      Antojitos
                    </h1>
                    <p className="text-xs text-[var(--text-muted)] tracking-widest uppercase">
                      Street Food Finder
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xl font-display text-[var(--neon-yellow)]" style={{ textShadow: 'var(--glow-yellow)' }}>
                      {puestos.length}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Puestos</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  {userLocation ? (
                    <div className="w-9 h-9 rounded-xl bg-[var(--neon-cyan)]/20 flex items-center justify-center border border-[var(--neon-cyan)]/30">
                      <div className="w-2 h-2 bg-[var(--neon-cyan)] rounded-full animate-pulse" style={{ boxShadow: 'var(--glow-cyan)' }} />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-[var(--night-medium)] flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Contenido Principal */}
      <div className="flex-1 overflow-hidden relative">
        {/* Vista de Mapa */}
        <div className={`absolute inset-0 transition-all duration-500 ease-out ${
          activeTab === 'mapa'
            ? 'opacity-100 translate-x-0 z-10'
            : 'opacity-0 -translate-x-full z-0 pointer-events-none'
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
        <div className={`absolute inset-0 transition-all duration-500 ease-out ${
          activeTab === 'guardados'
            ? 'opacity-100 translate-x-0 z-10'
            : 'opacity-0 translate-x-full z-0 pointer-events-none'
        }`}>
          <VistaGuardados onPuestoClick={handlePuestoClick} />
        </div>

        {/* Vista de Mejores */}
        <div className={`absolute inset-0 transition-all duration-500 ease-out ${
          activeTab === 'mejores'
            ? 'opacity-100 translate-x-0 z-10'
            : 'opacity-0 translate-x-full z-0 pointer-events-none'
        }`}>
          <VistaMejores onPuestoClick={handlePuestoClick} />
        </div>
      </div>

      {/* FAB Neón */}
      {activeTab === 'mapa' && (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="fab-neon bottom-28 right-5"
          aria-label="Agregar puesto"
        >
          <svg className="w-7 h-7 text-[var(--night-black)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <div
          className="modal-overlay animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setMostrarFormulario(false)}
        >
          <div className="modal-content animate-slide-up">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 glass-dark border-b border-white/5 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl gradient-text">
                  Nuevo Puesto
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Comparte un spot 🔥
                </p>
              </div>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--night-medium)] hover:bg-[var(--neon-pink)] hover:text-[var(--night-black)] transition-all duration-300 hover:rotate-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <FormularioAgregarPuesto
                onPuestoAgregado={handlePuestoAgregado}
                onCancelar={() => setMostrarFormulario(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
