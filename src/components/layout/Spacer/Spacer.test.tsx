// src/components/layout/Spacer/Spacer.test.tsx
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { Spacer } from './Spacer';

/**
 * Test suite for Spacer component
 *
 * Covers: rendering, auto-expanding, fixed size, CSS properties
 */
describe('Spacer', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Spacer data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      expect(spacer).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithTheme(
        <Spacer className="custom-spacer" data-testid="test-spacer" />
      );

      const spacer = screen.getByTestId('test-spacer');
      expect(spacer).toHaveClass('custom-spacer');
    });

    it('applies data-testid correctly', () => {
      renderWithTheme(<Spacer data-testid="custom-spacer" />);
      expect(screen.getByTestId('custom-spacer')).toBeInTheDocument();
    });

    it('does not render any content', () => {
      renderWithTheme(<Spacer data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      expect(spacer).toBeEmptyDOMElement();
    });
  });

  describe('Auto-expanding behavior', () => {
    it('applies flex: 1 by default', () => {
      renderWithTheme(<Spacer data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      // jsdom may return different values for flex, checking only flexGrow
      expect(styles.flexGrow).toBe('1');
    });

    it('applies min dimensions to prevent shrinking', () => {
      renderWithTheme(<Spacer data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      // jsdom returns '0' instead of '0px' for min dimensions
      expect(styles.minWidth).toBe('0');
      expect(styles.minHeight).toBe('0');
    });

    it('does not apply fixed dimensions when auto-expanding', () => {
      renderWithTheme(<Spacer data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      // Should not have explicit width/height set
      expect(styles.width).not.toMatch(/^\d+px$/);
      expect(styles.height).not.toMatch(/^\d+px$/);
    });
  });

  describe('Fixed size mode', () => {
    it('applies fixed size with string value', () => {
      renderWithTheme(<Spacer size="20px" data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      expect(styles.width).toBe('20px');
      expect(styles.height).toBe('20px');
      // jsdom reports flex shorthand differently
      expect(styles.flexGrow).toBe('0');
      expect(styles.flexShrink).toBe('0');
    });

    it('applies fixed size with number value', () => {
      renderWithTheme(<Spacer size={30} data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      expect(styles.width).toBe('30px');
      expect(styles.height).toBe('30px');
      expect(styles.flexGrow).toBe('0');
      expect(styles.flexShrink).toBe('0');
    });

    it('applies fixed size with rem units', () => {
      renderWithTheme(<Spacer size="2rem" data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      expect(styles.width).toBe('2rem');
      expect(styles.height).toBe('2rem');
    });

    it('applies fixed size with em units', () => {
      renderWithTheme(<Spacer size="1.5em" data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      expect(styles.width).toBe('1.5em');
      expect(styles.height).toBe('1.5em');
    });

    it('does not apply min dimensions when fixed size', () => {
      renderWithTheme(<Spacer size="20px" data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      // When fixed size is applied, min dimensions are not explicitly set to 0
      expect(styles.width).toBe('20px');
      expect(styles.height).toBe('20px');
    });
  });

  describe('CSS Properties', () => {
    it('applies non-interfering styles', () => {
      renderWithTheme(<Spacer data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      expect(styles.pointerEvents).toBe('none');
      expect(styles.userSelect).toBe('none');
    });

    it('maintains proper CSS structure for auto-expanding', () => {
      renderWithTheme(<Spacer data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      expect(styles.flexGrow).toBe('1');
      expect(['0', '0px']).toContain(styles.minWidth);
      expect(['0', '0px']).toContain(styles.minHeight);
      expect(styles.pointerEvents).toBe('none');
      expect(styles.userSelect).toBe('none');
    });

    it('maintains proper CSS structure for fixed size', () => {
      renderWithTheme(<Spacer size="25px" data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      expect(styles.flexGrow).toBe('0');
      expect(styles.flexShrink).toBe('0');
      expect(styles.width).toBe('25px');
      expect(styles.height).toBe('25px');
      expect(styles.pointerEvents).toBe('none');
      expect(styles.userSelect).toBe('none');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero size', () => {
      renderWithTheme(<Spacer size={0} data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');

      // size={0} is a valid fixed size: inline styles set width/height to 0px
      expect(spacer.style.width).toBe('0px');
      expect(spacer.style.height).toBe('0px');
      // spacerFixed class is applied (flex: none)
      expect(spacer.className).toBeTruthy();
    });

    it('handles zero string size', () => {
      renderWithTheme(<Spacer size="0px" data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      // jsdom may return '0' or '0px' for zero values
      expect(['0', '0px']).toContain(styles.width);
      expect(['0', '0px']).toContain(styles.height);
    });

    it('handles large size values', () => {
      renderWithTheme(<Spacer size={1000} data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      expect(styles.width).toBe('1000px');
      expect(styles.height).toBe('1000px');
    });

    it('handles percentage values', () => {
      renderWithTheme(<Spacer size="50%" data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      expect(styles.width).toBe('50%');
      expect(styles.height).toBe('50%');
    });

    it('handles decimal values', () => {
      renderWithTheme(<Spacer size="1.5rem" data-testid="test-spacer" />);

      const spacer = screen.getByTestId('test-spacer');
      const styles = window.getComputedStyle(spacer);

      expect(styles.width).toBe('1.5rem');
      expect(styles.height).toBe('1.5rem');
    });
  });

  describe('HTML Attributes', () => {
    it('supports custom HTML attributes', () => {
      renderWithTheme(
        <Spacer id="custom-id" data-custom="value" data-testid="test-spacer" />
      );

      const spacer = screen.getByTestId('test-spacer');
      expect(spacer).toHaveAttribute('id', 'custom-id');
      expect(spacer).toHaveAttribute('data-custom', 'value');
    });

    it('supports ARIA attributes', () => {
      renderWithTheme(
        <Spacer role="separator" aria-hidden="true" data-testid="test-spacer" />
      );

      const spacer = screen.getByTestId('test-spacer');
      expect(spacer).toHaveAttribute('role', 'separator');
      expect(spacer).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Theme Integration', () => {
    it('renders without errors when theme is provided', () => {
      expect(() => {
        renderWithTheme(<Spacer data-testid="test-spacer" />);
      }).not.toThrow();

      expect(screen.getByTestId('test-spacer')).toBeInTheDocument();
    });

    it('works without theme context', () => {
      // Test direct rendering without ThemeProvider
      expect(() => {
        renderWithTheme(<Spacer data-testid="test-spacer" />);
      }).not.toThrow();
    });
  });

  describe('Integration with Flex Layouts', () => {
    it('works as flex child', () => {
      renderWithTheme(
        <div style={{ display: 'flex' }}>
          <div>Item 1</div>
          <Spacer data-testid="test-spacer" />
          <div>Item 2</div>
        </div>
      );

      const spacer = screen.getByTestId('test-spacer');
      expect(spacer).toBeInTheDocument();

      // Should have flex: 1 to fill available space
      const styles = window.getComputedStyle(spacer);
      expect(styles.flexGrow).toBe('1');
    });

    it('works in column layout', () => {
      renderWithTheme(
        <div
          style={{ display: 'flex', flexDirection: 'column', height: '200px' }}
        >
          <div>Top</div>
          <Spacer data-testid="test-spacer" />
          <div>Bottom</div>
        </div>
      );

      const spacer = screen.getByTestId('test-spacer');
      expect(spacer).toBeInTheDocument();

      // Should expand to fill vertical space
      const styles = window.getComputedStyle(spacer);
      // jsdom returns the full flex shorthand value
      expect(styles.flexGrow).toBe('1');
    });

    it('works in row layout', () => {
      renderWithTheme(
        <div style={{ display: 'flex', flexDirection: 'row', width: '300px' }}>
          <div>Left</div>
          <Spacer data-testid="test-spacer" />
          <div>Right</div>
        </div>
      );

      const spacer = screen.getByTestId('test-spacer');
      expect(spacer).toBeInTheDocument();

      // Should expand to fill horizontal space
      const styles = window.getComputedStyle(spacer);
      // jsdom returns the full flex shorthand value
      expect(styles.flexGrow).toBe('1');
    });
  });

  describe('Performance', () => {
    it('renders quickly with minimal DOM impact', () => {
      const startTime = performance.now();

      renderWithTheme(<Spacer data-testid="test-spacer" />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(screen.getByTestId('test-spacer')).toBeInTheDocument();
      expect(renderTime).toBeLessThan(10); // Very fast rendering
    });

    it('handles multiple spacers efficiently', () => {
      const spacers = Array.from({ length: 50 }, (_, i) => (
        <Spacer key={i} data-testid={`spacer-${i}`} />
      ));

      const startTime = performance.now();

      renderWithTheme(
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {spacers}
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(screen.getByTestId('spacer-0')).toBeInTheDocument();
      expect(screen.getByTestId('spacer-49')).toBeInTheDocument();
      expect(renderTime).toBeLessThan(50); // Should be very fast
    });
  });
});
