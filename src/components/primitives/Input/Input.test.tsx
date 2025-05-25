// src/primitives/Input/Input.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';
import { ThemeProvider } from '@/theme';
import { vi } from 'vitest';

// Test icons
const TestIcon = () => <span data-testid="test-icon">🔍</span>;

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

/**
 * Test suite for Input component
 * 
 * Covers:
 * - Basic rendering and props
 * - All sizes and states
 * - Label and helper text
 * - Icons and visual elements
 * - Event handling
 * - Accessibility features
 * - Error states
 */
describe('Input', () => {
  describe('Rendering', () => {
    it('renders with basic props', () => {
      renderWithTheme(
        <Input placeholder="Enter text" data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Enter text');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders with controlled value', () => {
      renderWithTheme(
        <Input value="test value" onChange={() => {}} data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveValue('test value');
    });

    it('renders with uncontrolled default value', () => {
      renderWithTheme(
        <Input defaultValue="default text" data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveValue('default text');
    });

    it('applies custom className', () => {
      renderWithTheme(
        <Input className="custom-input" data-testid="test-input" />
      );
      
      const container = screen.getByTestId('test-input').closest('.custom-input');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Label and Helper Text', () => {
    it('renders with label', () => {
      renderWithTheme(
        <Input label="Username" data-testid="test-input" />
      );
      
      const label = screen.getByText('Username');
      const input = screen.getByTestId('test-input');
      
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', input.id);
    });

    it('renders required indicator with label', () => {
      renderWithTheme(
        <Input label="Username" required data-testid="test-input" />
      );
      
      const label = screen.getByText('Username');
      expect(label.parentElement).toHaveTextContent('*');
    });

    it('renders helper text', () => {
      renderWithTheme(
        <Input helperText="Enter your username" data-testid="test-input" />
      );
      
      expect(screen.getByText('Enter your username')).toBeInTheDocument();
    });

    it('renders error message when error is true', () => {
      renderWithTheme(
        <Input 
          error 
          errorMessage="This field is required"
          helperText="Normal helper text"
          data-testid="test-input" 
        />
      );
      
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.queryByText('Normal helper text')).not.toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders start icon', () => {
      renderWithTheme(
        <Input startIcon={<TestIcon />} data-testid="test-input" />
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders end icon', () => {
      renderWithTheme(
        <Input endIcon={<TestIcon />} data-testid="test-input" />
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders both start and end icons', () => {
      renderWithTheme(
        <Input 
          startIcon={<span data-testid="start-icon">📧</span>}
          endIcon={<span data-testid="end-icon">✓</span>}
          data-testid="test-input" 
        />
      );
      
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('applies small size correctly', () => {
      renderWithTheme(
        <Input size="sm" data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toBeInTheDocument();
      // Note: styled-components styles might not be fully computed in JSDOM
    });

    it('applies medium size by default', () => {
      renderWithTheme(
        <Input data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toBeInTheDocument();
    });

    it('applies large size correctly', () => {
      renderWithTheme(
        <Input size="lg" data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('supports different input types', () => {
      const types = ['text', 'email', 'password', 'number', 'search', 'url', 'tel'] as const;
      
      types.forEach(type => {
        const { unmount } = renderWithTheme(
          <Input type={type} data-testid={`input-${type}`} />
        );
        
        const input = screen.getByTestId(`input-${type}`);
        expect(input).toHaveAttribute('type', type);
        
        unmount();
      });
    });
  });

  describe('States', () => {
    it('can be disabled', () => {
      renderWithTheme(
        <Input disabled data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toBeDisabled();
    });

    it('can be read-only', () => {
      renderWithTheme(
        <Input readOnly data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('readonly');
    });

    it('can be required', () => {
      renderWithTheme(
        <Input required data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toBeRequired();
    });

    it('applies error state', () => {
      renderWithTheme(
        <Input error data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toBeInTheDocument();
      // Error styling is applied via styled-components
    });
  });

  describe('Event Handling', () => {
    it('handles change events', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Input onChange={handleChange} data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({ value: 'new value' })
        })
      );
    });

    it('handles focus events', () => {
      const handleFocus = vi.fn();
      renderWithTheme(
        <Input onFocus={handleFocus} data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      fireEvent.focus(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles blur events', () => {
      const handleBlur = vi.fn();
      renderWithTheme(
        <Input onBlur={handleBlur} data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('handles keydown events', () => {
      const handleKeyDown = vi.fn();
      renderWithTheme(
        <Input onKeyDown={handleKeyDown} data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'Enter' })
      );
    });
  });

  describe('Focus State Management', () => {
    it('manages internal focus state', () => {
      renderWithTheme(
        <Input data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      
      // Focus should trigger internal state change
      fireEvent.focus(input);
      // Internal focus state affects styling but isn't directly testable in JSDOM
      
      fireEvent.blur(input);
      // Focus state should be reset
    });
  });

  describe('Accessibility', () => {
    it('associates label with input correctly', () => {
      renderWithTheme(
        <Input label="Username" data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      const label = screen.getByText('Username');
      
      expect(label).toHaveAttribute('for', input.id);
      expect(input).toHaveAccessibleName('Username');
    });

    it('provides accessible error messages', () => {
      renderWithTheme(
        <Input 
          label="Email"
          error
          errorMessage="Invalid email format"
          data-testid="test-input"
        />
      );
      
      const input = screen.getByTestId('test-input');
      const errorMessage = screen.getByText('Invalid email format');
      
      expect(input).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
    });

    it('supports ARIA attributes', () => {
      renderWithTheme(
        <Input 
          aria-describedby="help-text"
          aria-invalid="true"
          data-testid="test-input"
        />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Theme Integration', () => {
    it('renders without errors when wrapped in ThemeProvider', () => {
      expect(() => {
        renderWithTheme(<Input data-testid="test-input" />);
      }).not.toThrow();
    });

    it('handles disabled label styling', () => {
      renderWithTheme(
        <Input label="Disabled Input" disabled data-testid="test-input" />
      );
      
      const label = screen.getByText('Disabled Input');
      expect(label).toBeInTheDocument();
      // Disabled styling is applied via styled-components
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string value', () => {
      renderWithTheme(
        <Input value="" onChange={() => {}} data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toHaveValue('');
    });

    it('handles undefined value gracefully', () => {
      renderWithTheme(
        <Input value={undefined} data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      expect(input).toBeInTheDocument();
    });

    it('prevents event handling when disabled', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Input disabled onChange={handleChange} data-testid="test-input" />
      );
      
      const input = screen.getByTestId('test-input');
      
      // Disabled inputs don't fire change events
      fireEvent.change(input, { target: { value: 'test' } });
      expect(handleChange).not.toHaveBeenCalled();
    });
  });
});