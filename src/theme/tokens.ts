// src/theme/tokens.ts
export const tokens = {
  colors: {
    background: {
      primary: '#1a1a1a',
      secondary: '#2d2d2d',
      tertiary: '#3a3a3a',
      elevated: '#404040',
    },
    surface: {
      default: '#2d2d2d',
      hover: '#363636',
      active: '#404040',
      disabled: '#1f1f1f',
    },
    border: {
      default: '#4a4a4a',
      focus: '#007acc',
      error: '#f44336',
      success: '#4caf50',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
      muted: '#888888',
      disabled: '#555555',
    },
    accent: {
      primary: '#007acc',
      secondary: '#005a9e',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
    },
  },
  spacing: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    xxxl: 32,
  },
  typography: {
    fontSize: {
      xs: 10,
      sm: 11,
      md: 12,
      lg: 14,
      xl: 16,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
    fontFamily: {
      mono: 'SF Mono, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  },
  borderRadius: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 6,
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
    md: '0 2px 4px rgba(0, 0, 0, 0.3)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.4)',
    focus: '0 0 0 2px rgba(0, 122, 204, 0.4)',
  },
  transitions: {
    fast: '100ms ease-out',
    normal: '200ms ease-out',
    slow: '300ms ease-out',
  },
  shell: {
    menuBar: {
      height: 28,
      bg: '#2d2d2d', // colors.surface.default
      hoverBg: '#363636', // colors.surface.hover
      activeBg: '#005a9e', // colors.accent.secondary
      text: '#ffffff', // colors.text.primary
      shortcutText: '#888888', // colors.text.muted
    },
    toolbar: {
      height: { sm: 32, md: 40 },
      bg: '#2d2d2d', // colors.surface.default
      separator: '#4a4a4a', // colors.border.default
    },
    statusBar: {
      height: 22,
      bg: '#007acc', // colors.accent.primary
      text: '#ffffff', // colors.text.primary
    },
    dock: {
      tabHeight: 28,
      tabBg: '#2d2d2d', // colors.surface.default
      tabActiveBg: '#1a1a1a', // colors.background.primary
      tabHoverBg: '#363636', // colors.surface.hover
      tabText: '#cccccc', // colors.text.secondary
      tabActiveText: '#ffffff', // colors.text.primary
      splitterSize: 4,
      splitterColor: '#4a4a4a', // colors.border.default
      splitterHoverColor: '#007acc', // colors.accent.primary
      borderBarBg: '#2d2d2d', // colors.surface.default
      borderBarSize: 28,
      dropOverlay: 'rgba(0, 122, 204, 0.2)', // colors.accent.primary with alpha
    },
  },
} as const;

export type Tokens = typeof tokens;
