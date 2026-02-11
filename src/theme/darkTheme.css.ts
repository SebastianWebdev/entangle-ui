import { createGlobalTheme } from '@vanilla-extract/css';
import { vars } from './contract.css';

/**
 * Dark theme values — exported separately so the createCustomTheme helper
 * can deep-merge consumer overrides onto these defaults.
 */
export const darkThemeValues = {
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
      whiteOverlay: 'rgba(255, 255, 255, 0.1)',
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
    backdrop: 'rgba(0, 0, 0, 0.6)',
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
    sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
    md: '0 2px 4px rgba(0, 0, 0, 0.3)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.4)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.5)',
    focus: '0 0 0 2px rgba(0, 122, 204, 0.4)',
    separatorBottom: '0 1px 2px rgba(0, 0, 0, 0.18)',
    separatorRight: '1px 0 2px rgba(0, 0, 0, 0.18)',
    separatorLeft: '-1px 0 2px rgba(0, 0, 0, 0.18)',
    thumb: '0 0 2px rgba(0, 0, 0, 0.5)',
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
      bg: '#2d2d2d',
      hoverBg: '#363636',
      activeBg: '#005a9e',
      text: '#ffffff',
      shortcutText: '#888888',
    },
    toolbar: {
      height: { sm: '32px', md: '40px' },
      bg: '#2d2d2d',
      separator: '#4a4a4a',
    },
    statusBar: {
      height: '22px',
      heightMd: '26px',
      bg: '#007acc',
      text: '#ffffff',
    },
    dock: {
      tabHeight: '28px',
      tabBg: '#2d2d2d',
      tabActiveBg: '#1a1a1a',
      tabHoverBg: '#363636',
      tabText: '#cccccc',
      tabActiveText: '#ffffff',
      splitterSize: '4px',
      splitterColor: '#4a4a4a',
      splitterHoverColor: '#007acc',
      borderBarBg: '#2d2d2d',
      borderBarSize: '28px',
      dropOverlay: 'rgba(0, 122, 204, 0.2)',
    },
  },
  storybook: {
    canvas: {
      gradientStart: '#061f21',
      gradientMid: '#031a1a',
      gradientEnd: '#091010',
    },
  },
} as const;

export type DarkThemeValues = typeof darkThemeValues;

/**
 * Apply dark theme values to the :root selector.
 * This is the default theme — its CSS custom properties are set globally
 * on :root and inherited by all components.
 */
createGlobalTheme(':root', vars, darkThemeValues);
