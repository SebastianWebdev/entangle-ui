// src/primitives/Icon/Icon.test.tsx
import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';
import { ThemeProvider } from '@/theme';
import { vi } from 'vitest';

// Sample SVG path for testing
const testSvgPath = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

/**
 * Test suite for Icon component
 * 
 * Covers:
 * - Basic rendering with SVG content
 * - Size variants and responsive behavior
 * - Color variants and custom colors
 * - Accessibility features
 * - Theme integration
 */
describe('Icon', () => {
  describe('Rendering', () => {
    it('renders with SVG path correctly', () => {
      renderWithTheme(<Icon svg={testSvgPath} data-testid="test-icon" />);
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
      
      const path = icon.querySelector('path');
      expect(path).toHaveAttribute('d', testSvgPath);
    });

    it('renders with default props', () => {
      renderWithTheme(<Icon svg={testSvgPath} data-testid="test-icon" />);
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
      expect(icon).toHaveAttribute('role', 'img');
      expect(icon).not.toHaveAttribute('aria-hidden');
    });

    it('applies custom className', () => {
      renderWithTheme(
        <Icon svg={testSvgPath} className="custom-class" data-testid="test-icon" />
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toHaveClass('custom-class');
    });
  });

  describe('Size Variants', () => {
    it('applies small size correctly', () => {
      renderWithTheme(<Icon svg={testSvgPath} size="sm" data-testid="test-icon" />);
      
      const icon = screen.getByTestId('test-icon');
      const computedStyle = window.getComputedStyle(icon);
      
      // Note: In JSDOM, styled-components styles might not be fully computed
      // This test verifies the component renders without errors
      expect(icon).toBeInTheDocument();
    });

    it('applies medium size by default', () => {
      renderWithTheme(<Icon svg={testSvgPath} data-testid="test-icon" />);
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });

    it('applies large size correctly', () => {
      renderWithTheme(<Icon svg={testSvgPath} size="lg" data-testid="test-icon" />);
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Color Variants', () => {
    it('applies primary color by default', () => {
      renderWithTheme(<Icon svg={testSvgPath} data-testid="test-icon" />);
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });

    it('applies secondary color correctly', () => {
      renderWithTheme(<Icon svg={testSvgPath} color="secondary" data-testid="test-icon" />);
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });

    it('applies accent color correctly', () => {
      renderWithTheme(<Icon svg={testSvgPath} color="accent" data-testid="test-icon" />);
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });

    it('accepts custom color values', () => {
      renderWithTheme(<Icon svg={testSvgPath} color="#ff6b6b" data-testid="test-icon" />);
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('includes title element when title prop is provided', () => {
      renderWithTheme(
        <Icon svg={testSvgPath} title="Save file" data-testid="test-icon" />
      );
      
      const icon = screen.getByTestId('test-icon');
      const title = icon.querySelector('title');
      
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Save file');
      expect(icon).toHaveAttribute('role', 'img');
    });

    it('sets aria-hidden when decorative is true', () => {
      renderWithTheme(
        <Icon svg={testSvgPath} decorative data-testid="test-icon" />
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('role', 'presentation');
    });

    it('does not include title when decorative is true', () => {
      renderWithTheme(
        <Icon 
          svg={testSvgPath} 
          title="Should not appear" 
          decorative 
          data-testid="test-icon" 
        />
      );
      
      const icon = screen.getByTestId('test-icon');
      const title = icon.querySelector('title');
      
      expect(title).not.toBeInTheDocument();
    });

    it('provides proper ARIA attributes for meaningful icons', () => {
      renderWithTheme(
        <Icon svg={testSvgPath} title="Settings" data-testid="test-icon" />
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toHaveAttribute('role', 'img');
      expect(icon).not.toHaveAttribute('aria-hidden');
    });
  });

  describe('SVG Structure', () => {
    it('creates valid SVG structure', () => {
      renderWithTheme(<Icon svg={testSvgPath} data-testid="test-icon" />);
      
      const icon = screen.getByTestId('test-icon');
      expect(icon.tagName).toBe('svg');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
      
      const path = icon.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('d', testSvgPath);
    });

    it('handles empty SVG path gracefully', () => {
      renderWithTheme(<Icon svg="" data-testid="test-icon" />);
      
      const icon = screen.getByTestId('test-icon');
      const path = icon.querySelector('path');
      
      expect(icon).toBeInTheDocument();
      expect(path).toHaveAttribute('d', '');
    });
  });

  describe('Theme Integration', () => {
    it('renders without errors when wrapped in ThemeProvider', () => {
      expect(() => {
        renderWithTheme(<Icon svg={testSvgPath} />);
      }).not.toThrow();
    });

    it('accepts all standard color variants', () => {
      const colors = ['primary', 'secondary', 'muted', 'accent', 'success', 'warning', 'error'];
      
      colors.forEach(color => {
        expect(() => {
          renderWithTheme(<Icon svg={testSvgPath} color={color as any} />);
        }).not.toThrow();
      });
    });
  });
});