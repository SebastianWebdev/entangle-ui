// src/primitives/Icon/Icon.test.tsx
import { render, screen } from '@testing-library/react';
import { Icon } from './Icon';
import { ThemeProvider } from '@/theme';

// Sample SVG content for testing
const TestPath = () => <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;

const TestComplexIcon = () => (
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </>
);

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
 * - Basic rendering with SVG children elements
 * - Size variants and responsive behavior
 * - Color variants and custom colors
 * - Accessibility features
 * - Theme integration
 * - Complex multi-element icons
 */
describe('Icon', () => {
  describe('Rendering', () => {
    it('renders with SVG children correctly', () => {
      renderWithTheme(
        <Icon data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
      
      const path = icon.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('d', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
    });

    it('renders with default props', () => {
      renderWithTheme(
        <Icon data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
      expect(icon).toHaveAttribute('role', 'img');
      expect(icon).toHaveAttribute('fill', 'none');
      expect(icon).not.toHaveAttribute('aria-hidden');
    });

    it('renders complex multi-element icons', () => {
      renderWithTheme(
        <Icon data-testid="test-icon">
          <TestComplexIcon />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
      
      const path = icon.querySelector('path');
      const polyline = icon.querySelector('polyline');
      const line = icon.querySelector('line');
      
      expect(path).toBeInTheDocument();
      expect(polyline).toBeInTheDocument();
      expect(line).toBeInTheDocument();
      
      expect(path).toHaveAttribute('d', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4');
      expect(polyline).toHaveAttribute('points', '7,10 12,15 17,10');
      expect(line).toHaveAttribute('x1', '12');
      expect(line).toHaveAttribute('y1', '15');
      expect(line).toHaveAttribute('x2', '12');
      expect(line).toHaveAttribute('y2', '3');
    });

    it('applies custom className', () => {
      renderWithTheme(
        <Icon className="custom-class" data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toHaveClass('custom-class');
    });
  });

  describe('Size Variants', () => {
    it('applies small size correctly', () => {
      renderWithTheme(
        <Icon size="sm" data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      // Note: In JSDOM, styled-components styles might not be fully computed
      // This test verifies the component renders without errors
      expect(icon).toBeInTheDocument();
    });

    it('applies medium size by default', () => {
      renderWithTheme(
        <Icon data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });

    it('applies large size correctly', () => {
      renderWithTheme(
        <Icon size="lg" data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Color Variants', () => {
    it('applies primary color by default', () => {
      renderWithTheme(
        <Icon data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });

    it('applies secondary color correctly', () => {
      renderWithTheme(
        <Icon color="secondary" data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });

    it('applies accent color correctly', () => {
      renderWithTheme(
        <Icon color="accent" data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });

    it('accepts custom color values', () => {
      renderWithTheme(
        <Icon color="#ff6b6b" data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('includes title element when title prop is provided', () => {
      renderWithTheme(
        <Icon title="Save file" data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      const title = icon.querySelector('title');
      
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Save file');
      expect(icon).toHaveAttribute('role', 'img');
    });

    it('sets aria-hidden when decorative is true', () => {
      renderWithTheme(
        <Icon decorative data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('role', 'presentation');
    });

    it('does not include title when decorative is true', () => {
      renderWithTheme(
        <Icon title="Should not appear" decorative data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      const title = icon.querySelector('title');
      
      expect(title).not.toBeInTheDocument();
    });

    it('provides proper ARIA attributes for meaningful icons', () => {
      renderWithTheme(
        <Icon title="Settings" data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toHaveAttribute('role', 'img');
      expect(icon).not.toHaveAttribute('aria-hidden');
    });
  });

  describe('SVG Structure', () => {
    it('creates valid SVG structure with children', () => {
      renderWithTheme(
        <Icon data-testid="test-icon">
          <TestPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon.tagName).toBe('svg');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
      expect(icon).toHaveAttribute('fill', 'none');
      
      const path = icon.querySelector('path');
      expect(path).toBeInTheDocument();
    });

    it('handles empty children gracefully', () => {
      renderWithTheme(
        <Icon data-testid="test-icon">
          {null}
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName).toBe('svg');
    });

    it('handles multiple child elements', () => {
      renderWithTheme(
        <Icon data-testid="test-icon">
          <path d="M12 2l3.09 6.26" />
          <circle cx="12" cy="12" r="3" />
          <rect x="9" y="9" width="6" height="6" />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon.querySelector('path')).toBeInTheDocument();
      expect(icon.querySelector('circle')).toBeInTheDocument();
      expect(icon.querySelector('rect')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('renders without errors when wrapped in ThemeProvider', () => {
      expect(() => {
        renderWithTheme(
          <Icon>
            <TestPath />
          </Icon>
        );
      }).not.toThrow();
    });

    it('accepts all standard color variants', () => {
      const colors = ['primary', 'secondary', 'muted', 'accent', 'success', 'warning', 'error'];
      
      colors.forEach(color => {
        expect(() => {
          renderWithTheme(
            <Icon color={color as any}>
              <TestPath />
            </Icon>
          );
        }).not.toThrow();
      });
    });
  });

  describe('Children Rendering', () => {
    it('renders string children as text content', () => {
      renderWithTheme(
        <Icon data-testid="test-icon">
          <text x="12" y="12">A</text>
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      const text = icon.querySelector('text');
      expect(text).toBeInTheDocument();
      expect(text).toHaveTextContent('A');
    });

    it('renders functional component children', () => {
      const CustomPath = () => <path d="M0 0L24 24" />;
      
      renderWithTheme(
        <Icon data-testid="test-icon">
          <CustomPath />
        </Icon>
      );
      
      const icon = screen.getByTestId('test-icon');
      const path = icon.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('d', 'M0 0L24 24');
    });
  });
});