import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { KeyboardContextProvider } from '@/context/KeyboardContext';
import { TransformControl } from './TransformControl';
import type {
  TransformControlProps,
  TransformValue,
} from './TransformControl.types';

const baseTransform: TransformValue = {
  position: { x: 1, y: 2, z: 3 },
  rotation: { x: 10, y: 20, z: 30 },
  scale: { x: 1, y: 1, z: 1 },
};

const renderTransform = (props: Partial<TransformControlProps> = {}) =>
  renderWithTheme(
    <KeyboardContextProvider>
      <TransformControl {...props} />
    </KeyboardContextProvider>
  );

const editFirstNumberInputOf = (groupAriaLabel: string, raw: string) => {
  const group = screen.getByRole('group', { name: groupAriaLabel });
  const inputs = group.querySelectorAll('input[type="text"]');
  const first = inputs[0] as HTMLInputElement;
  fireEvent.mouseDown(first);
  fireEvent.mouseUp(first);
  fireEvent.focus(first);
  fireEvent.change(first, { target: { value: raw } });
  fireEvent.blur(first);
};

describe('TransformControl', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders all three subgroup rows by default', () => {
      renderTransform();
      expect(screen.getByText('Position')).toBeInTheDocument();
      expect(screen.getByText('Rotation')).toBeInTheDocument();
      expect(screen.getByText('Scale')).toBeInTheDocument();
    });

    it('renders the coordinate-space row by default', () => {
      renderTransform();
      expect(screen.getByText('Space')).toBeInTheDocument();
    });

    it('applies data-testid to the wrapper', () => {
      renderTransform({ testId: 'transform' });
      expect(screen.getByTestId('transform')).toBeInTheDocument();
    });

    it('hides the position row when show.position is false', () => {
      renderTransform({ show: { position: false } });
      expect(screen.queryByText('Position')).not.toBeInTheDocument();
      expect(screen.getByText('Rotation')).toBeInTheDocument();
      expect(screen.getByText('Scale')).toBeInTheDocument();
    });

    it('hides only the rotation and scale rows when those are hidden', () => {
      renderTransform({ show: { rotation: false, scale: false } });
      expect(screen.getByText('Position')).toBeInTheDocument();
      expect(screen.queryByText('Rotation')).not.toBeInTheDocument();
      expect(screen.queryByText('Scale')).not.toBeInTheDocument();
      // coordinate space row still shows because position is visible
      expect(screen.getByText('Space')).toBeInTheDocument();
    });

    it('hides the coordinate-space row when both position and rotation are hidden', () => {
      renderTransform({ show: { position: false, rotation: false } });
      expect(screen.queryByText('Space')).not.toBeInTheDocument();
      expect(screen.queryByText('Position')).not.toBeInTheDocument();
      expect(screen.queryByText('Rotation')).not.toBeInTheDocument();
      expect(screen.getByText('Scale')).toBeInTheDocument();
    });
  });

  describe('Controlled value', () => {
    it('drives the position row from the value prop', () => {
      renderTransform({ value: baseTransform, onChange: vi.fn() });
      const group = screen.getByRole('group', { name: 'Position' });
      expect(group.textContent).toContain('1.000');
      expect(group.textContent).toContain('2.000');
      expect(group.textContent).toContain('3.000');
    });

    it('drives the scale row from the value prop', () => {
      renderTransform({
        value: {
          ...baseTransform,
          scale: { x: 2, y: 3, z: 4 },
        },
        onChange: vi.fn(),
      });
      const group = screen.getByRole('group', { name: 'Scale' });
      expect(group.textContent).toContain('2.000');
      expect(group.textContent).toContain('3.000');
      expect(group.textContent).toContain('4.000');
    });

    it('fires onChange with the full TransformValue when an axis changes', () => {
      const handleChange = vi.fn();
      renderTransform({ value: baseTransform, onChange: handleChange });

      editFirstNumberInputOf('Position', '7');

      expect(handleChange).toHaveBeenCalled();
      const last = handleChange.mock.calls[
        handleChange.mock.calls.length - 1
      ] as [TransformValue];
      expect(last[0]).toEqual({
        position: { x: 7, y: 2, z: 3 },
        rotation: { x: 10, y: 20, z: 30 },
        scale: { x: 1, y: 1, z: 1 },
      });
    });
  });

  describe('Uncontrolled value', () => {
    it('initializes from defaultValue', () => {
      renderTransform({
        defaultValue: {
          position: { x: 4, y: 5, z: 6 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
      });
      const group = screen.getByRole('group', { name: 'Position' });
      expect(group.textContent).toContain('4.000');
      expect(group.textContent).toContain('5.000');
      expect(group.textContent).toContain('6.000');
    });
  });

  describe('Coordinate space', () => {
    it('renders the default option labels', () => {
      renderTransform();
      // closed combobox shows the current label
      expect(screen.getByText('Local')).toBeInTheDocument();
    });

    it('reflects defaultCoordinateSpace', () => {
      renderTransform({ defaultCoordinateSpace: 'world' });
      expect(screen.getByText('World')).toBeInTheDocument();
    });

    it('fires onCoordinateSpaceChange when a new option is selected', () => {
      const handleSpaceChange = vi.fn();
      renderTransform({
        coordinateSpace: 'local',
        onCoordinateSpaceChange: handleSpaceChange,
      });

      // Open the select dropdown
      const trigger = screen.getByRole('combobox', { name: /space/i });
      fireEvent.click(trigger);

      // Pick "World"
      const worldOption = screen.getByText('World');
      fireEvent.click(worldOption);

      expect(handleSpaceChange).toHaveBeenCalledWith('world');
    });

    it('replaces the default options when coordinateSpaceOptions is provided', () => {
      renderTransform({
        coordinateSpaceOptions: [
          { value: 'camera', label: 'Camera' },
          { value: 'screen', label: 'Screen' },
        ],
        defaultCoordinateSpace: 'camera',
      });
      expect(screen.getByText('Camera')).toBeInTheDocument();
      expect(screen.queryByText('Local')).not.toBeInTheDocument();
    });
  });

  describe('Linked scale', () => {
    it('renders the lock toggle pressed by default (linked = true)', () => {
      renderTransform();
      const lock = screen.getByTestId('transform-scale-lock');
      expect(lock).toHaveAttribute('aria-pressed', 'true');
    });

    it('fires onLinkedScaleChange when the lock toggle is clicked', () => {
      const handleLinkedChange = vi.fn();
      renderTransform({ onLinkedScaleChange: handleLinkedChange });
      fireEvent.click(screen.getByTestId('transform-scale-lock'));
      expect(handleLinkedChange).toHaveBeenCalledWith(false);
    });

    it('updates all three scale axes when linked and one axis changes', () => {
      const handleChange = vi.fn();
      renderTransform({
        value: baseTransform,
        defaultLinkedScale: true,
        onChange: handleChange,
      });

      editFirstNumberInputOf('Scale', '5');

      const last = handleChange.mock.calls[
        handleChange.mock.calls.length - 1
      ] as [TransformValue];
      expect(last[0].scale).toEqual({ x: 5, y: 5, z: 5 });
    });

    it('updates only the changed axis when unlinked', () => {
      const handleChange = vi.fn();
      renderTransform({
        value: baseTransform,
        defaultLinkedScale: false,
        onChange: handleChange,
      });

      editFirstNumberInputOf('Scale', '5');

      const last = handleChange.mock.calls[
        handleChange.mock.calls.length - 1
      ] as [TransformValue];
      expect(last[0].scale).toEqual({ x: 5, y: 1, z: 1 });
    });

    it('preserves scale values when toggling the lock (no snap)', () => {
      const handleChange = vi.fn();
      renderTransform({
        value: {
          ...baseTransform,
          scale: { x: 2, y: 3, z: 4 },
        },
        defaultLinkedScale: false,
        onChange: handleChange,
      });

      fireEvent.click(screen.getByTestId('transform-scale-lock'));

      // The displayed scale values should be unchanged after toggling
      const group = screen.getByRole('group', { name: 'Scale' });
      expect(group.textContent).toContain('2.000');
      expect(group.textContent).toContain('3.000');
      expect(group.textContent).toContain('4.000');
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Disabled', () => {
    it('disables all axis inputs, the dropdown and the lock', () => {
      renderTransform({ disabled: true });

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toBeDisabled();
      });

      const trigger = screen.getByRole('combobox', { name: /space/i });
      expect(trigger).toBeDisabled();

      expect(screen.getByTestId('transform-scale-lock')).toBeDisabled();
    });
  });

  describe('showReset', () => {
    it('renders no reset buttons by default', () => {
      renderTransform();
      expect(screen.queryAllByLabelText('Reset to default')).toHaveLength(0);
    });

    it('renders a reset button per row when showReset is true', () => {
      renderTransform({ showReset: true });
      expect(screen.getAllByLabelText('Reset to default')).toHaveLength(3);
    });

    it('resets only the position row when its reset is clicked', () => {
      const handleChange = vi.fn();
      renderTransform({
        value: baseTransform,
        showReset: true,
        onChange: handleChange,
      });

      // Reset buttons appear in DOM order: position, rotation, scale
      const resets = screen.getAllByLabelText('Reset to default');
      fireEvent.click(resets[0] as HTMLElement);

      const last = handleChange.mock.calls[
        handleChange.mock.calls.length - 1
      ] as [TransformValue];
      expect(last[0]).toEqual({
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 10, y: 20, z: 30 },
        scale: { x: 1, y: 1, z: 1 },
      });
    });

    it('resets the scale row to (1, 1, 1)', () => {
      const handleChange = vi.fn();
      renderTransform({
        value: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 2, y: 3, z: 4 },
        },
        showReset: true,
        onChange: handleChange,
      });

      const resets = screen.getAllByLabelText('Reset to default');
      fireEvent.click(resets[2] as HTMLElement);

      const last = handleChange.mock.calls[
        handleChange.mock.calls.length - 1
      ] as [TransformValue];
      expect(last[0].scale).toEqual({ x: 1, y: 1, z: 1 });
    });
  });

  describe('Custom labels', () => {
    it('renders the labels supplied via the labels prop', () => {
      renderTransform({
        labels: {
          position: 'Pozycja',
          rotation: 'Obrót',
          scale: 'Skala',
          coordinateSpace: 'Układ',
        },
      });
      expect(screen.getByText('Pozycja')).toBeInTheDocument();
      expect(screen.getByText('Obrót')).toBeInTheDocument();
      expect(screen.getByText('Skala')).toBeInTheDocument();
      expect(screen.getByText('Układ')).toBeInTheDocument();
    });
  });

  describe('Custom precision and units', () => {
    it('forwards precision and unit values to the position row', () => {
      renderTransform({
        value: {
          position: { x: 1, y: 2, z: 3 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
        precision: { position: 2 },
        units: { position: 'cm' },
        onChange: vi.fn(),
      });
      const group = screen.getByRole('group', { name: 'Position' });
      expect(group.textContent).toContain('1.00');
      // Unit is rendered alongside the input value
      expect(group.textContent).toContain('cm');
    });
  });
});
