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

function EstrellaIcono({ filled }) {
  return (
    <svg
      className={`w-4 h-4 ${filled ? 'text-ambar-400' : 'text-noche-600'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
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

        // Obtener todos los puestos con sus reseñas
        const { data: puestosData, error: puestosError } = await supabase
          .from('puestos')
          .select('*')

        if (puestosError) throw puestosError

        // Obtener todas las reseñas
        const { data: resenasData, error: resenasError } = await supabase
          .from('resenas')
          .select('puesto_id, estrellas')

        if (resenasError) throw resenasError

        // Calcular promedio de estrellas por puesto
        const puestosConRating = puestosData.map(puesto => {
          const resenasDelPuesto = resenasData.filter(r => r.puesto_id === puesto.id)
          const totalResenas = resenasDelPuesto.length
          const promedio = totalResenas > 0
            ? resenasDelPuesto.reduce((sum, r) => sum + r.estrellas, 0) / totalResenas
            : 0

          return {
            ...puesto,
            promedio,
            totalResenas
          }
        })

        // Filtrar solo los que tienen al menos 1 reseña y ordenar por promedio
        const mejores = puestosConRating
          .filter(p => p.totalResenas > 0)
          .sort((a, b) => {
            // Primero por promedio, luego por cantidad de reseñas
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

  const puestosFiltrados = filtro === 'todos'
    ? puestos
    : puestos.filter(p => p.tipo_comida === filtro)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-noche-700 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-ambar-500 rounded-full animate-spin" />
          </div>
          <p className="text-crema-100/60 text-sm">Cargando los mejores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-noche-950">
      {/* Header */}
      <header className="sticky top-0 z-20 glass-dark border-b border-noche-700/50">
        <div className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-ambar-400 to-ambar-600 rounded-xl flex items-center justify-center shadow-glow-ambar">
              <svg className="w-5 h-5 text-noche-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-crema-50">
                Top Antojitos
              </h1>
              <p className="text-sm text-crema-100/50">
                Los mejor calificados
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="px-5 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {tiposUnicos.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                  filtro === tipo
                    ? 'bg-ambar-500 text-noche-900 shadow-glow-ambar'
                    : 'bg-noche-800/60 text-crema-100/70 hover:bg-noche-700'
                }`}
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
          <div className="p-4 space-y-3">
            {puestosFiltrados.map((puesto, index) => (
              <button
                key={puesto.id}
                onClick={() => onPuestoClick(puesto)}
                className="w-full card-dark-hover p-4 text-left stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Posición / Medalla */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-lg ${
                    index === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-noche-900' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-noche-900' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-noche-900' :
                    'bg-noche-700 text-crema-100/60'
                  }`}>
                    {index + 1}
                  </div>

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

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <EstrellaIcono key={num} filled={num <= Math.round(puesto.promedio)} />
                        ))}
                      </div>
                      <span className="text-ambar-400 font-bold text-sm">
                        {puesto.promedio.toFixed(1)}
                      </span>
                      <span className="text-crema-100/40 text-xs">
                        ({puesto.totalResenas})
                      </span>
                    </div>

                    {puesto.tipo_comida && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-noche-700/60 text-crema-100/60 text-xs font-medium rounded-full">
                        {puesto.tipo_comida}
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-crema-100/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 bg-noche-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-crema-100/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-display font-bold text-crema-50 mb-2">
                Sin rankings aún
              </h3>
              <p className="text-crema-100/50 text-sm">
                Los puestos aparecerán aquí cuando tengan reseñas
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
