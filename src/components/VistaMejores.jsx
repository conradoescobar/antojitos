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

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((num) => (
        <svg
          key={num}
          className={`w-3.5 h-3.5 ${num <= Math.round(rating) ? 'star-filled' : 'star-empty'}`}
          fill={num <= Math.round(rating) ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function VistaMejores({ onPuestoClick }) {
  const [puestos, setPuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    async function fetchMejores() {
      try {
        setLoading(true)

        const { data: puestosData, error: puestosError } = await supabase
          .from('puestos')
          .select('*')

        if (puestosError) throw puestosError

        const { data: resenasData, error: resenasError } = await supabase
          .from('resenas')
          .select('puesto_id, estrellas')

        if (resenasError) throw resenasError

        const puestosConRating = puestosData.map(puesto => {
          const resenasDelPuesto = resenasData.filter(r => r.puesto_id === puesto.id)
          const totalResenas = resenasDelPuesto.length
          const promedio = totalResenas > 0
            ? resenasDelPuesto.reduce((sum, r) => sum + r.estrellas, 0) / totalResenas
            : 0

          return { ...puesto, promedio, totalResenas }
        })

        const mejores = puestosConRating
          .filter(p => p.totalResenas > 0)
          .sort((a, b) => {
            if (b.promedio !== a.promedio) return b.promedio - a.promedio
            return b.totalResenas - a.totalResenas
          })

        setPuestos(mejores)
      } catch (err) {
        console.error('Error cargando mejores:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMejores()
  }, [])

  const tiposUnicos = ['todos', ...new Set(puestos.map(p => p.tipo_comida).filter(Boolean))]
  const puestosFiltrados = filtro === 'todos' ? puestos : puestos.filter(p => p.tipo_comida === filtro)

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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-warm-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-warm-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Top Lugares</h1>
              <p className="text-sm text-gray-500">Los mejor calificados</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="px-4 pb-3 max-w-lg mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {tiposUnicos.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium
                  transition-all duration-200
                  ${filtro === tipo
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {tipo === 'todos' ? 'Todos' : `${tipoIconos[tipo] || '🍽️'} ${tipo}`}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {puestosFiltrados.length > 0 ? (
          <div className="p-4 space-y-3 max-w-lg mx-auto">
            {puestosFiltrados.map((puesto, index) => (
              <Card
                key={puesto.id}
                variant="interactive"
                padding="none"
                className="stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => onPuestoClick(puesto)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Ranking */}
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      font-semibold text-sm
                      ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'}
                    `}>
                      {index + 1}
                    </div>

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

                      {/* Rating */}
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={puesto.promedio} />
                        <span className="text-sm font-medium text-warm-600">
                          {puesto.promedio.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({puesto.totalResenas})
                        </span>
                      </div>

                      {puesto.tipo_comida && (
                        <Badge variant="default" size="sm" className="mt-1.5">
                          {puesto.tipo_comida}
                        </Badge>
                      )}
                    </div>

                    {/* Arrow */}
                    <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="⭐"
            title="Sin rankings"
            description="Los lugares aparecerán cuando tengan reseñas"
            className="h-full"
          />
        )}
      </div>
    </div>
  )
}
