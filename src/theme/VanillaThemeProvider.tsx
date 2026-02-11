import React from 'react';

export interface VanillaThemeProviderProps {
  children: React.ReactNode;
  /**
   * CSS class name that sets theme CSS custom properties.
   * Can be a class from createTheme() or a custom class.
   *
   * When omitted, components inherit tokens from :root (dark theme).
   */
  className?: string;
}

/**
 * Optional wrapper for scoped theme overrides.
 *
 * The dark theme is applied globally on :root — most apps don't need
 * VanillaThemeProvider at all. Use it only when you need a different theme
 * for a subtree (e.g. a light-themed dialog inside a dark app).
 *
 * @example
 * ```tsx
 * // No provider needed for default dark theme:
 * <App />
 *
 * // Scoped override for a subtree:
 * <VanillaThemeProvider className="my-light-section">
 *   <SettingsPanel />
 * </VanillaThemeProvider>
 * ```
 */
export const VanillaThemeProvider: React.FC<VanillaThemeProviderProps> = ({
  children,
  className,
}) => {
  return <div className={className}>{children}</div>;
};
