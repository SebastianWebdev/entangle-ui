import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders with label', () => {
      renderWithTheme(<Checkbox label="Enable shadows" />);
      expect(screen.getByText('Enable shadows')).toBeInTheDocument();
    });

    it('renders without label', () => {
      renderWithTheme(<Checkbox testId="bare-checkbox" />);
      expect(screen.getByTestId('bare-checkbox')).toBeInTheDocument();
    });

    it('applies data-testid via testId prop', () => {
      renderWithTheme(<Checkbox testId="my-checkbox" />);
      expect(screen.getByTestId('my-checkbox')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('renders checked state', () => {
      renderWithTheme(<Checkbox checked label="Checked" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    it('renders unchecked state', () => {
      renderWithTheme(<Checkbox checked={false} label="Unchecked" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-checked',
        'false'
      );
    });

    it('renders disabled state', () => {
      renderWithTheme(<Checkbox disabled label="Disabled" />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('renders error state with aria-invalid', () => {
      renderWithTheme(<Checkbox error label="Error" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });
  });

  describe('Controlled', () => {
    it('respects checked prop', () => {
      renderWithTheme(<Checkbox checked />);
      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    it('calls onChange with new value when clicked', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Checkbox checked={false} onChange={handleChange} label="Toggle" />
      );

      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange with false when unchecking', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Checkbox checked onChange={handleChange} label="Toggle" />
      );

      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Uncontrolled', () => {
    it('toggles when using defaultChecked', () => {
      renderWithTheme(<Checkbox defaultChecked={false} label="Uncontrolled" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });

    it('starts checked with defaultChecked=true', () => {
      renderWithTheme(<Checkbox defaultChecked label="Starts checked" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });
  });

  describe('Indeterminate', () => {
    it('shows indeterminate state with aria-checked="mixed"', () => {
      renderWithTheme(<Checkbox indeterminate label="Indeterminate" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-checked',
        'mixed'
      );
    });
  });

  describe('Keyboard', () => {
    it('toggles on Space key', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(
        <Checkbox
          checked={false}
          onChange={handleChange}
          label="Space toggle"
        />
      );

      await user.tab();
      expect(screen.getByRole('checkbox')).toHaveFocus();

      await user.keyboard('{ }');
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('does not toggle when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(
        <Checkbox
          checked={false}
          onChange={handleChange}
          disabled
          label="Disabled"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      await user.keyboard('{ }');
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('receives focus via Tab key', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Checkbox label="Focusable" />);

      await user.tab();
      expect(screen.getByRole('checkbox')).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has correct checkbox role', () => {
      renderWithTheme(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('has aria-checked attribute', () => {
      renderWithTheme(<Checkbox checked />);
      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    it('has aria-disabled when disabled', () => {
      renderWithTheme(<Checkbox disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('has aria-invalid when error', () => {
      renderWithTheme(<Checkbox error />);
      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('has aria-describedby pointing to helper text', () => {
      renderWithTheme(
        <Checkbox
          id="test-cb"
          helperText="This is helper text"
          label="With helper"
        />
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby');
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });

    it('shows error message when error is true', () => {
      renderWithTheme(
        <Checkbox
          error
          errorMessage="This field is required"
          label="Required"
        />
      );
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('Label Position', () => {
    it('renders label on the right by default', () => {
      renderWithTheme(<Checkbox label="Right label" />);
      expect(screen.getByText('Right label')).toBeInTheDocument();
    });

    it('renders label on the left', () => {
      renderWithTheme(<Checkbox label="Left label" labelPosition="left" />);
      expect(screen.getByText('Left label')).toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('displays helper text', () => {
      renderWithTheme(<Checkbox helperText="Help text" label="Helper" />);
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });

    it('displays error message over helper text when error', () => {
      renderWithTheme(
        <Checkbox
          error
          helperText="Help text"
          errorMessage="Error message"
          label="Error"
        />
      );
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    });
  });

  describe('Click interaction', () => {
    it('does not fire onChange when disabled and clicked', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Checkbox disabled onChange={handleChange} label="Disabled" />
      );

      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('clicking label toggles checkbox', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Checkbox checked={false} onChange={handleChange} label="Click label" />
      );

      fireEvent.click(screen.getByText('Click label'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });
});
