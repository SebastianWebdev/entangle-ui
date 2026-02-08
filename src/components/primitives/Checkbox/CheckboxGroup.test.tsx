import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Checkbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

describe('CheckboxGroup', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      renderWithTheme(
        <CheckboxGroup>
          <Checkbox value="a" label="Option A" />
          <Checkbox value="b" label="Option B" />
        </CheckboxGroup>
      );

      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
    });

    it('renders group label', () => {
      renderWithTheme(
        <CheckboxGroup label="Settings">
          <Checkbox value="a" label="Option A" />
        </CheckboxGroup>
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('has role="group"', () => {
      renderWithTheme(
        <CheckboxGroup label="Group" testId="group">
          <Checkbox value="a" label="A" />
        </CheckboxGroup>
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('applies data-testid via testId prop', () => {
      renderWithTheme(
        <CheckboxGroup testId="my-group">
          <Checkbox value="a" label="A" />
        </CheckboxGroup>
      );

      expect(screen.getByTestId('my-group')).toBeInTheDocument();
    });
  });

  describe('Controlled', () => {
    it('selected values match value prop', () => {
      renderWithTheme(
        <CheckboxGroup value={['a']}>
          <Checkbox value="a" label="Option A" />
          <Checkbox value="b" label="Option B" />
        </CheckboxGroup>
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true');
      expect(checkboxes[1]).toHaveAttribute('aria-checked', 'false');
    });

    it('fires onChange with updated array when child toggled', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <CheckboxGroup value={['a']} onChange={handleChange}>
          <Checkbox value="a" label="Option A" />
          <Checkbox value="b" label="Option B" />
        </CheckboxGroup>
      );

      // Click option B to add it
      fireEvent.click(screen.getByLabelText('Option B'));
      expect(handleChange).toHaveBeenCalledWith(['a', 'b']);
    });

    it('fires onChange removing value when unchecking', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <CheckboxGroup value={['a', 'b']} onChange={handleChange}>
          <Checkbox value="a" label="Option A" />
          <Checkbox value="b" label="Option B" />
        </CheckboxGroup>
      );

      // Click option A to remove it
      fireEvent.click(screen.getByLabelText('Option A'));
      expect(handleChange).toHaveBeenCalledWith(['b']);
    });
  });

  describe('Uncontrolled', () => {
    it('uses defaultValue for initial state', () => {
      renderWithTheme(
        <CheckboxGroup defaultValue={['b']}>
          <Checkbox value="a" label="Option A" />
          <Checkbox value="b" label="Option B" />
        </CheckboxGroup>
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toHaveAttribute('aria-checked', 'false');
      expect(checkboxes[1]).toHaveAttribute('aria-checked', 'true');
    });

    it('toggles values internally', () => {
      renderWithTheme(
        <CheckboxGroup defaultValue={[]}>
          <Checkbox value="a" label="Option A" />
          <Checkbox value="b" label="Option B" />
        </CheckboxGroup>
      );

      const optionA = screen.getByLabelText('Option A');
      fireEvent.click(optionA);
      expect(
        screen.getByRole('checkbox', { name: 'Option A' })
      ).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Disabled', () => {
    it('propagates disabled to all children', () => {
      renderWithTheme(
        <CheckboxGroup disabled>
          <Checkbox value="a" label="Option A" />
          <Checkbox value="b" label="Option B" />
        </CheckboxGroup>
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeDisabled();
      expect(checkboxes[1]).toBeDisabled();
    });
  });

  describe('Direction', () => {
    it('renders in column direction by default', () => {
      renderWithTheme(
        <CheckboxGroup testId="col-group">
          <Checkbox value="a" label="A" />
          <Checkbox value="b" label="B" />
        </CheckboxGroup>
      );

      expect(screen.getByTestId('col-group')).toBeInTheDocument();
    });

    it('renders in row direction', () => {
      renderWithTheme(
        <CheckboxGroup direction="row" testId="row-group">
          <Checkbox value="a" label="A" />
          <Checkbox value="b" label="B" />
        </CheckboxGroup>
      );

      expect(screen.getByTestId('row-group')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="group" with aria-labelledby', () => {
      renderWithTheme(
        <CheckboxGroup label="Preferences">
          <Checkbox value="a" label="A" />
        </CheckboxGroup>
      );

      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('aria-labelledby');
    });

    it('displays helper text', () => {
      renderWithTheme(
        <CheckboxGroup helperText="Select at least one">
          <Checkbox value="a" label="A" />
        </CheckboxGroup>
      );

      expect(screen.getByText('Select at least one')).toBeInTheDocument();
    });

    it('displays error message when error is true', () => {
      renderWithTheme(
        <CheckboxGroup error errorMessage="Required field">
          <Checkbox value="a" label="A" />
        </CheckboxGroup>
      );

      expect(screen.getByText('Required field')).toBeInTheDocument();
    });
  });
});
