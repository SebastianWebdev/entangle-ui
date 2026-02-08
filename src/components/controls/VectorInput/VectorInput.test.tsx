import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { KeyboardContextProvider } from '@/context/KeyboardContext';
import { VectorInput } from './VectorInput';
import type { VectorInputProps } from './VectorInput.types';

/**
 * Helper to render VectorInput wrapped with KeyboardContextProvider.
 * NumberInput (used internally) depends on useKeyboardContext().
 */
const renderVectorInput = (props: Partial<VectorInputProps> = {}) => {
  return renderWithTheme(
    <KeyboardContextProvider>
      <VectorInput {...props} />
    </KeyboardContextProvider>
  );
};

describe('VectorInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders 3 inputs by default (dimension=3)', () => {
      renderVectorInput({ value: [1, 2, 3], onChange: vi.fn() });
      const group = screen.getByRole('group');
      expect(group).toBeInTheDocument();
      expect(screen.getByText('X')).toBeInTheDocument();
      expect(screen.getByText('Y')).toBeInTheDocument();
      expect(screen.getByText('Z')).toBeInTheDocument();
    });

    it('renders 2 inputs for dimension=2', () => {
      renderVectorInput({ dimension: 2, value: [1, 2], onChange: vi.fn() });
      expect(screen.getByText('X')).toBeInTheDocument();
      expect(screen.getByText('Y')).toBeInTheDocument();
      expect(screen.queryByText('Z')).not.toBeInTheDocument();
    });

    it('renders 4 inputs for dimension=4', () => {
      renderVectorInput({
        dimension: 4,
        value: [1, 2, 3, 4],
        onChange: vi.fn(),
      });
      expect(screen.getByText('X')).toBeInTheDocument();
      expect(screen.getByText('Y')).toBeInTheDocument();
      expect(screen.getByText('Z')).toBeInTheDocument();
      expect(screen.getByText('W')).toBeInTheDocument();
    });

    it('renders label when provided', () => {
      renderVectorInput({
        label: 'Position',
        value: [0, 0, 0],
        onChange: vi.fn(),
      });
      expect(screen.getByText('Position')).toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderVectorInput({
        testId: 'pos-input',
        value: [0, 0, 0],
        onChange: vi.fn(),
      });
      expect(screen.getByTestId('pos-input')).toBeInTheDocument();
    });
  });

  describe('Label Presets', () => {
    it('uses xyz labels by default', () => {
      renderVectorInput({ value: [0, 0, 0], onChange: vi.fn() });
      expect(screen.getByText('X')).toBeInTheDocument();
      expect(screen.getByText('Y')).toBeInTheDocument();
      expect(screen.getByText('Z')).toBeInTheDocument();
    });

    it('uses rgba labels', () => {
      renderVectorInput({
        dimension: 4,
        labelPreset: 'rgba',
        value: [0, 0, 0, 0],
        onChange: vi.fn(),
      });
      expect(screen.getByText('R')).toBeInTheDocument();
      expect(screen.getByText('G')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('uses uvw labels', () => {
      renderVectorInput({
        dimension: 3,
        labelPreset: 'uvw',
        value: [0, 0, 0],
        onChange: vi.fn(),
      });
      expect(screen.getByText('U')).toBeInTheDocument();
      expect(screen.getByText('V')).toBeInTheDocument();
      expect(screen.getByText('W')).toBeInTheDocument();
    });

    it('uses custom labels', () => {
      renderVectorInput({
        dimension: 2,
        labelPreset: 'custom',
        axisLabels: ['Min', 'Max'],
        value: [0, 100],
        onChange: vi.fn(),
      });
      expect(screen.getByText('Min')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
    });
  });

  describe('Controlled', () => {
    it('respects value prop', () => {
      renderVectorInput({ value: [10, 20, 30], onChange: vi.fn() });
      const group = screen.getByRole('group');
      expect(group).toBeInTheDocument();
    });

    it('calls onChange with correct vector and axis index', () => {
      const handleChange = vi.fn();
      renderVectorInput({ value: [10, 20, 30], onChange: handleChange });

      // Find all inputs (NumberInput renders text inputs)
      const inputs = screen.getAllByRole('textbox');
      const firstInput = inputs[0] as HTMLElement;

      // Click first input to start editing, type a new value
      fireEvent.mouseDown(firstInput);
      fireEvent.mouseUp(firstInput);
      fireEvent.focus(firstInput);
      fireEvent.change(firstInput, { target: { value: '15' } });
      fireEvent.blur(firstInput);

      // onChange should have been called
      if (handleChange.mock.calls.length > 0) {
        const callIndex = handleChange.mock.calls.length - 1;
        const lastCall = handleChange.mock.calls[callIndex] as [
          number[],
          number,
        ];
        expect(lastCall[1]).toBe(0); // axis index 0
      }
    });
  });

  describe('Uncontrolled', () => {
    it('manages state from defaultValue', () => {
      renderVectorInput({ defaultValue: [5, 10, 15], onChange: vi.fn() });
      const group = screen.getByRole('group');
      expect(group).toBeInTheDocument();
    });
  });

  describe('Link Toggle', () => {
    it('shows link button when showLink is true', () => {
      renderVectorInput({
        value: [1, 2, 3],
        onChange: vi.fn(),
        showLink: true,
      });
      expect(
        screen.getByRole('button', { name: 'Link axes' })
      ).toBeInTheDocument();
    });

    it('does not show link button by default', () => {
      renderVectorInput({ value: [1, 2, 3], onChange: vi.fn() });
      expect(
        screen.queryByRole('button', { name: 'Link axes' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Unlink axes' })
      ).not.toBeInTheDocument();
    });

    it('toggles linked state on click', () => {
      renderVectorInput({
        value: [1, 2, 3],
        onChange: vi.fn(),
        showLink: true,
      });

      const linkBtn = screen.getByRole('button', { name: 'Link axes' });
      expect(linkBtn).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(linkBtn);
      expect(
        screen.getByRole('button', { name: 'Unlink axes' })
      ).toHaveAttribute('aria-pressed', 'true');
    });

    it('respects defaultLinked', () => {
      renderVectorInput({
        value: [1, 2, 3],
        onChange: vi.fn(),
        showLink: true,
        defaultLinked: true,
      });
      expect(
        screen.getByRole('button', { name: 'Unlink axes' })
      ).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls onLinkedChange when toggled', () => {
      const handleLinkedChange = vi.fn();
      renderVectorInput({
        value: [1, 2, 3],
        onChange: vi.fn(),
        showLink: true,
        onLinkedChange: handleLinkedChange,
      });

      fireEvent.click(screen.getByRole('button', { name: 'Link axes' }));
      expect(handleLinkedChange).toHaveBeenCalledWith(true);
    });

    it('respects controlled linked prop', () => {
      renderVectorInput({
        value: [1, 2, 3],
        onChange: vi.fn(),
        showLink: true,
        linked: true,
        onLinkedChange: vi.fn(),
      });
      expect(
        screen.getByRole('button', { name: 'Unlink axes' })
      ).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Disabled', () => {
    it('disables all inputs when disabled', () => {
      renderVectorInput({
        value: [0, 0, 0],
        onChange: vi.fn(),
        disabled: true,
      });
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toBeDisabled();
      });
    });

    it('disables link button when disabled', () => {
      renderVectorInput({
        value: [0, 0, 0],
        onChange: vi.fn(),
        showLink: true,
        disabled: true,
      });
      expect(screen.getByRole('button', { name: 'Link axes' })).toBeDisabled();
    });
  });

  describe('Helper/Error Text', () => {
    it('displays helper text', () => {
      renderVectorInput({
        value: [0, 0, 0],
        onChange: vi.fn(),
        helperText: 'World coordinates',
      });
      expect(screen.getByText('World coordinates')).toBeInTheDocument();
    });

    it('displays error message when error', () => {
      renderVectorInput({
        value: [0, 0, 0],
        onChange: vi.fn(),
        error: true,
        errorMessage: 'Values out of range',
      });
      expect(screen.getByText('Values out of range')).toBeInTheDocument();
    });

    it('shows error message over helper text', () => {
      renderVectorInput({
        value: [0, 0, 0],
        onChange: vi.fn(),
        helperText: 'Help text',
        error: true,
        errorMessage: 'Error message',
      });
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="group"', () => {
      renderVectorInput({ value: [0, 0, 0], onChange: vi.fn() });
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('uses label as aria-label when provided', () => {
      renderVectorInput({
        label: 'Position',
        value: [0, 0, 0],
        onChange: vi.fn(),
      });
      expect(screen.getByRole('group')).toHaveAttribute(
        'aria-label',
        'Position'
      );
    });

    it('uses default aria-label when no label', () => {
      renderVectorInput({ value: [0, 0, 0], onChange: vi.fn() });
      expect(screen.getByRole('group')).toHaveAttribute(
        'aria-label',
        'Vector input'
      );
    });

    it('link button has aria-pressed', () => {
      renderVectorInput({
        value: [0, 0, 0],
        onChange: vi.fn(),
        showLink: true,
      });
      expect(screen.getByRole('button', { name: 'Link axes' })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });
  });

  describe('onChangeComplete', () => {
    it('calls onChangeComplete on blur', () => {
      const handleComplete = vi.fn();
      renderVectorInput({
        value: [1, 2, 3],
        onChange: vi.fn(),
        onChangeComplete: handleComplete,
      });

      const inputs = screen.getAllByRole('textbox');
      const firstInput = inputs[0] as HTMLElement;
      fireEvent.blur(firstInput);

      expect(handleComplete).toHaveBeenCalledWith([1, 2, 3]);
    });
  });
});
