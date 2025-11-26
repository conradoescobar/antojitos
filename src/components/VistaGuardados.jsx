import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const tipoIconos = {
  'Tacos': '🌮',
  'Tortas': '🥪',
  'Quesadillas': '🧀',
  'Tamales': '🫔',
  'Antojitos': '🌽',
  'Bebidas': '🥤',
  'Postres': '🍮'
}

export default function VistaGuardados({ onPuestoClick }) {
  const [guardados, setGuardados] = useState([])
  const [puestosGuardados, setPuestosGuardados] = useState([])
  const [loading, setLoading] = useState(true)

  // Cargar IDs guardados de localStorage
  useEffect(() => {
    const saved = localStorage.getItem('antojitos_guardados')
    if (saved) {
      setGuardados(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  // Cargar puestos desde Supabase cuando tengamos los IDs
  useEffect(() => {
    async function fetchPuestosGuardados() {
      if (guardados.length === 0) {
        setPuestosGuardados([])
        return
      }

      try {
        const { data, error } = await supabase
          .from('puestos')
          .select('*')
          .in('id', guardados)

        if (error) throw error
        setPuestosGuardados(data || [])
      } catch (err) {
        console.error('Error cargando guardados:', err)
      }
    }

    fetchPuestosGuardados()
  }, [guardados])

  const removeFromSaved = (puestoId) => {
    const newGuardados = guardados.filter(id => id !== puestoId)
    setGuardados(newGuardados)
    localStorage.setItem('antojitos_guardados', JSON.stringify(newGuardados))
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-noche-700 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-ambar-500 rounded-full animate-spin" />
          </div>
          <p className="text-crema-100/60 text-sm">Cargando guardados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-noche-950">
      {/* Header */}
      <header className="sticky top-0 z-20 glass-dark border-b border-noche-700/50">
        <div className="px-5 py-4">
          <h1 className="text-2xl font-display font-bold text-crema-50">
            Guardados
          </h1>
          <p className="text-sm text-crema-100/50 mt-1">
            Tus antojitos favoritos
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {puestosGuardados.length > 0 ? (
          <div className="p-4 space-y-3">
            {puestosGuardados.map((puesto, index) => (
              <div
                key={puesto.id}
                className="card-dark-hover p-4 stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Icono */}
                  <div className="w-14 h-14 bg-ambar-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">
                      {tipoIconos[puesto.tipo_comida] || '🍽️'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-crema-50 text-lg truncate">
                      {puesto.nombre}
                    </h3>
                    {puesto.tipo_comida && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-ambar-500/20 text-ambar-400 text-xs font-medium rounded-full">
                        {puesto.tipo_comida}
                      </span>
                    )}
                    {puesto.descripcion && (
                      <p className="text-sm text-crema-100/50 mt-2 line-clamp-2">
                        {puesto.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onPuestoClick(puesto)}
                      className="w-10 h-10 bg-ambar-500/20 hover:bg-ambar-500/30 rounded-xl flex items-center justify-center text-ambar-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeFromSaved(puesto.id)}
                      className="w-10 h-10 bg-rosa-500/10 hover:bg-rosa-500/20 rounded-xl flex items-center justify-center text-rosa-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 bg-noche-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-crema-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold text-crema-50 mb-2">
                Sin guardados
              </h3>
              <p className="text-crema-100/50 text-sm">
                Guarda tus puestos favoritos para encontrarlos rápido
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
