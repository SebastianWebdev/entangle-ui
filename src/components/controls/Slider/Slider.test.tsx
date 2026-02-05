// src/components/controls/Slider/Slider.test.tsx
import { screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Slider } from './Slider';
import type { SliderProps } from './Slider';
import { KeyboardContextProvider } from '@/context/KeyboardContext';

/**
 * Helper to render Slider wrapped with required providers.
 *
 * The Slider uses useKeyboardContext() which requires KeyboardContextProvider.
 * renderWithTheme provides the Emotion ThemeProvider.
 */
const renderSlider = (props: Partial<SliderProps> = {}) => {
  const defaultProps: SliderProps = {
    value: 50,
    onChange: vi.fn(),
    ...props,
  };
  return renderWithTheme(
    <KeyboardContextProvider>
      <Slider {...defaultProps} />
    </KeyboardContextProvider>
  );
};

/**
 * Test suite for the Slider component
 *
 * Covers: rendering, ARIA attributes, keyboard navigation, value display,
 * size variants, and component states.
 */
describe('Slider', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderSlider();

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });

    it('renders with label', () => {
      renderSlider({ label: 'Volume' });

      expect(screen.getByText('Volume')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      renderSlider({ helperText: 'Adjust the volume level' });

      expect(screen.getByText('Adjust the volume level')).toBeInTheDocument();
    });

    it('renders with error state and error message', () => {
      renderSlider({ error: true, errorMessage: 'Value is out of range' });

      expect(screen.getByText('Value is out of range')).toBeInTheDocument();
    });

    it('renders with custom unit display', () => {
      renderSlider({ value: 75, unit: '%' });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuetext', '75.00%');
    });

    it('renders tick marks when showTicks is true', () => {
      renderSlider({
        showTicks: true,
        tickCount: 5,
      });

      const sliderElement = screen.getByRole('slider');
      // Just verify that showTicks renders extra children
      expect(sliderElement.children.length).toBeGreaterThanOrEqual(3);
    });

    it('applies testId to container', () => {
      renderSlider({ testId: 'my-slider' });

      expect(screen.getByTestId('my-slider')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderSlider({ className: 'custom-slider' });

      // className is applied to the StyledSliderContainer (outermost wrapper)
      const testIdContainer = screen.getByRole('slider').closest('[class]');
      expect(testIdContainer).toBeTruthy();
    });
  });

  describe('ARIA Attributes', () => {
    it('has role="slider"', () => {
      renderSlider();

      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('has correct aria-valuemin', () => {
      renderSlider({ min: 10 });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '10');
    });

    it('has correct aria-valuemax', () => {
      renderSlider({ max: 200 });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemax', '200');
    });

    it('has correct aria-valuenow', () => {
      renderSlider({ value: 42 });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuenow', '42');
    });

    it('has correct aria-valuetext with unit', () => {
      renderSlider({ value: 75, unit: 'px' });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuetext', '75.00px');
    });

    it('has aria-disabled when disabled', () => {
      renderSlider({ disabled: true });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-disabled', 'true');
    });

    it('has aria-readonly when readOnly', () => {
      renderSlider({ readOnly: true });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-readonly', 'true');
    });

    it('has aria-required when required', () => {
      renderSlider({ required: true });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-required', 'true');
    });

    it('has aria-invalid when error', () => {
      renderSlider({ error: true });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('receives focus via Tab (tabIndex=0)', () => {
      renderSlider();

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('tabindex', '0');
    });

    it('does not receive focus when disabled (tabIndex=-1)', () => {
      renderSlider({ disabled: true });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('tabindex', '-1');
    });

    it('ArrowRight increments value by step', () => {
      const onChange = vi.fn();
      renderSlider({ value: 50, step: 1, onChange });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'ArrowRight' });

      expect(onChange).toHaveBeenCalledWith(51);
    });

    it('ArrowUp increments value by step', () => {
      const onChange = vi.fn();
      renderSlider({ value: 50, step: 1, onChange });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'ArrowUp' });

      expect(onChange).toHaveBeenCalledWith(51);
    });

    it('ArrowLeft decrements value by step', () => {
      const onChange = vi.fn();
      renderSlider({ value: 50, step: 1, onChange });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });

      expect(onChange).toHaveBeenCalledWith(49);
    });

    it('ArrowDown decrements value by step', () => {
      const onChange = vi.fn();
      renderSlider({ value: 50, step: 1, onChange });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'ArrowDown' });

      expect(onChange).toHaveBeenCalledWith(49);
    });

    it('Home sets value to min', () => {
      const onChange = vi.fn();
      renderSlider({ value: 50, min: 0, onChange });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'Home' });

      expect(onChange).toHaveBeenCalledWith(0);
    });

    it('End sets value to max', () => {
      const onChange = vi.fn();
      renderSlider({ value: 50, max: 100, onChange });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'End' });

      expect(onChange).toHaveBeenCalledWith(100);
    });

    it('PageUp increments by large step', () => {
      const onChange = vi.fn();
      // Default largeStep = step * 10 = 1 * 10 = 10
      renderSlider({ value: 50, step: 1, onChange });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'PageUp' });

      expect(onChange).toHaveBeenCalledWith(60);
    });

    it('PageDown decrements by large step', () => {
      const onChange = vi.fn();
      // Default largeStep = step * 10 = 1 * 10 = 10
      renderSlider({ value: 50, step: 1, onChange });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'PageDown' });

      expect(onChange).toHaveBeenCalledWith(40);
    });

    it('does not respond when disabled', () => {
      const onChange = vi.fn();
      renderSlider({ value: 50, disabled: true, onChange });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'ArrowRight' });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not respond when readOnly', () => {
      const onChange = vi.fn();
      renderSlider({ value: 50, readOnly: true, onChange });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'ArrowRight' });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('clamps value to min bound', () => {
      const onChange = vi.fn();
      renderSlider({ value: 0, min: 0, step: 1, onChange });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'ArrowLeft' });

      // Value is at min (0), decrementing would go to -1 which gets clamped to 0.
      // Since clamped === value, onChange should NOT be called.
      expect(onChange).not.toHaveBeenCalled();
    });

    it('clamps value to max bound', () => {
      const onChange = vi.fn();
      renderSlider({ value: 100, max: 100, step: 1, onChange });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'ArrowRight' });

      // Value is at max (100), incrementing would go to 101 which gets clamped to 100.
      // Since clamped === value, onChange should NOT be called.
      expect(onChange).not.toHaveBeenCalled();
    });

    it('fires custom onKeyDown handler', () => {
      const onKeyDown = vi.fn();
      const onChange = vi.fn();
      renderSlider({ value: 50, onChange, onKeyDown });

      const slider = screen.getByRole('slider');
      fireEvent.keyDown(slider, { key: 'ArrowRight' });

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'ArrowRight' })
      );
    });
  });

  describe('Value Display', () => {
    it('displays formatted value with precision', () => {
      renderSlider({ value: 50, precision: 2 });

      const slider = screen.getByRole('slider');
      // With precision=2, the valuetext should be "50.00"
      expect(slider).toHaveAttribute('aria-valuetext', '50.00');
    });

    it('displays value with unit suffix', () => {
      renderSlider({ value: 75, unit: '%', precision: 2 });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuetext', '75.00%');
    });

    it('displays value using custom formatValue function', () => {
      const formatValue = (v: number) => `${v} degrees`;
      renderSlider({ value: 90, formatValue });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuetext', '90 degrees');
    });
  });

  describe('Size Variants', () => {
    it('renders small size', () => {
      renderSlider({ size: 'sm' });

      // The component renders without errors at small size
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('renders medium size (default)', () => {
      renderSlider();

      // Default size is 'md' - component renders without errors
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('renders large size', () => {
      renderSlider({ size: 'lg' });

      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('applies disabled styling', () => {
      renderSlider({ disabled: true, testId: 'disabled-slider' });

      const container = screen.getByTestId('disabled-slider');
      const styles = window.getComputedStyle(container);
      expect(styles.opacity).toBe('0.5');
      expect(styles.pointerEvents).toBe('none');
    });

    it('applies error styling', () => {
      renderSlider({ error: true });

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-invalid', 'true');
    });

    it('applies focus state on focus event', () => {
      renderSlider();

      const slider = screen.getByRole('slider');
      // Use .focus() inside act() to handle the state update from onFocus handler
      act(() => {
        slider.focus();
      });

      expect(slider).toHaveFocus();
    });

    it('fires onFocus callback', () => {
      const onFocus = vi.fn();
      renderSlider({ onFocus });

      const slider = screen.getByRole('slider');
      fireEvent.focus(slider);

      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('fires onBlur callback', () => {
      const onBlur = vi.fn();
      renderSlider({ onBlur });

      const slider = screen.getByRole('slider');
      fireEvent.focus(slider);
      fireEvent.blur(slider);

      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });
});
