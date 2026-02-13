import { screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { KeyboardContextProvider } from '@/context/KeyboardContext';
import { NumberInput } from './NumberInput';
import type { NumberInputProps } from './NumberInput';

/**
 * Helper to render NumberInput wrapped with both ThemeProvider and KeyboardContextProvider.
 * NumberInput depends on useKeyboardContext() which throws without KeyboardContextProvider.
 */
const renderNumberInput = (props: Partial<NumberInputProps> = {}) => {
  const defaultProps: NumberInputProps = {
    value: 50,
    onChange: vi.fn(),
    ...props,
  };
  return renderWithTheme(
    <KeyboardContextProvider>
      <NumberInput {...defaultProps} />
    </KeyboardContextProvider>
  );
};

/**
 * Helper to find the text input element within the NumberInput component.
 * The component renders an input[type="text"] that is hidden when not editing.
 */
const getInput = (): HTMLInputElement => {
  return screen.getByRole('textbox');
};

/**
 * Test suite for NumberInput component
 *
 * Covers: rendering, keyboard navigation, value input, step buttons, accessibility
 */
describe('NumberInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      renderNumberInput();

      const input = getInput();
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('displays formatted value', () => {
      renderNumberInput({ value: 42 });

      // When not editing, the display value is shown in a separate span
      expect(screen.getByText('42.00')).toBeInTheDocument();
    });

    it('renders with label', () => {
      renderNumberInput({ label: 'Rotation' });

      const label = screen.getByText('Rotation');
      expect(label).toBeInTheDocument();
    });

    it('renders with unit display', () => {
      renderNumberInput({ value: 90, unit: 'deg' });

      expect(screen.getByText('deg')).toBeInTheDocument();
    });

    it('renders with unit as function', () => {
      renderNumberInput({
        value: 90,
        unit: (v: number) => `${v > 0 ? '+' : ''}deg`,
      });

      expect(screen.getByText('+deg')).toBeInTheDocument();
    });

    it('renders step buttons', () => {
      renderNumberInput();

      const incrementButton = screen.getByLabelText('Increment value');
      const decrementButton = screen.getByLabelText('Decrement value');

      expect(incrementButton).toBeInTheDocument();
      expect(decrementButton).toBeInTheDocument();
    });

    it('applies testId to container', () => {
      renderNumberInput({ testId: 'my-number-input' });

      expect(screen.getByTestId('my-number-input')).toBeInTheDocument();
    });

    it('renders with precision formatting', () => {
      renderNumberInput({ value: 3.14159, precision: 2 });

      expect(screen.getByText('3.14')).toBeInTheDocument();
    });

    it('hides step buttons when showStepButtons is false', () => {
      renderNumberInput({ showStepButtons: false });

      expect(
        screen.queryByLabelText('Increment value')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Decrement value')
      ).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('receives focus via Tab', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderNumberInput();

      const input = getInput();
      await user.tab();

      expect(input).toHaveFocus();
    });

    it('Enter key starts editing mode', () => {
      renderNumberInput({ value: 50 });

      const input = getInput();
      act(() => {
        input.focus();
      });

      // Before Enter: input is hidden (opacity 0), display value is shown
      expect(screen.getByText('50.00')).toBeInTheDocument();

      // Press Enter to start editing
      fireEvent.keyDown(input, { key: 'Enter' });

      act(() => {
        vi.runAllTimers();
      });

      // After Enter: input should become visible (editing mode)
      // The input value should now contain the display value for editing
      expect(input.style.opacity).toBe('1');
    });

    it('Enter key confirms value when editing', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      // Enter editing mode
      fireEvent.keyDown(input, { key: 'Enter' });
      act(() => {
        vi.runAllTimers();
      });

      // Type a new value
      fireEvent.change(input, { target: { value: '75' } });

      // Confirm with Enter
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith(75);
    });

    it('Escape key cancels editing and reverts value', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      // Enter editing mode
      fireEvent.keyDown(input, { key: 'Enter' });
      act(() => {
        vi.runAllTimers();
      });

      // Type a different value
      fireEvent.change(input, { target: { value: '999' } });

      // Cancel with Escape
      fireEvent.keyDown(input, { key: 'Escape' });

      // onChange should NOT have been called with the new value
      expect(onChange).not.toHaveBeenCalledWith(999);

      // Should exit editing mode — display value should revert
      expect(input.style.opacity).toBe('0');
    });

    it('ArrowUp increments value by step', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, step: 1, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      // ArrowUp when not editing should increment
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(onChange).toHaveBeenCalledWith(51);
    });

    it('ArrowDown decrements value by step', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, step: 1, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      // ArrowDown when not editing should decrement
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(onChange).toHaveBeenCalledWith(49);
    });

    it('ArrowUp increments by custom step', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, step: 5, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(onChange).toHaveBeenCalledWith(55);
    });

    it('ArrowDown decrements by custom step', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, step: 5, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(onChange).toHaveBeenCalledWith(45);
    });

    it('Minus key negates value', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      // Minus when not editing should negate
      fireEvent.keyDown(input, { key: '-' });

      expect(onChange).toHaveBeenCalledWith(-50);
    });

    it('Minus key negates a negative value to positive', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: -25, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      fireEvent.keyDown(input, { key: '-' });

      expect(onChange).toHaveBeenCalledWith(25);
    });

    it('does not respond to keyboard when disabled', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, disabled: true, onChange });

      const input = getInput();

      // Even if we force focus, disabled should prevent actions
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
      fireEvent.keyDown(input, { key: '-' });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('fires custom onKeyDown handler', () => {
      const onKeyDown = vi.fn();
      renderNumberInput({ value: 50, onKeyDown });

      const input = getInput();
      act(() => {
        input.focus();
      });

      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'ArrowUp' })
      );
    });

    it('ArrowUp/Down do not increment/decrement during editing mode', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      // Enter editing mode
      fireEvent.keyDown(input, { key: 'Enter' });
      act(() => {
        vi.runAllTimers();
      });

      onChange.mockClear();

      // ArrowUp/Down should not call onChange in editing mode
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Value Input', () => {
    it('accepts numeric input when editing', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      // Enter editing mode
      fireEvent.keyDown(input, { key: 'Enter' });
      act(() => {
        vi.runAllTimers();
      });

      // Type a number
      fireEvent.change(input, { target: { value: '100' } });

      // Confirm
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith(100);
    });

    it('accepts expression input when editing and allowExpressions=true', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 0, allowExpressions: true, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      // Enter editing mode
      fireEvent.keyDown(input, { key: 'Enter' });
      act(() => {
        vi.runAllTimers();
      });

      // Type an expression
      fireEvent.change(input, { target: { value: '2+3' } });

      // Confirm
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith(5);
    });

    it('accepts math function expressions', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 0, allowExpressions: true, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      fireEvent.keyDown(input, { key: 'Enter' });
      act(() => {
        vi.runAllTimers();
      });

      fireEvent.change(input, { target: { value: 'sqrt(16)' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith(4);
    });

    it('respects min bound', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 5, min: 0, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      // Enter editing mode
      fireEvent.keyDown(input, { key: 'Enter' });
      act(() => {
        vi.runAllTimers();
      });

      // Type a value below min
      fireEvent.change(input, { target: { value: '-10' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      // Should clamp to min
      expect(onChange).toHaveBeenCalledWith(0);
    });

    it('respects max bound', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, max: 100, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      fireEvent.keyDown(input, { key: 'Enter' });
      act(() => {
        vi.runAllTimers();
      });

      fireEvent.change(input, { target: { value: '200' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalledWith(100);
    });

    it('applies step increments correctly via ArrowUp', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 0, step: 0.5, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(onChange).toHaveBeenCalledWith(0.5);
    });

    it('applies step decrements correctly via ArrowDown', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 10, step: 2.5, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(onChange).toHaveBeenCalledWith(7.5);
    });

    it('respects min/max when incrementing with ArrowUp', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 99, max: 100, step: 5, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      fireEvent.keyDown(input, { key: 'ArrowUp' });

      // 99 + 5 = 104, but should be clamped to 100
      expect(onChange).toHaveBeenCalledWith(100);
    });

    it('respects min/max when decrementing with ArrowDown', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 2, min: 0, step: 5, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });

      // 2 - 5 = -3, but should be clamped to 0
      expect(onChange).toHaveBeenCalledWith(0);
    });

    it('ends editing on blur and applies value', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, onChange });

      const input = getInput();
      act(() => {
        input.focus();
      });

      // Enter editing mode
      fireEvent.keyDown(input, { key: 'Enter' });
      act(() => {
        vi.runAllTimers();
      });

      // Type a new value
      fireEvent.change(input, { target: { value: '75' } });

      // Blur to end editing
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledWith(75);
    });
  });

  describe('Step Buttons', () => {
    it('step buttons are not focusable via Tab (tabIndex=-1)', () => {
      renderNumberInput();

      const incrementButton = screen.getByLabelText('Increment value');
      const decrementButton = screen.getByLabelText('Decrement value');

      expect(incrementButton).toHaveAttribute('tabindex', '-1');
      expect(decrementButton).toHaveAttribute('tabindex', '-1');
    });

    it('increment button increases value', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 10, step: 1, onChange });

      const incrementButton = screen.getByLabelText('Increment value');
      fireEvent.click(incrementButton);

      expect(onChange).toHaveBeenCalledWith(11);
    });

    it('decrement button decreases value', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 10, step: 1, onChange });

      const decrementButton = screen.getByLabelText('Decrement value');
      fireEvent.click(decrementButton);

      expect(onChange).toHaveBeenCalledWith(9);
    });

    it('step buttons are disabled when component is disabled', () => {
      renderNumberInput({ disabled: true });

      const incrementButton = screen.getByLabelText('Increment value');
      const decrementButton = screen.getByLabelText('Decrement value');

      expect(incrementButton).toBeDisabled();
      expect(decrementButton).toBeDisabled();
    });

    it('step buttons respect min/max bounds', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 100, max: 100, step: 1, onChange });

      const incrementButton = screen.getByLabelText('Increment value');
      fireEvent.click(incrementButton);

      // Value should not exceed max
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible increment button label', () => {
      renderNumberInput();

      const incrementButton = screen.getByLabelText('Increment value');
      expect(incrementButton).toBeInTheDocument();
      expect(incrementButton).toHaveAttribute('aria-label', 'Increment value');
    });

    it('has accessible decrement button label', () => {
      renderNumberInput();

      const decrementButton = screen.getByLabelText('Decrement value');
      expect(decrementButton).toBeInTheDocument();
      expect(decrementButton).toHaveAttribute('aria-label', 'Decrement value');
    });

    it('disabled state prevents interactions', () => {
      const onChange = vi.fn();
      renderNumberInput({ value: 50, disabled: true, onChange });

      const input = getInput();
      expect(input).toBeDisabled();

      // Keyboard interactions should not work
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('label is associated with input via htmlFor', () => {
      renderNumberInput({ label: 'Scale Factor' });

      const label = screen.getByText('Scale Factor');
      const input = getInput();

      expect(label).toHaveAttribute('for', input.id);
    });

    it('required indicator is shown when required', () => {
      renderNumberInput({ label: 'Width', required: true });

      expect(screen.getByText('Width')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders helper text', () => {
      renderNumberInput({ helperText: 'Enter a value between 0 and 100' });

      expect(
        screen.getByText('Enter a value between 0 and 100')
      ).toBeInTheDocument();
    });

    it('renders error message when validation fails', () => {
      renderNumberInput({
        errorMessage: 'Value is out of range',
      });

      expect(screen.getByText('Value is out of range')).toBeInTheDocument();
    });
  });
});
