// src/tests/test-utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { expect } from 'vitest';

// Import dark theme to register VE CSS custom properties on :root
// This enables components to resolve CSS vars in tests
import '@/theme/darkTheme.css';

/**
 * Test wrapper component.
 *
 * With Vanilla Extract, themes are applied via CSS custom properties on :root.
 * This wrapper exists for compatibility — it simply renders children.
 */
interface TestWrapperProps {
  children: React.ReactNode;
}

export const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => (
  <>{children}</>
);

/**
 * Custom render function with theme context.
 *
 * Renders components with the dark theme CSS custom properties available.
 * Use this instead of the default render function from @testing-library/react.
 *
 * @param ui - React element to render
 * @param options - Render options
 * @returns Render result
 *
 * @example
 * ```tsx
 * // Basic usage
 * renderWithTheme(<Button>Test</Button>);
 *
 * // With additional render options
 * renderWithTheme(<Button>Test</Button>, {
 *   container: document.body
 * });
 * ```
 */
export const renderWithTheme = (
  ui: React.ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestWrapper>{children}</TestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Common test assertions for styled components.
 *
 * Provides helper functions for frequently used style assertions
 * to reduce test boilerplate and improve consistency.
 */
export const styleAssertions = {
  /**
   * Asserts that an element has the expected background color
   */
  expectBackgroundColor: (element: Element, expectedColor: string) => {
    const styles = window.getComputedStyle(element);
    expect(styles.backgroundColor).toBe(expectedColor);
  },

  /**
   * Asserts that an element has the expected text color
   */
  expectTextColor: (element: Element, expectedColor: string) => {
    const styles = window.getComputedStyle(element);
    expect(styles.color).toBe(expectedColor);
  },

  /**
   * Asserts that an element has the expected dimensions
   */
  expectDimensions: (element: Element, width: string, height: string) => {
    const styles = window.getComputedStyle(element);
    expect(styles.width).toBe(width);
    expect(styles.height).toBe(height);
  },

  /**
   * Asserts that an element has the expected border radius
   */
  expectBorderRadius: (element: Element, expectedRadius: string) => {
    const styles = window.getComputedStyle(element);
    expect(styles.borderRadius).toBe(expectedRadius);
  },
};
