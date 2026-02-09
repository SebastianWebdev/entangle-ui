// src/tests/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { expect } from 'vitest';
import { ThemeProvider } from '@emotion/react';
import type { Theme } from '@/theme';

/**
 * Mock theme for testing purposes
 *
 * Provides a complete theme structure that matches the actual theme tokens
 * to ensure styled components work correctly in test environment.
 */
export const mockTheme: Theme = {
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
      bg: '#2d2d2d',
      hoverBg: '#363636',
      activeBg: '#005a9e',
      text: '#ffffff',
      shortcutText: '#888888',
    },
    toolbar: {
      height: { sm: 32, md: 40 },
      bg: '#2d2d2d',
      separator: '#4a4a4a',
    },
    statusBar: {
      height: 22,
      bg: '#007acc',
      text: '#ffffff',
    },
    dock: {
      tabHeight: 28,
      tabBg: '#2d2d2d',
      tabActiveBg: '#1a1a1a',
      tabHoverBg: '#363636',
      tabText: '#cccccc',
      tabActiveText: '#ffffff',
      splitterSize: 4,
      splitterColor: '#4a4a4a',
      splitterHoverColor: '#007acc',
      borderBarBg: '#2d2d2d',
      borderBarSize: 28,
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

/**
 * Test wrapper component that provides theme context
 *
 * Wraps components with the ThemeProvider to ensure all styled components
 * have access to theme tokens during testing.
 *
 * @param children - React components to wrap with theme provider
 * @param theme - Optional custom theme (defaults to mockTheme)
 */
interface TestWrapperProps {
  children: React.ReactNode;
  theme?: Theme;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  theme = mockTheme,
}) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;

/**
 * Custom render function with theme provider
 *
 * Renders components with theme context automatically provided.
 * Use this instead of the default render function from @testing-library/react
 * for components that use styled-components with theme.
 *
 * @param ui - React element to render
 * @param options - Render options (can include custom theme)
 * @returns Render result with theme context
 *
 * @example
 * ```tsx
 * // Basic usage
 * renderWithTheme(<Button>Test</Button>);
 *
 * // With custom theme
 * renderWithTheme(<Button>Test</Button>, {
 *   theme: customTheme
 * });
 *
 * // With additional render options
 * renderWithTheme(<Button>Test</Button>, {
 *   theme: customTheme,
 *   container: document.body
 * });
 * ```
 */
interface RenderWithThemeOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: Theme;
}

export const renderWithTheme = (
  ui: React.ReactElement,
  options: RenderWithThemeOptions = {}
) => {
  const { theme = mockTheme, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestWrapper theme={theme}>{children}</TestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Creates a custom theme for testing specific scenarios
 *
 * Allows partial theme overrides while maintaining the complete theme structure.
 * Useful for testing edge cases or specific theme configurations.
 *
 * @param overrides - Partial theme object to merge with mockTheme
 * @returns Complete theme with overrides applied
 *
 * @example
 * ```tsx
 * const customTheme = createTestTheme({
 *   colors: {
 *     accent: {
 *       primary: '#ff0000'
 *     }
 *   }
 * });
 *
 * renderWithTheme(<Button variant="filled">Test</Button>, {
 *   theme: customTheme
 * });
 * ```
 */
export const createTestTheme = (overrides: Partial<Theme> = {}): Theme => {
  return {
    ...mockTheme,
    ...overrides,
    colors: {
      ...mockTheme.colors,
      ...overrides.colors,
      background: {
        ...mockTheme.colors.background,
        ...overrides.colors?.background,
      },
      surface: {
        ...mockTheme.colors.surface,
        ...overrides.colors?.surface,
      },
      border: {
        ...mockTheme.colors.border,
        ...overrides.colors?.border,
      },
      text: {
        ...mockTheme.colors.text,
        ...overrides.colors?.text,
      },
      accent: {
        ...mockTheme.colors.accent,
        ...overrides.colors?.accent,
      },
    },
    storybook: {
      ...mockTheme.storybook,
      ...overrides.storybook,
      canvas: {
        ...mockTheme.storybook.canvas,
        ...overrides.storybook?.canvas,
      },
    },
  };
};

/**
 * Common test assertions for styled components
 *
 * Provides helper functions for frequently used style assertions
 * to reduce test boilerplate and improve consistency.
 */
export const styleAssertions = {
  /**
   * Asserts that an element has the expected background color
   *
   * @param element - DOM element to check
   * @param expectedColor - Expected CSS color value (rgb, hex, etc.)
   */
  expectBackgroundColor: (element: Element, expectedColor: string) => {
    const styles = window.getComputedStyle(element);
    expect(styles.backgroundColor).toBe(expectedColor);
  },

  /**
   * Asserts that an element has the expected text color
   *
   * @param element - DOM element to check
   * @param expectedColor - Expected CSS color value (rgb, hex, etc.)
   */
  expectTextColor: (element: Element, expectedColor: string) => {
    const styles = window.getComputedStyle(element);
    expect(styles.color).toBe(expectedColor);
  },

  /**
   * Asserts that an element has the expected dimensions
   *
   * @param element - DOM element to check
   * @param width - Expected width (e.g., '100px', '50%')
   * @param height - Expected height (e.g., '32px', 'auto')
   */
  expectDimensions: (element: Element, width: string, height: string) => {
    const styles = window.getComputedStyle(element);
    expect(styles.width).toBe(width);
    expect(styles.height).toBe(height);
  },

  /**
   * Asserts that an element has the expected border radius
   *
   * @param element - DOM element to check
   * @param expectedRadius - Expected border radius (e.g., '4px', '50%')
   */
  expectBorderRadius: (element: Element, expectedRadius: string) => {
    const styles = window.getComputedStyle(element);
    expect(styles.borderRadius).toBe(expectedRadius);
  },
};
