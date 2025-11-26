import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Card, EmptyState, Spinner, Badge } from './ui'

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

  useEffect(() => {
    const saved = localStorage.getItem('antojitos_guardados')
    if (saved) {
      setGuardados(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

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
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 glass safe-area-top">
        <div className="px-4 py-4 max-w-lg mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">Guardados</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {puestosGuardados.length} lugares guardados
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {puestosGuardados.length > 0 ? (
          <div className="p-4 space-y-3 max-w-lg mx-auto">
            {puestosGuardados.map((puesto, index) => (
              <Card
                key={puesto.id}
                variant="interactive"
                padding="none"
                className="stagger-item overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icono */}
                    <div className="w-12 h-12 bg-warm-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">
                        {tipoIconos[puesto.tipo_comida] || '🍽️'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {puesto.nombre}
                      </h3>
                      {puesto.tipo_comida && (
                        <Badge variant="warm" size="sm" className="mt-1">
                          {puesto.tipo_comida}
                        </Badge>
                      )}
                      {puesto.descripcion && (
                        <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">
                          {puesto.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onPuestoClick(puesto)}
                        className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromSaved(puesto.id)
                        }}
                        className="w-9 h-9 bg-error-50 hover:bg-error-100 rounded-lg flex items-center justify-center text-error-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="📑"
            title="Sin guardados"
            description="Guarda tus lugares favoritos para acceder rápido"
            className="h-full"
          />
        )}
      </div>
    </div>
  )
}
