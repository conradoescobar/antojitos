/**
 * Sistema de colores centralizado para Antojitos
 * Todos los componentes deben usar estos tokens en lugar de valores hex directos
 */

export const colors = {
  // ============================================
  // PRIMARIOS / BRAND
  // ============================================
  primary: {
    main: '#F9A825',      // Primario - FAB, botones principales, iconos activos
    dark: '#D5901A',      // Primario oscuro - estados pressed/hover
    intense: '#D03920',   // Chili Pepper - atención fuerte, alertas, pin seleccionado
    terracota: '#D97757', // Terracota - splash, acciones destacadas
    terracotaDark: '#C46847', // Terracota oscuro - hover states
  },

  brand: {
    comal: '#D09201',      // Comal Brown - pines de comida base
    comalDark: '#D39200',  // Comal Brown dark
    agaveDark: '#D66458',  // Agave Dark - bebidas/café
  },

  // ============================================
  // NEUTROS
  // ============================================
  neutral: {
    900: '#3A3A3A',  // Tesidian Text - texto principal
    850: '#1A1915',  // Dark text - onboarding
    700: '#555960',  // Asphalt Grey - texto secundario
    650: '#6B6560',  // Warm grey - texto secundario cálido
    500: '#9090B0',  // 90ble Grey - labels/metadata
    200: '#F5F5F5',  // Fondo gris claro
    100: '#FAF9F7',  // Fondo crema claro (beige cálido)
    white: '#FFFFFF',
    border: '#CFD8DC', // Bordes / líneas
    borderWarm: '#E5E1DB', // Bordes cálidos
  },

  // ============================================
  // ACENTOS
  // ============================================
  accent: {
    frida: '#F06212',   // Pink Frida - chips/tags importantes
    condesa: '#00839A', // Azul Condesa - botones secundarios
  },

  // ============================================
  // ESTADOS
  // ============================================
  state: {
    warning: '#FAC150', // Warning / Advertencia
    error: '#D3224F',   // Error
    success: '#16A34A', // Success (verde)
  },
}

// ============================================
// ROLES DE TEXTO
// ============================================
export const text = {
  primary: colors.neutral[900],
  secondary: colors.neutral[700],
  muted: colors.neutral[500],
  inverse: colors.neutral.white,
}

// ============================================
// ROLES POR COMPONENTE
// ============================================
export const components = {
  // FAB
  fab: {
    background: colors.primary.main,
    backgroundPressed: colors.primary.dark,
    icon: colors.neutral.white,
  },

  // Botón primario
  buttonPrimary: {
    background: colors.primary.main,
    backgroundPressed: colors.primary.dark,
    text: colors.neutral.white,
  },

  // Botón secundario
  buttonSecondary: {
    background: 'transparent',
    border: colors.accent.condesa,
    text: colors.accent.condesa,
  },

  // Search bar
  searchBar: {
    background: colors.neutral.white,
    border: colors.neutral.border,
    icon: colors.neutral[700],
    placeholder: colors.neutral[500],
    text: text.primary,
  },

  // Header flotante
  header: {
    background: colors.neutral.white,
    title: text.primary,
    icon: text.primary,
    iconBackground: colors.neutral[200],
    border: colors.neutral.border,
  },

  // Bottom bar (tab bar)
  bottomBar: {
    background: colors.neutral.white,
    iconInactive: colors.neutral[500],
    iconActive: colors.primary.main,
    textInactive: colors.neutral[500],
    textActive: colors.primary.main,
    border: colors.neutral.border,
  },

  // Bottom sheet
  bottomSheet: {
    background: colors.neutral.white,
    title: text.primary,
    subtitle: text.secondary,
    metadata: colors.neutral[500],
    chip: colors.accent.frida,
    border: colors.neutral.border,
    button: colors.primary.main,
    buttonPressed: colors.primary.dark,
  },

  // Pines del mapa
  mapPin: {
    default: colors.brand.comal,       // Comida base
    selected: colors.primary.intense,   // Seleccionado
    postres: colors.primary.main,       // Postres/especiales
    bebidas: colors.brand.agaveDark,    // Bebidas/café
    icon: colors.neutral.white,
    outline: colors.neutral[900],
  },

  // Inputs
  input: {
    background: colors.neutral.white,
    border: colors.neutral.border,
    borderFocus: colors.primary.main,
    borderError: colors.state.error,
    placeholder: colors.neutral[500],
    text: text.primary,
  },
}

// ============================================
// SOMBRAS
// ============================================
export const shadows = {
  sm: '0 1px 2px rgba(58, 58, 58, 0.04)',
  md: '0 4px 12px rgba(58, 58, 58, 0.08)',
  lg: '0 12px 32px rgba(58, 58, 58, 0.12)',
  fab: '0 4px 16px rgba(249, 168, 37, 0.3)',
}

// Export default con todo
export default {
  colors,
  text,
  components,
  shadows,
}
