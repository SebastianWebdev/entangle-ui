import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Switch } from './Switch';

describe('Switch', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders with label', () => {
      renderWithTheme(<Switch label="Show Grid" />);
      expect(screen.getByText('Show Grid')).toBeInTheDocument();
    });

    it('renders without label', () => {
      renderWithTheme(<Switch testId="bare-switch" />);
      expect(screen.getByTestId('bare-switch')).toBeInTheDocument();
    });

    it('applies data-testid via testId prop', () => {
      renderWithTheme(<Switch testId="my-switch" />);
      expect(screen.getByTestId('my-switch')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('renders on state', () => {
      renderWithTheme(<Switch checked label="On" />);
      expect(screen.getByRole('switch')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    it('renders off state', () => {
      renderWithTheme(<Switch checked={false} label="Off" />);
      expect(screen.getByRole('switch')).toHaveAttribute(
        'aria-checked',
        'false'
      );
    });

    it('renders disabled state', () => {
      renderWithTheme(<Switch disabled label="Disabled" />);
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('renders error state', () => {
      renderWithTheme(
        <Switch error errorMessage="Error occurred" label="Error" />
      );
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });
  });

  describe('Controlled', () => {
    it('respects checked prop', () => {
      renderWithTheme(<Switch checked />);
      expect(screen.getByRole('switch')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    it('calls onChange with toggled value when clicked', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Switch checked={false} onChange={handleChange} label="Toggle" />
      );

      fireEvent.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange with false when turning off', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Switch checked onChange={handleChange} label="Toggle" />
      );

      fireEvent.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Uncontrolled', () => {
    it('toggles from defaultChecked=false', () => {
      renderWithTheme(<Switch defaultChecked={false} label="Uncontrolled" />);
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(switchEl);
      expect(switchEl).toHaveAttribute('aria-checked', 'true');
    });

    it('starts on with defaultChecked=true', () => {
      renderWithTheme(<Switch defaultChecked label="Starts on" />);
      expect(screen.getByRole('switch')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });
  });

  describe('Keyboard', () => {
    it('toggles on Space key', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(
        <Switch checked={false} onChange={handleChange} label="Space toggle" />
      );

      await user.tab();
      expect(screen.getByRole('switch')).toHaveFocus();

      await user.keyboard('{ }');
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('does not toggle when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      renderWithTheme(
        <Switch
          checked={false}
          onChange={handleChange}
          disabled
          label="Disabled"
        />
      );

      const switchEl = screen.getByRole('switch');
      switchEl.focus();
      await user.keyboard('{ }');
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('receives focus via Tab key', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Switch label="Focusable" />);

      await user.tab();
      expect(screen.getByRole('switch')).toHaveFocus();
    });
  });

  describe('Label', () => {
    it('clicking label toggles switch', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <Switch checked={false} onChange={handleChange} label="Click label" />
      );

      fireEvent.click(screen.getByText('Click label'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('renders label on the right by default', () => {
      renderWithTheme(<Switch label="Right label" />);
      expect(screen.getByText('Right label')).toBeInTheDocument();
    });

    it('renders label on the left', () => {
      renderWithTheme(<Switch label="Left label" labelPosition="left" />);
      expect(screen.getByText('Left label')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct switch role', () => {
      renderWithTheme(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('has aria-checked attribute', () => {
      renderWithTheme(<Switch checked />);
      expect(screen.getByRole('switch')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    it('has aria-disabled when disabled', () => {
      renderWithTheme(<Switch disabled />);
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('has aria-describedby pointing to helper text', () => {
      renderWithTheme(
        <Switch
          id="test-sw"
          helperText="Toggle this setting"
          label="With helper"
        />
      );
      const switchEl = screen.getByRole('switch');
      expect(switchEl).toHaveAttribute('aria-describedby');
      expect(screen.getByText('Toggle this setting')).toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('displays helper text', () => {
      renderWithTheme(<Switch helperText="Help text" label="Helper" />);
      expect(screen.getByText('Help text')).toBeInTheDocument();
    });

    it('displays error message over helper text when error', () => {
      renderWithTheme(
        <Switch
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
        <Switch disabled onChange={handleChange} label="Disabled" />
      );

      fireEvent.click(screen.getByRole('switch'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });
});
