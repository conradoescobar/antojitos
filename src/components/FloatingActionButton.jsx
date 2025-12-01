// Icono de "más" minimalista
const PlusIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export default function FloatingActionButton({
  icon,
  onPress,
  size = 52,
  style = {},
  className = ''
}) {
  return (
    <button
      onClick={onPress}
      className={`
        absolute z-[1000]
        flex items-center justify-center
        rounded-full
        transition-transform duration-150 ease-out
        active:scale-95
        ${className}
      `}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1A1915',
        color: '#FFFFFF',
        boxShadow: '0 4px 16px rgba(26, 25, 21, 0.25), 0 2px 6px rgba(26, 25, 21, 0.15)',
        border: 'none',
        cursor: 'pointer',
        ...style
      }}
    >
      {icon || <PlusIcon size={size * 0.46} />}
    </button>
  )
}
