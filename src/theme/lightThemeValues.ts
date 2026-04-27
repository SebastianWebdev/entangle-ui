/**
 * Light theme values — pure data, no `@vanilla-extract/css` calls.
 *
 * Mirrors `darkThemeValues` shape exactly so `createCustomTheme` and
 * `createLightTheme` can share the merge helper and so `LightThemeValues`
 * stays structurally compatible with `DarkThemeValues`.
 *
 * Lives in a plain `.ts` module so build-time tooling (token export,
 * docs generation) can import the values without booting the Vanilla
 * Extract runtime. `lightTheme.css.ts` re-exports this object and is
 * the file that actually creates the scoped theme class.
 *
 * Note on `colors.surface.whiteOverlay`: the token name is kept for
 * contract compatibility, but in light mode it flips polarity to a
 * subtle dark overlay (`rgba(0, 0, 0, 0.06)`) so it still reads as a
 * "subtle tint over the underlying surface".
 */
export const lightThemeValues = {
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f7',
      tertiary: '#ebebee',
      elevated: '#ffffff',
      inset: '#f8f8fa',
    },
    surface: {
      default: '#ffffff',
      hover: '#f0f0f3',
      active: '#e6e6ea',
      disabled: '#f5f5f7',
      whiteOverlay: 'rgba(0, 0, 0, 0.06)',
      row: '#ffffff',
      rowHover: '#f5f5f7',
    },
    border: {
      default: '#e0e0e3',
      focus: '#0066cc',
      error: '#d32f2f',
      success: '#2e7d32',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
      muted: '#6b6b6b',
      disabled: '#b0b0b0',
    },
    accent: {
      primary: '#0066cc',
      secondary: '#004a99',
      success: '#2e7d32',
      warning: '#a64500',
      error: '#d32f2f',
    },
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
  spacing: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '24px',
    xxxl: '32px',
  },
  typography: {
    fontSize: {
      xxs: '9px',
      xs: '10px',
      sm: '11px',
      md: '12px',
      lg: '14px',
      xl: '16px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.4',
      relaxed: '1.6',
    },
    fontFamily: {
      mono: 'SF Mono, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
  },
  borderRadius: {
    none: '0px',
    sm: '2px',
    md: '4px',
    lg: '6px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 2px 4px rgba(0, 0, 0, 0.08)',
    lg: '0 4px 12px rgba(0, 0, 0, 0.10)',
    xl: '0 8px 24px rgba(0, 0, 0, 0.12)',
    focus: '0 0 0 2px rgba(0, 102, 204, 0.3)',
    separatorBottom: '0 1px 2px rgba(0, 0, 0, 0.04)',
    separatorRight: '1px 0 2px rgba(0, 0, 0, 0.04)',
    separatorLeft: '-1px 0 2px rgba(0, 0, 0, 0.04)',
    thumb: '0 0 2px rgba(0, 0, 0, 0.15)',
  },
  transitions: {
    fast: '100ms ease-out',
    normal: '200ms ease-out',
    slow: '300ms ease-out',
  },
  zIndex: {
    base: '1',
    dropdown: '1000',
    popover: '1000',
    tooltip: '1000',
    modal: '1100',
  },
  shell: {
    menuBar: {
      height: '28px',
      bg: '#f5f5f7',
      hoverBg: '#ebebee',
      activeBg: '#0066cc',
      text: '#1a1a1a',
      shortcutText: '#6b6b6b',
    },
    toolbar: {
      height: { sm: '32px', md: '40px' },
      bg: '#f5f5f7',
      separator: '#e0e0e3',
    },
    statusBar: {
      height: '22px',
      heightMd: '26px',
      bg: '#0066cc',
      text: '#ffffff',
    },
    dock: {
      tabHeight: '28px',
      tabBg: '#f5f5f7',
      tabActiveBg: '#ffffff',
      tabHoverBg: '#ebebee',
      tabText: '#4a4a4a',
      tabActiveText: '#1a1a1a',
      splitterSize: '4px',
      splitterColor: '#e0e0e3',
      splitterHoverColor: '#0066cc',
      borderBarBg: '#f5f5f7',
      borderBarSize: '28px',
      dropOverlay: 'rgba(0, 102, 204, 0.15)',
    },
  },
  storybook: {
    canvas: {
      gradientStart: '#fafafa',
      gradientMid: '#f0f0f3',
      gradientEnd: '#ebebee',
    },
  },
} as const;

export type LightThemeValues = typeof lightThemeValues;
