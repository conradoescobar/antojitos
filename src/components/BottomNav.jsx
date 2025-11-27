/**
 * BottomNav - Navegación inferior estilo Neon Market Night
 * Glassmorphism oscuro con efectos neón
 */
export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'mapa',
      label: 'Explorar',
      icon: (active) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      )
    },
    {
      id: 'guardados',
      label: 'Guardados',
      icon: (active) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
      )
    },
    {
      id: 'mejores',
      label: 'Top',
      icon: (active) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      )
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Gradient line top */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--neon-pink)]/50 to-transparent" />

      {/* Background con glass dark */}
      <div className="glass-dark">
        {/* Tabs */}
        <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex flex-col items-center justify-center gap-1.5
                  w-20 py-3 rounded-2xl
                  transition-all duration-300 ease-out
                  ${isActive
                    ? 'text-[var(--neon-pink)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-dim)]'
                  }
                `}
              >
                {/* Active glow background */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-2xl bg-[var(--neon-pink)]/10 border border-[var(--neon-pink)]/20"
                    style={{ boxShadow: '0 0 20px rgba(255, 46, 99, 0.2)' }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`relative z-10 transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                  style={isActive ? { filter: 'drop-shadow(0 0 8px rgba(255, 46, 99, 0.6))' } : {}}
                >
                  {tab.icon(isActive)}
                </div>

                {/* Label */}
                <span
                  className={`relative z-10 text-[11px] font-display tracking-wider uppercase ${
                    isActive ? 'text-[var(--neon-pink)]' : 'text-[var(--text-muted)]'
                  }`}
                  style={isActive ? { textShadow: '0 0 10px rgba(255, 46, 99, 0.5)' } : {}}
                >
                  {tab.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--neon-pink)]"
                    style={{ boxShadow: 'var(--glow-pink)' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
