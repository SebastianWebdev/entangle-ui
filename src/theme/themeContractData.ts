/**
 * The structural input passed to `createGlobalThemeContract` to build the
 * Vanilla Extract `vars` object. Lives in a plain `.ts` module (no
 * `@vanilla-extract/css` calls) so build-time tooling — token export,
 * docs generation, etc. — can import it without the Vanilla Extract
 * runtime, which only works inside a `.css.ts` file scope.
 *
 * Each leaf is the CSS custom property name (without the leading `--`).
 * The names are part of the PUBLIC API; renaming requires a major version
 * bump.
 */
export const themeContractData = {
  colors: {
    background: {
      primary: 'etui-color-bg-primary',
      secondary: 'etui-color-bg-secondary',
      tertiary: 'etui-color-bg-tertiary',
      elevated: 'etui-color-bg-elevated',
      inset: 'etui-color-bg-inset',
    },
    surface: {
      default: 'etui-color-surface-default',
      hover: 'etui-color-surface-hover',
      active: 'etui-color-surface-active',
      disabled: 'etui-color-surface-disabled',
      whiteOverlay: 'etui-color-surface-white-overlay',
      row: 'etui-color-surface-row',
      rowHover: 'etui-color-surface-row-hover',
    },
    border: {
      default: 'etui-color-border-default',
      focus: 'etui-color-border-focus',
      error: 'etui-color-border-error',
      success: 'etui-color-border-success',
    },
    text: {
      primary: 'etui-color-text-primary',
      secondary: 'etui-color-text-secondary',
      muted: 'etui-color-text-muted',
      disabled: 'etui-color-text-disabled',
    },
    accent: {
      primary: 'etui-color-accent-primary',
      secondary: 'etui-color-accent-secondary',
      success: 'etui-color-accent-success',
      warning: 'etui-color-accent-warning',
      error: 'etui-color-accent-error',
    },
    backdrop: 'etui-color-backdrop',
  },
  spacing: {
    xs: 'etui-spacing-xs',
    sm: 'etui-spacing-sm',
    md: 'etui-spacing-md',
    lg: 'etui-spacing-lg',
    xl: 'etui-spacing-xl',
    xxl: 'etui-spacing-xxl',
    xxxl: 'etui-spacing-xxxl',
  },
  typography: {
    fontSize: {
      xxs: 'etui-font-size-xxs',
      xs: 'etui-font-size-xs',
      sm: 'etui-font-size-sm',
      md: 'etui-font-size-md',
      lg: 'etui-font-size-lg',
      xl: 'etui-font-size-xl',
    },
    fontWeight: {
      normal: 'etui-font-weight-normal',
      medium: 'etui-font-weight-medium',
      semibold: 'etui-font-weight-semibold',
    },
    lineHeight: {
      tight: 'etui-line-height-tight',
      normal: 'etui-line-height-normal',
      relaxed: 'etui-line-height-relaxed',
    },
    fontFamily: {
      mono: 'etui-font-family-mono',
      sans: 'etui-font-family-sans',
    },
  },
  borderRadius: {
    none: 'etui-radius-none',
    sm: 'etui-radius-sm',
    md: 'etui-radius-md',
    lg: 'etui-radius-lg',
  },
  shadows: {
    sm: 'etui-shadow-sm',
    md: 'etui-shadow-md',
    lg: 'etui-shadow-lg',
    xl: 'etui-shadow-xl',
    focus: 'etui-shadow-focus',
    separatorBottom: 'etui-shadow-separator-bottom',
    separatorRight: 'etui-shadow-separator-right',
    separatorLeft: 'etui-shadow-separator-left',
    thumb: 'etui-shadow-thumb',
  },
  transitions: {
    fast: 'etui-transition-fast',
    normal: 'etui-transition-normal',
    slow: 'etui-transition-slow',
  },
  zIndex: {
    base: 'etui-z-base',
    dropdown: 'etui-z-dropdown',
    popover: 'etui-z-popover',
    tooltip: 'etui-z-tooltip',
    modal: 'etui-z-modal',
  },
  shell: {
    menuBar: {
      height: 'etui-shell-menubar-height',
      bg: 'etui-shell-menubar-bg',
      hoverBg: 'etui-shell-menubar-hover-bg',
      activeBg: 'etui-shell-menubar-active-bg',
      text: 'etui-shell-menubar-text',
      shortcutText: 'etui-shell-menubar-shortcut-text',
    },
    toolbar: {
      height: {
        sm: 'etui-shell-toolbar-height-sm',
        md: 'etui-shell-toolbar-height-md',
      },
      bg: 'etui-shell-toolbar-bg',
      separator: 'etui-shell-toolbar-separator',
    },
    statusBar: {
      height: 'etui-shell-statusbar-height',
      heightMd: 'etui-shell-statusbar-height-md',
      bg: 'etui-shell-statusbar-bg',
      text: 'etui-shell-statusbar-text',
    },
    dock: {
      tabHeight: 'etui-shell-dock-tab-height',
      tabBg: 'etui-shell-dock-tab-bg',
      tabActiveBg: 'etui-shell-dock-tab-active-bg',
      tabHoverBg: 'etui-shell-dock-tab-hover-bg',
      tabText: 'etui-shell-dock-tab-text',
      tabActiveText: 'etui-shell-dock-tab-active-text',
      splitterSize: 'etui-shell-dock-splitter-size',
      splitterColor: 'etui-shell-dock-splitter-color',
      splitterHoverColor: 'etui-shell-dock-splitter-hover-color',
      borderBarBg: 'etui-shell-dock-border-bar-bg',
      borderBarSize: 'etui-shell-dock-border-bar-size',
      dropOverlay: 'etui-shell-dock-drop-overlay',
    },
  },
  storybook: {
    canvas: {
      gradientStart: 'etui-storybook-gradient-start',
      gradientMid: 'etui-storybook-gradient-mid',
      gradientEnd: 'etui-storybook-gradient-end',
    },
  },
} as const;

export type ThemeContractData = typeof themeContractData;
