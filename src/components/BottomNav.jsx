export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'mapa',
      label: 'Explorar',
      icon: (active) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'guardados',
      label: 'Guardados',
      icon: (active) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    },
    {
      id: 'mejores',
      label: 'Top',
      icon: (active) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Blur background */}
      <div className="absolute inset-0 bg-noche-900/95 backdrop-blur-xl border-t border-noche-700/50" />

      {/* Tabs */}
      <div className="relative flex items-center justify-around px-6 h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-ambar-400'
                  : 'text-crema-100/50 hover:text-crema-100/80'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                {tab.icon(isActive)}
                {isActive && (
                  <div className="absolute -inset-2 bg-ambar-500/20 rounded-full blur-md -z-10" />
                )}
              </div>
              <span className={`text-xs font-semibold ${isActive ? 'text-ambar-400' : ''}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
