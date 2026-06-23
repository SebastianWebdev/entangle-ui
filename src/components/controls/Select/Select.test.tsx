import { screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach } from 'vitest';
import { vars } from '@/theme/contract.css';
import { renderWithTheme } from '@/tests/testUtils';
import { Select } from './Select';
import type {
  SelectOptionItem,
  SelectOptionGroup,
  SelectProps,
} from './Select.types';

// Mock ResizeObserver (not available in jsdom, needed by ScrollArea)
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

beforeEach(() => {
  globalThis.ResizeObserver = MockResizeObserver;
});

const basicOptions: SelectOptionItem[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
];

const groupedOptions: Array<SelectOptionItem | SelectOptionGroup> = [
  {
    label: 'Basic',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'dissolve', label: 'Dissolve' },
    ],
  },
  {
    label: 'Darken',
    options: [
      { value: 'multiply', label: 'Multiply' },
      { value: 'darken', label: 'Darken' },
    ],
  },
];

const optionsWithDisabled: SelectOptionItem[] = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B', disabled: true },
  { value: 'c', label: 'Option C' },
];

describe('Select', () => {
  describe('Rendering', () => {
    it('renders trigger with placeholder', () => {
      renderWithTheme(<Select options={basicOptions} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('Select...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      renderWithTheme(
        <Select options={basicOptions} placeholder="Choose..." />
      );
      expect(screen.getByText('Choose...')).toBeInTheDocument();
    });

    it('renders with selected value', () => {
      renderWithTheme(<Select options={basicOptions} value="multiply" />);
      expect(screen.getByText('Multiply')).toBeInTheDocument();
    });

    it('renders label', () => {
      renderWithTheme(<Select options={basicOptions} label="Blend Mode" />);
      expect(screen.getByText('Blend Mode')).toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderWithTheme(<Select options={basicOptions} testId="my-select" />);
      expect(screen.getByTestId('my-select')).toBeInTheDocument();
    });
  });

  describe('Open/Close', () => {
    it('opens on click', () => {
      renderWithTheme(<Select options={basicOptions} />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes on Escape', () => {
      renderWithTheme(<Select options={basicOptions} />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('opens on Enter key', () => {
      renderWithTheme(<Select options={basicOptions} />);
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens on Space key', () => {
      renderWithTheme(<Select options={basicOptions} />);
      fireEvent.keyDown(screen.getByRole('combobox'), { key: ' ' });
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('opens on ArrowDown key', () => {
      renderWithTheme(<Select options={basicOptions} />);
      fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('selects option on click', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Select options={basicOptions} onChange={handleChange} />
      );

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Multiply'));

      expect(handleChange).toHaveBeenCalledWith('multiply');
    });

    it('closes dropdown after selection', () => {
      renderWithTheme(<Select options={basicOptions} />);

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Multiply'));

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('renders all options', () => {
      renderWithTheme(<Select options={basicOptions} />);
      fireEvent.click(screen.getByRole('combobox'));

      expect(screen.getByText('Normal')).toBeInTheDocument();
      expect(screen.getByText('Multiply')).toBeInTheDocument();
      expect(screen.getByText('Screen')).toBeInTheDocument();
    });
  });

  describe('Controlled', () => {
    it('respects value prop', () => {
      renderWithTheme(<Select options={basicOptions} value="screen" />);
      expect(screen.getByText('Screen')).toBeInTheDocument();
    });

    it('displays correct option when value changes', () => {
      const { rerender } = renderWithTheme(
        <Select options={basicOptions} value="normal" />
      );
      expect(screen.getByText('Normal')).toBeInTheDocument();

      rerender(<Select options={basicOptions} value="multiply" />);
      expect(screen.getByText('Multiply')).toBeInTheDocument();
    });
  });

  describe('Uncontrolled', () => {
    it('manages own state from defaultValue', () => {
      renderWithTheme(
        <Select options={basicOptions} defaultValue="multiply" />
      );
      expect(screen.getByText('Multiply')).toBeInTheDocument();
    });

    it('updates display after selection', () => {
      renderWithTheme(<Select options={basicOptions} />);

      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Screen'));

      expect(screen.getByText('Screen')).toBeInTheDocument();
    });
  });

  describe('Searchable', () => {
    it('shows search input when searchable', () => {
      renderWithTheme(<Select options={basicOptions} searchable />);
      fireEvent.click(screen.getByRole('combobox'));

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('filters options by search query', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Select options={basicOptions} searchable />);

      fireEvent.click(screen.getByRole('combobox'));
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'mul');

      expect(screen.getByText('Multiply')).toBeInTheDocument();
      expect(screen.queryByText('Normal')).not.toBeInTheDocument();
      expect(screen.queryByText('Screen')).not.toBeInTheDocument();
    });

    it('shows empty message when no results', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Select options={basicOptions} searchable />);

      fireEvent.click(screen.getByRole('combobox'));
      const searchInput = screen.getByPlaceholderText('Search...');
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('uses custom search placeholder', () => {
      renderWithTheme(
        <Select
          options={basicOptions}
          searchable
          searchPlaceholder="Filter..."
        />
      );
      fireEvent.click(screen.getByRole('combobox'));

      expect(screen.getByPlaceholderText('Filter...')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates options with ArrowDown', () => {
      renderWithTheme(<Select options={basicOptions} />);
      fireEvent.click(screen.getByRole('combobox'));

      const listbox = screen.getByRole('listbox');
      fireEvent.keyDown(listbox, { key: 'ArrowDown' });

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveStyle(
        `background: ${vars.colors.surface.hover}`
      ); // surface.hover
    });

    it('selects option with Enter after navigation', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Select options={basicOptions} onChange={handleChange} />
      );

      fireEvent.click(screen.getByRole('combobox'));
      const listbox = screen.getByRole('listbox');

      fireEvent.keyDown(listbox, { key: 'ArrowDown' }); // highlight first
      fireEvent.keyDown(listbox, { key: 'Enter' });

      expect(handleChange).toHaveBeenCalledWith('normal');
    });
  });

  describe('Clearable', () => {
    it('shows clear button when value is set', () => {
      renderWithTheme(
        <Select options={basicOptions} value="normal" clearable />
      );

      expect(screen.getByLabelText('Clear selection')).toBeInTheDocument();
    });

    it('clears value on clear button click', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Select
          options={basicOptions}
          value="normal"
          clearable
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByLabelText('Clear selection'));
      expect(handleChange).toHaveBeenCalledWith(null);
    });

    it('does not show clear button when no value', () => {
      renderWithTheme(<Select options={basicOptions} clearable />);

      expect(
        screen.queryByLabelText('Clear selection')
      ).not.toBeInTheDocument();
    });
  });

  describe('onChange typing', () => {
    // Compile-time contract (C2): `clearable` discriminates the `onChange`
    // value type. These aliases fail `tsc` if the narrowing ever regresses.
    type Equal<X, Y> =
      (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
        ? true
        : false;
    type ParamOf<F> = F extends (value: infer V) => void ? V : never;
    type NonClearableVariant = Exclude<
      SelectProps<string>,
      { clearable: true }
    >;
    type ClearableVariant = Extract<SelectProps<string>, { clearable: true }>;
    type NonClearableValue = ParamOf<
      NonNullable<NonClearableVariant['onChange']>
    >;
    type ClearableValue = ParamOf<NonNullable<ClearableVariant['onChange']>>;

    it('infers a non-null value when not clearable and nullable when clearable', () => {
      const nonClearableIsT: Equal<NonClearableValue, string> = true;
      const clearableIsNullable: Equal<ClearableValue, string | null> = true;
      expect(nonClearableIsT && clearableIsNullable).toBe(true);
    });

    it('clearable select emits null from the clear button', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Select
          clearable
          value="normal"
          options={basicOptions}
          onChange={handleChange}
        />
      );
      fireEvent.click(screen.getByLabelText('Clear selection'));
      expect(handleChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Disabled', () => {
    it('trigger is not clickable when disabled', () => {
      renderWithTheme(<Select options={basicOptions} disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('does not open when disabled', () => {
      renderWithTheme(<Select options={basicOptions} disabled />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Disabled Options', () => {
    it('disabled options have aria-disabled', () => {
      renderWithTheme(<Select options={optionsWithDisabled} />);
      fireEvent.click(screen.getByRole('combobox'));

      const optionB = screen.getByText('Option B').closest('[role="option"]');
      expect(optionB).toHaveAttribute('aria-disabled', 'true');
    });

    it('disabled options are not selectable', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Select options={optionsWithDisabled} onChange={handleChange} />
      );
      fireEvent.click(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('Option B'));

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Groups', () => {
    it('renders group labels', () => {
      renderWithTheme(<Select options={groupedOptions} />);
      fireEvent.click(screen.getByRole('combobox'));

      expect(screen.getByText('Basic')).toBeInTheDocument();
      // "Darken" appears as both group label and option
      const darkenElements = screen.getAllByText('Darken');
      expect(darkenElements.length).toBeGreaterThanOrEqual(1);
    });

    it('renders options within groups', () => {
      renderWithTheme(<Select options={groupedOptions} />);
      fireEvent.click(screen.getByRole('combobox'));

      expect(screen.getByText('Normal')).toBeInTheDocument();
      expect(screen.getByText('Dissolve')).toBeInTheDocument();

      // "Multiply" appears as option, "Darken" appears as both group label and option
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(4);
    });

    it('group labels are not selectable', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Select options={groupedOptions} onChange={handleChange} />
      );
      fireEvent.click(screen.getByRole('combobox'));

      // Group labels are rendered as div, not as option role
      const basicLabel = screen.getByText('Basic');
      fireEvent.click(basicLabel);

      // Should not have called onChange since group labels aren't options
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has role="combobox" on trigger', () => {
      renderWithTheme(<Select options={basicOptions} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('has aria-haspopup="listbox"', () => {
      renderWithTheme(<Select options={basicOptions} />);
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-haspopup',
        'listbox'
      );
    });

    it('has aria-expanded reflecting open state', () => {
      renderWithTheme(<Select options={basicOptions} />);
      const trigger = screen.getByRole('combobox');

      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-invalid when error', () => {
      renderWithTheme(<Select options={basicOptions} error />);
      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('options have role="option"', () => {
      renderWithTheme(<Select options={basicOptions} />);
      fireEvent.click(screen.getByRole('combobox'));

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });

    it('selected option has aria-selected', () => {
      renderWithTheme(<Select options={basicOptions} value="multiply" />);
      fireEvent.click(screen.getByRole('combobox'));

      const options = screen.getAllByRole('option');
      const multiplyOption = options.find(opt =>
        within(opt).queryByText('Multiply')
      );
      expect(multiplyOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Error State', () => {
    it('shows error message', () => {
      renderWithTheme(
        <Select
          options={basicOptions}
          error
          errorMessage="Selection required"
        />
      );
      expect(screen.getByText('Selection required')).toBeInTheDocument();
    });

    it('shows helper text when no error', () => {
      renderWithTheme(
        <Select options={basicOptions} helperText="Pick a blend mode" />
      );
      expect(screen.getByText('Pick a blend mode')).toBeInTheDocument();
    });
  });

  describe('Full Width', () => {
    it('stretches the container when fullWidth', () => {
      renderWithTheme(
        <Select options={basicOptions} fullWidth testId="fw-select" />
      );
      expect(screen.getByTestId('fw-select')).toHaveStyle({ width: '100%' });
    });

    it('stretches the trigger when fullWidth', () => {
      renderWithTheme(<Select options={basicOptions} fullWidth />);
      expect(screen.getByRole('combobox')).toHaveStyle({ width: '100%' });
    });

    it('does not stretch the container by default', () => {
      renderWithTheme(
        <Select options={basicOptions} testId="default-select" />
      );
      expect(screen.getByTestId('default-select')).not.toHaveStyle({
        width: '100%',
      });
    });
  });

  describe('Dropdown Sizing', () => {
    it('sizes the open dropdown to its content', () => {
      renderWithTheme(<Select options={basicOptions} />);
      fireEvent.click(screen.getByRole('combobox'));
      // `width: max-content` lets the dropdown grow past a narrow trigger so
      // long option labels are never clipped.
      expect(screen.getByRole('listbox')).toHaveStyle({
        width: 'max-content',
      });
    });

    it('respects minDropdownWidth as a floor', () => {
      renderWithTheme(<Select options={basicOptions} minDropdownWidth={300} />);
      fireEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toHaveStyle({ minWidth: '300px' });
    });

    it('clamps the dropdown max width to the viewport', () => {
      renderWithTheme(<Select options={basicOptions} />);
      fireEvent.click(screen.getByRole('combobox'));
      // jsdom reports innerWidth 1024 and a zeroed trigger rect, so the max
      // width is the viewport minus the 8px margin.
      expect(screen.getByRole('listbox')).toHaveStyle({ maxWidth: '1016px' });
    });
  });
});
