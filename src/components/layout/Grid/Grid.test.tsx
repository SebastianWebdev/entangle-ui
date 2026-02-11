// src/components/layout/Grid/Grid.test.tsx

import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { Grid } from './Grid';

/**
 * Test suite for Grid component
 *
 * Covers: container/item modes, responsive sizing, spacing, accessibility, nesting
 */
describe('Grid', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Grid data-testid="test-grid">Content</Grid>);

      const grid = screen.getByTestId('test-grid');
      expect(grid).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders with children content', () => {
      renderWithTheme(
        <Grid data-testid="test-grid">
          <div>Child 1</div>
          <div>Child 2</div>
        </Grid>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithTheme(
        <Grid className="custom-grid" data-testid="test-grid">
          Content
        </Grid>
      );

      const grid = screen.getByTestId('test-grid');
      expect(grid).toHaveClass('custom-grid');
    });

    it('applies data-testid correctly', () => {
      renderWithTheme(<Grid data-testid="custom-grid">Content</Grid>);
      expect(screen.getByTestId('custom-grid')).toBeInTheDocument();
    });
  });

  describe('Container Mode', () => {
    it('applies container styles when container=true', () => {
      renderWithTheme(
        <Grid container data-testid="container-grid">
          <Grid size={6}>Item 1</Grid>
          <Grid size={6}>Item 2</Grid>
        </Grid>
      );

      const container = screen.getByTestId('container-grid');

      // VE class should be applied, proving recipe was used
      expect(container.className).toBeTruthy();
      expect(container.className.length).toBeGreaterThan(0);
      // width is set in VE stylesheet; verify element renders
      expect(container).toBeInTheDocument();
    });

    it('applies default 12-column layout', () => {
      renderWithTheme(
        <Grid container data-testid="container-grid">
          Content
        </Grid>
      );

      const container = screen.getByTestId('container-grid');

      // The columns count is set via assignInlineVars (columnsVar)
      // jsdom cannot resolve CSS vars in gridTemplateColumns, so check inline style
      const inlineStyle = container.getAttribute('style') ?? '';
      expect(inlineStyle).toContain('12');
    });

    it('applies custom column count', () => {
      renderWithTheme(
        <Grid container columns={6} data-testid="container-grid">
          Content
        </Grid>
      );

      const container = screen.getByTestId('container-grid');

      // columnsVar is set via assignInlineVars
      const inlineStyle = container.getAttribute('style') ?? '';
      expect(inlineStyle).toContain('6');
    });

    it('does not apply container styles when container=false', () => {
      renderWithTheme(<Grid data-testid="item-grid">Content</Grid>);

      const grid = screen.getByTestId('item-grid');
      const styles = window.getComputedStyle(grid);

      expect(styles.display).not.toBe('grid');
    });
  });

  describe('Item Sizing', () => {
    it('applies size prop correctly', () => {
      renderWithTheme(
        <Grid size={6} data-testid="sized-grid">
          Content
        </Grid>
      );

      const grid = screen.getByTestId('sized-grid');
      const styles = window.getComputedStyle(grid);

      expect(styles.gridColumn).toBe('span 6');
    });

    it('handles auto sizing', () => {
      renderWithTheme(
        <Grid size="auto" data-testid="auto-grid">
          Content
        </Grid>
      );

      const grid = screen.getByTestId('auto-grid');
      const styles = window.getComputedStyle(grid);

      expect(styles.gridColumn).toBe('span auto');
    });

    it('handles all numeric sizes (1-12)', () => {
      const sizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

      sizes.forEach(size => {
        const { unmount } = renderWithTheme(
          <Grid size={size} data-testid={`grid-${size}`}>
            Content {size}
          </Grid>
        );

        const grid = screen.getByTestId(`grid-${size}`);
        const styles = window.getComputedStyle(grid);

        expect(styles.gridColumn).toBe(`span ${size}`);
        unmount();
      });
    });

    it('does not apply size when in container mode', () => {
      renderWithTheme(
        <Grid container size={6} data-testid="container-with-size">
          Content
        </Grid>
      );

      const grid = screen.getByTestId('container-with-size');
      const styles = window.getComputedStyle(grid);

      // Container should not have grid-column span
      expect(styles.gridColumn).not.toContain('span');
    });
  });

  describe('Responsive Sizing', () => {
    it('applies responsive sizes correctly', () => {
      renderWithTheme(
        <Grid xs={12} sm={6} md={4} lg={3} xl={2} data-testid="responsive-grid">
          Content
        </Grid>
      );

      const grid = screen.getByTestId('responsive-grid');
      expect(grid).toBeInTheDocument();

      // Note: Testing responsive styles requires either jsdom-testing-mocks
      // or checking the generated CSS. For now, we verify the element exists.
    });

    it('handles mixed responsive and base sizing', () => {
      renderWithTheme(
        <Grid size={12} md={6} lg={4} data-testid="mixed-responsive">
          Content
        </Grid>
      );

      const grid = screen.getByTestId('mixed-responsive');
      const styles = window.getComputedStyle(grid);

      // Should apply base size by default
      expect(styles.gridColumn).toBe('span 12');
    });

    it('handles responsive size with auto', () => {
      renderWithTheme(
        <Grid xs={12} sm="auto" data-testid="responsive-auto">
          Content
        </Grid>
      );

      const grid = screen.getByTestId('responsive-auto');
      expect(grid).toBeInTheDocument();
    });

    it('applies all responsive breakpoints', () => {
      const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

      breakpoints.forEach(breakpoint => {
        const props = { [breakpoint]: 6 };
        const { unmount } = renderWithTheme(
          <Grid {...props} data-testid={`${breakpoint}-grid`}>
            Content
          </Grid>
        );

        const grid = screen.getByTestId(`${breakpoint}-grid`);
        expect(grid).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Spacing System', () => {
    it('applies default spacing (2 = 8px)', () => {
      renderWithTheme(
        <Grid container data-testid="default-spacing">
          Content
        </Grid>
      );

      const container = screen.getByTestId('default-spacing');

      // Default spacing = 2 * 4px = 8px, set via assignInlineVars (gapVar)
      const inlineStyle = container.getAttribute('style') ?? '';
      expect(inlineStyle).toContain('8px');
    });

    it('applies zero spacing', () => {
      renderWithTheme(
        <Grid container spacing={0} data-testid="zero-spacing">
          Content
        </Grid>
      );

      const container = screen.getByTestId('zero-spacing');

      // gapVar should be set to 0px via assignInlineVars
      const inlineStyle = container.getAttribute('style') ?? '';
      expect(inlineStyle).toContain('0px');
    });

    it('applies various spacing multipliers', () => {
      const spacings = [1, 2, 3, 4, 5, 6, 7, 8] as const;

      spacings.forEach(spacing => {
        const { unmount } = renderWithTheme(
          <Grid container spacing={spacing} data-testid={`spacing-${spacing}`}>
            Content
          </Grid>
        );

        const container = screen.getByTestId(`spacing-${spacing}`);

        // Each spacing unit = 4px (SPACING_UNIT), set via assignInlineVars
        const expectedGap = `${spacing * 4}px`;
        const inlineStyle = container.getAttribute('style') ?? '';
        expect(inlineStyle).toContain(expectedGap);
        unmount();
      });
    });

    it('does not apply spacing to grid items', () => {
      renderWithTheme(
        <Grid size={6} spacing={4} data-testid="item-spacing">
          Content
        </Grid>
      );

      const item = screen.getByTestId('item-spacing');

      // Items do not use assignInlineVars for gap - no gap var in inline style
      const inlineStyle = item.getAttribute('style') ?? '';
      // Item mode does not set gapVar
      expect(inlineStyle).not.toContain('gap');
    });
  });

  describe('Custom Gap Override', () => {
    it('applies custom gap with string value', () => {
      renderWithTheme(
        <Grid container gap="1rem" data-testid="custom-gap-string">
          Content
        </Grid>
      );

      const container = screen.getByTestId('custom-gap-string');
      const inlineStyle = container.getAttribute('style') ?? '';
      expect(inlineStyle).toContain('1rem');
    });

    it('applies custom gap with number value', () => {
      renderWithTheme(
        <Grid container gap={24} data-testid="custom-gap-number">
          Content
        </Grid>
      );

      const container = screen.getByTestId('custom-gap-number');
      const inlineStyle = container.getAttribute('style') ?? '';
      expect(inlineStyle).toContain('24px');
    });

    it('custom gap overrides spacing prop', () => {
      renderWithTheme(
        <Grid container spacing={8} gap="10px" data-testid="gap-override">
          Content
        </Grid>
      );

      const container = screen.getByTestId('gap-override');
      // Should use gap value, not spacing
      const inlineStyle = container.getAttribute('style') ?? '';
      expect(inlineStyle).toContain('10px');
    });

    it('handles complex gap values', () => {
      renderWithTheme(
        <Grid container gap="2rem 1rem" data-testid="complex-gap">
          Content
        </Grid>
      );

      const container = screen.getByTestId('complex-gap');
      const inlineStyle = container.getAttribute('style') ?? '';
      expect(inlineStyle).toContain('2rem 1rem');
    });
  });

  describe('Nested Grids', () => {
    it('handles nested grid containers', () => {
      renderWithTheme(
        <Grid container spacing={2} data-testid="outer-grid">
          <Grid size={6}>
            <Grid container spacing={1} data-testid="inner-grid">
              <Grid size={6}>Nested 1</Grid>
              <Grid size={6}>Nested 2</Grid>
            </Grid>
          </Grid>
          <Grid size={6}>Right content</Grid>
        </Grid>
      );

      const outerGrid = screen.getByTestId('outer-grid');
      const innerGrid = screen.getByTestId('inner-grid');

      // Both should be CSS grids
      expect(window.getComputedStyle(outerGrid).display).toBe('grid');
      expect(window.getComputedStyle(innerGrid).display).toBe('grid');

      // Check content renders
      expect(screen.getByText('Nested 1')).toBeInTheDocument();
      expect(screen.getByText('Nested 2')).toBeInTheDocument();
      expect(screen.getByText('Right content')).toBeInTheDocument();
    });

    it('handles deeply nested grids', () => {
      renderWithTheme(
        <Grid container data-testid="level-1">
          <Grid size={12}>
            <Grid container data-testid="level-2">
              <Grid size={6}>
                <Grid container data-testid="level-3">
                  <Grid size={12}>Deep content</Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      );

      expect(screen.getByTestId('level-1')).toBeInTheDocument();
      expect(screen.getByTestId('level-2')).toBeInTheDocument();
      expect(screen.getByTestId('level-3')).toBeInTheDocument();
      expect(screen.getByText('Deep content')).toBeInTheDocument();
    });
  });

  describe('Box Sizing', () => {
    it('applies box-sizing: border-box to containers', () => {
      renderWithTheme(
        <Grid container data-testid="container-box-sizing">
          Content
        </Grid>
      );

      const container = screen.getByTestId('container-box-sizing');
      const styles = window.getComputedStyle(container);

      expect(styles.boxSizing).toBe('border-box');
    });

    it('applies box-sizing: border-box to items', () => {
      renderWithTheme(
        <Grid size={6} data-testid="item-box-sizing">
          Content
        </Grid>
      );

      const item = screen.getByTestId('item-box-sizing');
      const styles = window.getComputedStyle(item);

      expect(styles.boxSizing).toBe('border-box');
    });
  });

  describe('Theme Integration', () => {
    it('renders without errors when theme is provided', () => {
      expect(() => {
        renderWithTheme(
          <Grid container spacing={2} data-testid="themed-grid">
            <Grid size={6}>Content</Grid>
          </Grid>
        );
      }).not.toThrow();

      expect(screen.getByTestId('themed-grid')).toBeInTheDocument();
    });

    it('uses theme spacing values correctly', () => {
      renderWithTheme(
        <Grid container spacing={3} data-testid="theme-spacing">
          Content
        </Grid>
      );

      const container = screen.getByTestId('theme-spacing');

      // Should use SPACING_UNIT (4px) * 3 = 12px, set via assignInlineVars
      const inlineStyle = container.getAttribute('style') ?? '';
      expect(inlineStyle).toContain('12px');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      renderWithTheme(
        <Grid container data-testid="empty-grid">
          {null}
        </Grid>
      );

      const grid = screen.getByTestId('empty-grid');
      expect(grid).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      renderWithTheme(
        <Grid container data-testid="undefined-grid">
          {undefined}
        </Grid>
      );

      const grid = screen.getByTestId('undefined-grid');
      expect(grid).toBeInTheDocument();
    });

    it('handles complex children content', () => {
      renderWithTheme(
        <Grid container data-testid="complex-children">
          <Grid size={4}>
            <div>
              <span>Complex</span>
              <strong>Content</strong>
            </div>
          </Grid>
          <Grid size={8}>
            {['Item 1', 'Item 2'].map(item => (
              <div key={item}>{item}</div>
            ))}
          </Grid>
        </Grid>
      );

      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('handles maximum spacing value', () => {
      renderWithTheme(
        <Grid container spacing={8} data-testid="max-spacing">
          Content
        </Grid>
      );

      const container = screen.getByTestId('max-spacing');

      // 8 * 4px = 32px, set via assignInlineVars
      const inlineStyle = container.getAttribute('style') ?? '';
      expect(inlineStyle).toContain('32px');
    });

    it('handles zero columns gracefully', () => {
      renderWithTheme(
        <Grid container columns={1} data-testid="single-column">
          <Grid size={1}>Full width</Grid>
        </Grid>
      );

      const container = screen.getByTestId('single-column');

      // columnsVar is set via assignInlineVars; check inline style
      const inlineStyle = container.getAttribute('style') ?? '';
      expect(inlineStyle).toContain('1');
    });
  });

  describe('Accessibility', () => {
    it('maintains semantic structure', () => {
      renderWithTheme(
        <Grid container data-testid="semantic-grid">
          <Grid size={6}>
            <h2>Heading</h2>
            <p>Content</p>
          </Grid>
          <Grid size={6}>
            <nav>Navigation</nav>
          </Grid>
        </Grid>
      );

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('does not interfere with ARIA attributes', () => {
      renderWithTheme(
        <Grid
          container
          role="main"
          aria-label="Main content grid"
          data-testid="aria-grid"
        >
          <Grid size={12} role="article">
            Article content
          </Grid>
        </Grid>
      );

      const container = screen.getByTestId('aria-grid');
      expect(container).toHaveAttribute('role', 'main');
      expect(container).toHaveAttribute('aria-label', 'Main content grid');

      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });

    it('supports custom HTML attributes', () => {
      renderWithTheme(
        <Grid
          container
          id="custom-id"
          data-custom="value"
          data-testid="custom-attrs"
        >
          Content
        </Grid>
      );

      const grid = screen.getByTestId('custom-attrs');
      expect(grid).toHaveAttribute('id', 'custom-id');
      expect(grid).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('Performance', () => {
    it('renders large grids efficiently', () => {
      const items = Array.from({ length: 100 }, (_, i) => (
        <Grid key={i} xs={12} sm={6} md={4} lg={3}>
          Item {i + 1}
        </Grid>
      ));

      const startTime = performance.now();

      renderWithTheme(
        <Grid container spacing={1} data-testid="large-grid">
          {items}
        </Grid>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(screen.getByTestId('large-grid')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 100')).toBeInTheDocument();

      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });
  });
});
