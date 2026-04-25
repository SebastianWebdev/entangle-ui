import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormEvent } from 'react';
import { renderWithTheme } from '@/tests/testUtils';
import { Alert } from './Alert';
import { AlertTitle } from './AlertTitle';
import { AlertDescription } from './AlertDescription';
import { AlertActions } from './AlertActions';

describe('Alert', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Alert testId="alert">Heads up</Alert>);
      const el = screen.getByTestId('alert');
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute('data-variant', 'info');
      expect(el).toHaveAttribute('data-appearance', 'subtle');
    });

    it('renders all variants with correct data attribute', () => {
      const variants = [
        'info',
        'success',
        'warning',
        'error',
        'neutral',
      ] as const;
      for (const variant of variants) {
        const { unmount } = renderWithTheme(
          <Alert testId={`alert-${variant}`} variant={variant}>
            x
          </Alert>
        );
        expect(screen.getByTestId(`alert-${variant}`)).toHaveAttribute(
          'data-variant',
          variant
        );
        unmount();
      }
    });

    it('renders all appearances with correct data attribute', () => {
      const appearances = ['subtle', 'solid', 'outline'] as const;
      for (const appearance of appearances) {
        const { unmount } = renderWithTheme(
          <Alert testId={`alert-${appearance}`} appearance={appearance}>
            x
          </Alert>
        );
        expect(screen.getByTestId(`alert-${appearance}`)).toHaveAttribute(
          'data-appearance',
          appearance
        );
        unmount();
      }
    });

    it('produces a different recipe class per appearance', () => {
      const { rerender } = renderWithTheme(
        <Alert testId="alert" appearance="subtle">
          x
        </Alert>
      );
      const subtleClass = screen.getByTestId('alert').className;
      rerender(
        <Alert testId="alert" appearance="solid">
          x
        </Alert>
      );
      const solidClass = screen.getByTestId('alert').className;
      rerender(
        <Alert testId="alert" appearance="outline">
          x
        </Alert>
      );
      const outlineClass = screen.getByTestId('alert').className;
      expect(subtleClass).not.toBe(solidClass);
      expect(subtleClass).not.toBe(outlineClass);
      expect(solidClass).not.toBe(outlineClass);
    });

    it('forwards custom className', () => {
      renderWithTheme(
        <Alert testId="alert" className="my-alert">
          x
        </Alert>
      );
      expect(screen.getByTestId('alert').className).toContain('my-alert');
    });

    it('renders the title prop', () => {
      renderWithTheme(
        <Alert testId="alert" title="Heads up">
          Body
        </Alert>
      );
      expect(screen.getByText('Heads up')).toBeInTheDocument();
    });

    it('renders compound Alert.Title children', () => {
      renderWithTheme(
        <Alert testId="alert">
          <Alert.Title>Heads up</Alert.Title>
          <Alert.Description>Some description</Alert.Description>
        </Alert>
      );
      expect(screen.getByText('Heads up')).toBeInTheDocument();
      expect(screen.getByText('Some description')).toBeInTheDocument();
    });

    it('renders string children as description (no title)', () => {
      renderWithTheme(<Alert testId="alert">Just a description</Alert>);
      expect(screen.getByText('Just a description')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders a default icon for info variant', () => {
      renderWithTheme(
        <Alert testId="alert" variant="info">
          x
        </Alert>
      );
      const icon = screen
        .getByTestId('alert')
        .querySelector('[data-alert-icon]');
      expect(icon).not.toBeNull();
    });

    it('renders a default icon for success variant', () => {
      renderWithTheme(
        <Alert testId="alert" variant="success">
          x
        </Alert>
      );
      expect(
        screen.getByTestId('alert').querySelector('[data-alert-icon]')
      ).not.toBeNull();
    });

    it('renders a default icon for warning variant', () => {
      renderWithTheme(
        <Alert testId="alert" variant="warning">
          x
        </Alert>
      );
      expect(
        screen.getByTestId('alert').querySelector('[data-alert-icon]')
      ).not.toBeNull();
    });

    it('renders a default icon for error variant', () => {
      renderWithTheme(
        <Alert testId="alert" variant="error">
          x
        </Alert>
      );
      expect(
        screen.getByTestId('alert').querySelector('[data-alert-icon]')
      ).not.toBeNull();
    });

    it('does not render an icon for neutral variant by default', () => {
      renderWithTheme(
        <Alert testId="alert" variant="neutral">
          x
        </Alert>
      );
      expect(
        screen.getByTestId('alert').querySelector('[data-alert-icon]')
      ).toBeNull();
    });

    it('hides the icon when icon={false}', () => {
      renderWithTheme(
        <Alert testId="alert" icon={false}>
          x
        </Alert>
      );
      expect(
        screen.getByTestId('alert').querySelector('[data-alert-icon]')
      ).toBeNull();
    });

    it('uses a custom icon when icon={<CustomIcon/>}', () => {
      renderWithTheme(
        <Alert testId="alert" icon={<span data-testid="custom-icon">!</span>}>
          x
        </Alert>
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Close button', () => {
    it('does not render the close button when onClose is omitted', () => {
      renderWithTheme(<Alert testId="alert">x</Alert>);
      expect(
        screen.queryByRole('button', { name: 'Close alert' })
      ).not.toBeInTheDocument();
    });

    it('renders the close button when onClose is provided', () => {
      renderWithTheme(
        <Alert testId="alert" onClose={() => undefined}>
          x
        </Alert>
      );
      expect(
        screen.getByRole('button', { name: 'Close alert' })
      ).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      renderWithTheme(
        <Alert testId="alert" onClose={onClose}>
          x
        </Alert>
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Close alert' })
      );
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not submit a surrounding form when clicked', async () => {
      const onSubmit = vi.fn((e: FormEvent) => {
        e.preventDefault();
      });
      const onClose = vi.fn();
      renderWithTheme(
        <form onSubmit={onSubmit}>
          <Alert testId="alert" onClose={onClose}>
            x
          </Alert>
          <button type="submit">Save</button>
        </form>
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Close alert' })
      );
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('uses role="alert" for error variant', () => {
      renderWithTheme(
        <Alert testId="alert" variant="error">
          Boom
        </Alert>
      );
      expect(screen.getByTestId('alert')).toHaveAttribute('role', 'alert');
    });

    it('uses role="alert" for warning variant', () => {
      renderWithTheme(
        <Alert testId="alert" variant="warning">
          Heads up
        </Alert>
      );
      expect(screen.getByTestId('alert')).toHaveAttribute('role', 'alert');
    });

    it('uses role="status" for info variant', () => {
      renderWithTheme(
        <Alert testId="alert" variant="info">
          FYI
        </Alert>
      );
      expect(screen.getByTestId('alert')).toHaveAttribute('role', 'status');
    });

    it('uses role="status" for success variant', () => {
      renderWithTheme(
        <Alert testId="alert" variant="success">
          Done
        </Alert>
      );
      expect(screen.getByTestId('alert')).toHaveAttribute('role', 'status');
    });

    it('uses role="region" with aria-label for neutral variant', () => {
      renderWithTheme(
        <Alert testId="alert" variant="neutral">
          Note
        </Alert>
      );
      const el = screen.getByTestId('alert');
      expect(el).toHaveAttribute('role', 'region');
      expect(el).toHaveAttribute('aria-label');
    });

    it('close button has aria-label="Close alert"', () => {
      renderWithTheme(
        <Alert testId="alert" onClose={() => undefined}>
          x
        </Alert>
      );
      expect(
        screen.getByRole('button', { name: 'Close alert' })
      ).toBeInTheDocument();
    });
  });
});

describe('Alert.Title', () => {
  it('renders content', () => {
    renderWithTheme(<AlertTitle testId="title">Hello</AlertTitle>);
    expect(screen.getByTestId('title')).toHaveTextContent('Hello');
  });

  it('forwards custom className', () => {
    renderWithTheme(
      <AlertTitle testId="title" className="t">
        Hello
      </AlertTitle>
    );
    expect(screen.getByTestId('title').className).toContain('t');
  });

  it('is also reachable via Alert.Title', () => {
    expect(Alert.Title).toBe(AlertTitle);
  });
});

describe('Alert.Description', () => {
  it('renders content', () => {
    renderWithTheme(<AlertDescription testId="desc">Body</AlertDescription>);
    expect(screen.getByTestId('desc')).toHaveTextContent('Body');
  });

  it('forwards custom className', () => {
    renderWithTheme(
      <AlertDescription testId="desc" className="d">
        Body
      </AlertDescription>
    );
    expect(screen.getByTestId('desc').className).toContain('d');
  });

  it('is also reachable via Alert.Description', () => {
    expect(Alert.Description).toBe(AlertDescription);
  });
});

describe('Alert.Actions', () => {
  it('renders children', () => {
    renderWithTheme(
      <AlertActions testId="actions">
        <button>Retry</button>
      </AlertActions>
    );
    expect(screen.getByTestId('actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('produces a different class per align value', () => {
    const { rerender } = renderWithTheme(
      <AlertActions testId="actions" align="left">
        <button>a</button>
      </AlertActions>
    );
    const left = screen.getByTestId('actions').className;
    rerender(
      <AlertActions testId="actions" align="right">
        <button>a</button>
      </AlertActions>
    );
    const right = screen.getByTestId('actions').className;
    rerender(
      <AlertActions testId="actions" align="space-between">
        <button>a</button>
      </AlertActions>
    );
    const between = screen.getByTestId('actions').className;
    expect(left).not.toBe(right);
    expect(left).not.toBe(between);
    expect(right).not.toBe(between);
  });

  it('is also reachable via Alert.Actions', () => {
    expect(Alert.Actions).toBe(AlertActions);
  });
});
