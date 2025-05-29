// src/components/layout/Stack/Stack.test.tsx
import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme, styleAssertions } from '@/tests/test-utils';
import { Stack } from './Stack';

/**
 * Test suite for Stack component
 * 
 * Covers: rendering, direction, spacing, alignment, expand behavior, responsive, wrap
 */
describe('Stack', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Stack data-testid="test-stack">Content</Stack>);
      
      const stack = screen.getByTestId('test-stack');
      expect(stack).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders with children content', () => {
      renderWithTheme(
        <Stack data-testid="test-stack">
          <div>Child 1</div>
          <div>Child 2</div>
        </Stack>
      );
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithTheme(
        <Stack className="custom-stack" data-testid="test-stack">
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      expect(stack).toHaveClass('custom-stack');
    });

    it('applies data-testid correctly', () => {
      renderWithTheme(<Stack data-testid="custom-stack">Content</Stack>);
      expect(screen.getByTestId('custom-stack')).toBeInTheDocument();
    });
  });

  describe('Direction Control', () => {
    it('applies column direction by default', () => {
      renderWithTheme(<Stack data-testid="test-stack">Content</Stack>);
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
    });

    it('applies row direction when specified', () => {
      renderWithTheme(
        <Stack direction="row" data-testid="test-stack">Content</Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.flexDirection).toBe('row');
    });

    it('applies column direction when explicitly set', () => {
      renderWithTheme(
        <Stack direction="column" data-testid="test-stack">Content</Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.flexDirection).toBe('column');
    });
  });

  describe('Expand Behavior', () => {
    it('does not expand by default', () => {
      renderWithTheme(<Stack data-testid="test-stack">Content</Stack>);
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.width).not.toBe('100%');
      expect(styles.height).not.toBe('100%');
    });

    it('expands width when direction is row and expand is true', () => {
      renderWithTheme(
        <Stack direction="row" expand data-testid="test-stack">
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.width).toBe('100%');
    });

    it('expands height when direction is column and expand is true', () => {
      renderWithTheme(
        <Stack direction="column" expand data-testid="test-stack">
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.height).toBe('100%');
    });

    it('does not expand when expand is false', () => {
      renderWithTheme(
        <Stack direction="row" expand={false} data-testid="test-stack">
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.width).not.toBe('100%');
    });
  });

  describe('Spacing System', () => {
    it('applies no gap by default', () => {
      renderWithTheme(<Stack data-testid="test-stack">Content</Stack>);
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.gap).toBe('0px');
    });

    it('applies spacing based on theme multiplier', () => {
      const spacingValues = [1, 2, 3, 4, 5, 6, 7, 8] as const;
      
      spacingValues.forEach(spacing => {
        const { unmount } = renderWithTheme(
          <Stack spacing={spacing} data-testid={`stack-${spacing}`}>
            Content
          </Stack>
        );
        
        const stack = screen.getByTestId(`stack-${spacing}`);
        const styles = window.getComputedStyle(stack);
        
        // Each spacing unit = 4px (theme.spacing.sm)
        const expectedGap = `${spacing * 4}px`;
        expect(styles.gap).toBe(expectedGap);
        
        unmount();
      });
    });

    it('applies custom gap override', () => {
      renderWithTheme(
        <Stack customGap="24px" data-testid="test-stack">
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.gap).toBe('24px');
    });

    it('custom gap overrides spacing prop', () => {
      renderWithTheme(
        <Stack spacing={4} customGap="10px" data-testid="test-stack">
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.gap).toBe('10px');
    });

    it('handles numeric custom gap', () => {
      renderWithTheme(
        <Stack customGap={20} data-testid="test-stack">
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.gap).toBe('20px');
    });

    it('handles complex gap values', () => {
      renderWithTheme(
        <Stack customGap="1rem 0.5rem" data-testid="test-stack">
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.gap).toBe('1rem 0.5rem');
    });
  });

  describe('Justify Content', () => {
    it('applies flex-start justify by default', () => {
      renderWithTheme(<Stack data-testid="test-stack">Content</Stack>);
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.justifyContent).toBe('flex-start');
    });

    it('applies all justify content options', () => {
      const justifyOptions = [
        'flex-start', 'flex-end', 'center', 
        'space-between', 'space-around', 'space-evenly'
      ] as const;
      
      justifyOptions.forEach(justify => {
        const { unmount } = renderWithTheme(
          <Stack justify={justify} data-testid={`stack-${justify}`}>
            Content
          </Stack>
        );
        
        const stack = screen.getByTestId(`stack-${justify}`);
        const styles = window.getComputedStyle(stack);
        
        expect(styles.justifyContent).toBe(justify);
        
        unmount();
      });
    });
  });

  describe('Align Items', () => {
    it('applies flex-start align by default', () => {
      renderWithTheme(<Stack data-testid="test-stack">Content</Stack>);
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.alignItems).toBe('flex-start');
    });

    it('applies all align items options', () => {
      const alignOptions = [
        'flex-start', 'flex-end', 'center', 'stretch', 'baseline'
      ] as const;
      
      alignOptions.forEach(align => {
        const { unmount } = renderWithTheme(
          <Stack align={align} data-testid={`stack-${align}`}>
            Content
          </Stack>
        );
        
        const stack = screen.getByTestId(`stack-${align}`);
        const styles = window.getComputedStyle(stack);
        
        expect(styles.alignItems).toBe(align);
        
        unmount();
      });
    });
  });

  describe('Wrap Behavior', () => {
    it('applies nowrap by default', () => {
      renderWithTheme(<Stack data-testid="test-stack">Content</Stack>);
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.flexWrap).toBe('nowrap');
    });

    it('applies all wrap options', () => {
      const wrapOptions = ['nowrap', 'wrap', 'wrap-reverse'] as const;
      
      wrapOptions.forEach(wrap => {
        const { unmount } = renderWithTheme(
          <Stack wrap={wrap} data-testid={`stack-${wrap}`}>
            Content
          </Stack>
        );
        
        const stack = screen.getByTestId(`stack-${wrap}`);
        const styles = window.getComputedStyle(stack);
        
        expect(styles.flexWrap).toBe(wrap);
        
        unmount();
      });
    });
  });

  describe('Responsive Direction', () => {
    it('applies responsive breakpoints', () => {
      renderWithTheme(
        <Stack 
          direction="column"
          sm="row"
          md="column"
          lg="row"
          xl="column"
          data-testid="test-stack"
        >
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      expect(stack).toBeInTheDocument();
      
      // Base direction
      const styles = window.getComputedStyle(stack);
      expect(styles.flexDirection).toBe('column');
      
      // Responsive styles are present in CSS (hard to test in jsdom)
      // At least verify the element renders without errors
    });

    it('handles all responsive breakpoints', () => {
      const breakpoints = ['sm', 'md', 'lg', 'xl'] as const;
      
      breakpoints.forEach(breakpoint => {
        const props = { [breakpoint]: 'row' as const };
        const { unmount } = renderWithTheme(
          <Stack {...props} data-testid={`stack-${breakpoint}`}>
            Content
          </Stack>
        );
        
        const stack = screen.getByTestId(`stack-${breakpoint}`);
        expect(stack).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Combined Props', () => {
    it('handles multiple props together', () => {
      renderWithTheme(
        <Stack
          direction="row"
          expand
          spacing={3}
          justify="space-between"
          align="center"
          wrap="wrap"
          data-testid="test-stack"
        >
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.flexDirection).toBe('row');
      expect(styles.width).toBe('100%');
      expect(styles.gap).toBe('12px'); // 3 * 4px
      expect(styles.justifyContent).toBe('space-between');
      expect(styles.alignItems).toBe('center');
      expect(styles.flexWrap).toBe('wrap');
    });

    it('handles responsive with expand behavior', () => {
      renderWithTheme(
        <Stack
          direction="column"
          md="row"
          expand
          data-testid="test-stack"
        >
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      // Base: column with height 100%
      expect(styles.flexDirection).toBe('column');
      expect(styles.height).toBe('100%');
    });
  });

  describe('Theme Integration', () => {
    it('renders without errors when theme is provided', () => {
      expect(() => {
        renderWithTheme(
          <Stack spacing={2} data-testid="test-stack">
            Content
          </Stack>
        );
      }).not.toThrow();
      
      expect(screen.getByTestId('test-stack')).toBeInTheDocument();
    });

    it('uses theme spacing values correctly', () => {
      renderWithTheme(
        <Stack spacing={2} data-testid="test-stack">
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      // Should use theme.spacing.sm (4px) * 2 = 8px
      expect(styles.gap).toBe('8px');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      renderWithTheme(
        <Stack data-testid="test-stack">
          {null}
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      expect(stack).toBeInTheDocument();
    });

    it('handles undefined children gracefully', () => {
      renderWithTheme(
        <Stack data-testid="test-stack">
          {undefined}
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      expect(stack).toBeInTheDocument();
    });

    it('handles complex children content', () => {
      renderWithTheme(
        <Stack data-testid="test-stack">
          <div>
            <span>Complex</span>
            <strong>Content</strong>
          </div>
          {['Item 1', 'Item 2'].map(item => (
            <div key={item}>{item}</div>
          ))}
        </Stack>
      );
      
      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('handles maximum spacing value', () => {
      renderWithTheme(
        <Stack spacing={8} data-testid="test-stack">
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.gap).toBe('32px'); // 8 * 4px
    });

    it('handles boolean props correctly', () => {
      renderWithTheme(
        <Stack expand data-testid="test-stack">
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      // Default direction is column, so should expand height
      expect(styles.height).toBe('100%');
    });
  });

  describe('Accessibility', () => {
    it('maintains semantic structure', () => {
      renderWithTheme(
        <Stack data-testid="test-stack">
          <h2>Heading</h2>
          <p>Content</p>
          <nav>Navigation</nav>
        </Stack>
      );
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('does not interfere with ARIA attributes', () => {
      renderWithTheme(
        <Stack 
          role="main"
          aria-label="Main content stack"
          data-testid="test-stack"
        >
          <div role="article">Article content</div>
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      expect(stack).toHaveAttribute('role', 'main');
      expect(stack).toHaveAttribute('aria-label', 'Main content stack');
      
      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();
    });

    it('supports custom HTML attributes', () => {
      renderWithTheme(
        <Stack 
          id="custom-id"
          data-custom="value"
          data-testid="test-stack"
        >
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      expect(stack).toHaveAttribute('id', 'custom-id');
      expect(stack).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('Performance', () => {
    it('renders large stacks efficiently', () => {
      const items = Array.from({ length: 100 }, (_, i) => (
        <div key={i}>Item {i + 1}</div>
      ));
      
      const startTime = performance.now();
      
      renderWithTheme(
        <Stack spacing={1} data-testid="large-stack">
          {items}
        </Stack>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(screen.getByTestId('large-stack')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 100')).toBeInTheDocument();
      
      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(100); // 100ms threshold
    });
  });

  describe('CSS Properties', () => {
    it('applies correct flexbox properties', () => {
      renderWithTheme(
        <Stack 
          direction="row"
          justify="center"
          align="stretch"
          wrap="wrap"
          data-testid="test-stack"
        >
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('row');
      expect(styles.justifyContent).toBe('center');
      expect(styles.alignItems).toBe('stretch');
      expect(styles.flexWrap).toBe('wrap');
      expect(styles.boxSizing).toBe('border-box');
    });

    it('maintains proper box sizing', () => {
      renderWithTheme(
        <Stack data-testid="test-stack">
          Content
        </Stack>
      );
      
      const stack = screen.getByTestId('test-stack');
      const styles = window.getComputedStyle(stack);
      
      expect(styles.boxSizing).toBe('border-box');
    });
  });
});