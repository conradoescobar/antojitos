/**
 * Logo de Antojitos - Taco estilizado
 * Usado en splash screen, header y onboarding
 */
export default function TacoLogo({ size = 80, variant = 'default' }) {
  // Variante para fondo oscuro (splash) o claro (header)
  const bgColor = variant === 'splash'
    ? 'rgba(255,255,255,0.15)'
    : 'var(--primary-terracota)'

  const strokeColor = variant === 'splash' ? 'white' : '#FEF3C7'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="40" cy="40" r="38" fill={bgColor} />
      <g transform="translate(12, 16)">
        {/* Tortilla base */}
        <path
          d="M4 32C4 32 8 8 28 8C48 8 52 32 52 32C52 36 44 44 28 44C12 44 4 36 4 32Z"
          fill="#FEF3C7"
          stroke={strokeColor}
          strokeWidth="2"
        />
        {/* Relleno - carne */}
        <ellipse cx="28" cy="24" rx="18" ry="10" fill="#92400E" />
        {/* Lechuga */}
        <path
          d="M12 22C12 22 18 18 28 18C38 18 44 22 44 22C44 22 38 26 28 26C18 26 12 22 12 22Z"
          fill="#22C55E"
        />
        {/* Tomate */}
        <circle cx="20" cy="20" r="4" fill="#EF4444" />
        <circle cx="36" cy="20" r="4" fill="#EF4444" />
        {/* Queso */}
        <path
          d="M16 28L20 22L24 28L28 22L32 28L36 22L40 28"
          stroke="#FCD34D"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  )
}
