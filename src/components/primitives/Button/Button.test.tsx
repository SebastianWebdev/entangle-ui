// src/primitives/Button/Button.test.tsx
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithTheme, styleAssertions } from '@/tests/testUtils';
import { Button } from './Button';

/**
 * Test suite for Button component
 *
 * Covers: rendering, variants, interactions, accessibility, loading states
 */
describe('Button', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Button>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders with children content', () => {
      renderWithTheme(<Button>Save Project</Button>);
      expect(screen.getByText('Save Project')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithTheme(<Button className="custom-class">Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('applies data-testid via testId prop', () => {
      renderWithTheme(<Button testId="save-button">Save</Button>);
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles click events', () => {
      const handleClick = vi.fn();
      renderWithTheme(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('passes event object to onClick handler', () => {
      const handleClick = vi.fn();
      renderWithTheme(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
        })
      );
    });

    it('prevents interaction when disabled', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('prevents interaction when loading', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <Button loading onClick={handleClick}>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading is true', () => {
      renderWithTheme(<Button loading>Save</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      // Check for loading spinner element by its characteristics
      const spinner = button.querySelector('div');
      expect(spinner).toBeInTheDocument();

      // Verify spinner has expected dimensions and styling
      if (spinner) {
        styleAssertions.expectDimensions(spinner, '16px', '16px');
        styleAssertions.expectBorderRadius(spinner, '50%');
      }
    });

    it('hides icon when loading', () => {
      const icon = <span data-testid="test-icon">⚡</span>;
      renderWithTheme(
        <Button icon={icon} loading>
          Save
        </Button>
      );

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });

    it('disables button when loading', () => {
      renderWithTheme(<Button loading>Save</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Icon Rendering', () => {
    it('renders with icon', () => {
      const icon = <span data-testid="test-icon">⚡</span>;
      renderWithTheme(<Button icon={icon}>Save</Button>);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('renders icon without children', () => {
      const icon = <span data-testid="test-icon">⚡</span>;
      renderWithTheme(<Button icon={icon} />);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders children without icon', () => {
      renderWithTheme(<Button>Save</Button>);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('applies small size styles', () => {
      renderWithTheme(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');

      // Check computed styles
      styleAssertions.expectDimensions(button, '', '20px');
    });

    it('applies medium size styles (default)', () => {
      renderWithTheme(<Button size="md">Medium</Button>);
      const button = screen.getByRole('button');

      styleAssertions.expectDimensions(button, '', '24px');
    });

    it('applies large size styles', () => {
      renderWithTheme(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');

      styleAssertions.expectDimensions(button, '', '32px');
    });

    it('uses medium size by default', () => {
      renderWithTheme(<Button>Default</Button>);
      const button = screen.getByRole('button');

      styleAssertions.expectDimensions(button, '', '24px');
    });
  });

  describe('Visual Variants', () => {
    it('applies default variant styles', () => {
      renderWithTheme(<Button variant="default">Default</Button>);
      const button = screen.getByRole('button');

      const styles = window.getComputedStyle(button);
      expect(styles.background).toContain('rgba(0, 0, 0, 0)');
    });

    it('applies ghost variant styles', () => {
      renderWithTheme(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');

      const styles = window.getComputedStyle(button);
      expect(styles.background).toContain('rgba(0, 0, 0, 0)');
    });

    it('applies filled variant styles', () => {
      renderWithTheme(<Button variant="filled">Filled</Button>);
      const button = screen.getByRole('button');

      styleAssertions.expectBackgroundColor(button, 'rgb(0, 122, 204)'); // #007acc
    });

    it('uses default variant by default', () => {
      renderWithTheme(<Button>Default Variant</Button>);
      const button = screen.getByRole('button');

      const styles = window.getComputedStyle(button);
      expect(styles.background).toContain('rgba(0, 0, 0, 0)');
    });
  });

  describe('Full Width', () => {
    it('applies full width when fullWidth is true', () => {
      renderWithTheme(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');

      styleAssertions.expectDimensions(button, '100%', '24px');
    });

    it('does not apply full width by default', () => {
      renderWithTheme(<Button>Normal Width</Button>);
      const button = screen.getByRole('button');

      const styles = window.getComputedStyle(button);
      expect(styles.width).not.toBe('100%');
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      renderWithTheme(<Button>Accessible Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('maintains focus visibility', () => {
      renderWithTheme(<Button>Focusable</Button>);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();
    });

    it('provides proper disabled state for screen readers', () => {
      renderWithTheme(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('disabled');
      expect(button).toBeDisabled();
    });

    it('provides proper disabled state when loading', () => {
      renderWithTheme(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('activates on Enter key press', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<Button onClick={handleClick}>Click me</Button>);

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('activates on Space key press', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<Button onClick={handleClick}>Click me</Button>);

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();

      await user.keyboard('{ }');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not activate when disabled and Enter is pressed', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not activate when disabled and Space is pressed', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{ }');
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('receives focus via Tab key', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Button>Focusable</Button>);

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('does not receive focus when disabled', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Button disabled>Disabled</Button>);

      await user.tab();
      expect(screen.getByRole('button')).not.toHaveFocus();
    });

    it('does not activate on other keys like "a" or "ArrowDown"', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(<Button onClick={handleClick}>Click me</Button>);

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();

      await user.keyboard('a');
      expect(handleClick).not.toHaveBeenCalled();

      await user.keyboard('{ArrowDown}');
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined children gracefully', () => {
      renderWithTheme(<Button>{undefined}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles null children gracefully', () => {
      renderWithTheme(<Button>{null}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles empty string children', () => {
      renderWithTheme(<Button>{''}</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles complex children content', () => {
      renderWithTheme(
        <Button>
          <span>Complex</span> <strong>Content</strong>
        </Button>
      );

      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
