import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from '@/tests/testUtils';
import { Avatar, getAvatarInitials } from './Avatar';

describe('Avatar', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(<Avatar testId="avatar" name="Alice" />);
      const el = screen.getByTestId('avatar');
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute('data-size', 'md');
      expect(el).toHaveAttribute('data-shape', 'circle');
    });

    it('renders the image when src is provided', () => {
      renderWithTheme(
        <Avatar testId="avatar" src="/foo.png" name="Alice Wong" />
      );
      const img = screen.getByTestId('avatar').querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.getAttribute('src')).toBe('/foo.png');
      expect(img?.getAttribute('data-loaded')).toBe('true');
    });

    it('falls back to initials on image error', () => {
      renderWithTheme(
        <Avatar testId="avatar" src="/broken.png" name="Alice Wong" />
      );
      const img = screen.getByTestId('avatar').querySelector('img');
      expect(img).not.toBeNull();
      fireEvent.error(img as HTMLImageElement);
      expect(img?.getAttribute('data-loaded')).toBe('false');
      expect(screen.getByTestId('avatar')).toHaveTextContent('AW');
    });

    it('renders initials immediately when no src is provided', () => {
      renderWithTheme(<Avatar testId="avatar" name="Sebastian Kowalski" />);
      expect(screen.getByTestId('avatar')).toHaveTextContent('SK');
    });

    it('renders the icon fallback when there is no name and no src', () => {
      renderWithTheme(<Avatar testId="avatar" />);
      const svg = screen.getByTestId('avatar').querySelector('svg');
      expect(svg).not.toBeNull();
    });

    it('uses a custom fallback icon when provided', () => {
      renderWithTheme(
        <Avatar
          testId="avatar"
          fallbackIcon={<span data-testid="custom-icon">x</span>}
        />
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('forwards a custom className', () => {
      renderWithTheme(
        <Avatar testId="avatar" name="A" className="my-avatar" />
      );
      expect(screen.getByTestId('avatar').className).toContain('my-avatar');
    });
  });

  describe('Initials', () => {
    it('uppercases a single-name initial pair', () => {
      expect(getAvatarInitials('alice')).toBe('AL');
    });

    it('combines first + last word for two-word names', () => {
      expect(getAvatarInitials('Alice Wong')).toBe('AW');
    });

    it('uses first + last word only for three-word names', () => {
      expect(getAvatarInitials('Mary Anne Smith')).toBe('MS');
    });

    it('returns an empty string for an empty name', () => {
      expect(getAvatarInitials('   ')).toBe('');
    });

    it('explicit `initials` prop overrides the name-derived value', () => {
      renderWithTheme(
        <Avatar testId="avatar" name="Alice Wong" initials="QQ" />
      );
      expect(screen.getByTestId('avatar')).toHaveTextContent('QQ');
    });

    it('truncates explicit initials to 2 characters and uppercases them', () => {
      renderWithTheme(<Avatar testId="avatar" initials="abcdef" />);
      expect(screen.getByTestId('avatar')).toHaveTextContent('AB');
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
    it('writes the size to a data attribute for every size value', () => {
      for (const size of sizes) {
        const { unmount } = renderWithTheme(
          <Avatar testId={`avatar-${size}`} size={size} name="A" />
        );
        expect(screen.getByTestId(`avatar-${size}`)).toHaveAttribute(
          'data-size',
          size
        );
        unmount();
      }
    });

    it('produces a different recipe class per size', () => {
      const { rerender } = renderWithTheme(
        <Avatar testId="avatar" size="xs" name="A" />
      );
      const xs = screen.getByTestId('avatar').className;
      rerender(<Avatar testId="avatar" size="xxl" name="A" />);
      const xxl = screen.getByTestId('avatar').className;
      expect(xs).not.toBe(xxl);
    });
  });

  describe('Shapes', () => {
    const shapes = ['circle', 'square', 'rounded'] as const;
    it('writes the shape to a data attribute for every shape value', () => {
      for (const shape of shapes) {
        const { unmount } = renderWithTheme(
          <Avatar testId={`avatar-${shape}`} shape={shape} name="A" />
        );
        expect(screen.getByTestId(`avatar-${shape}`)).toHaveAttribute(
          'data-shape',
          shape
        );
        unmount();
      }
    });
  });

  describe('Status', () => {
    const statuses = ['online', 'away', 'busy', 'offline'] as const;
    it('renders a status dot for every status value', () => {
      for (const status of statuses) {
        const { unmount } = renderWithTheme(
          <Avatar testId={`avatar-${status}`} status={status} name="A" />
        );
        const dot = screen
          .getByTestId(`avatar-${status}`)
          .querySelector(`[data-status="${status}"]`);
        expect(dot).not.toBeNull();
        expect(dot).toHaveAttribute(
          'aria-label',
          expect.stringContaining('Status')
        );
        unmount();
      }
    });

    it('does not render a status dot when status is omitted', () => {
      renderWithTheme(<Avatar testId="avatar" name="A" />);
      expect(
        screen.getByTestId('avatar').querySelector('[data-status]')
      ).toBeNull();
    });
  });

  describe('Auto color', () => {
    it('produces the same background for the same name', () => {
      const { rerender } = renderWithTheme(
        <Avatar testId="avatar-1" name="Alice" />
      );
      const first = screen.getByTestId('avatar-1').getAttribute('style');
      rerender(<Avatar testId="avatar-1" name="Alice" />);
      const second = screen.getByTestId('avatar-1').getAttribute('style');
      expect(first).toBe(second);
    });

    it('produces different backgrounds for different names', () => {
      // Names chosen to land on different palette buckets via the hash.
      renderWithTheme(
        <>
          <Avatar testId="a" name="Alice" />
          <Avatar testId="b" name="Bob" />
          <Avatar testId="c" name="Carol" />
          <Avatar testId="d" name="Dave" />
          <Avatar testId="e" name="Eve" />
          <Avatar testId="f" name="Frank" />
        </>
      );
      const styles = ['a', 'b', 'c', 'd', 'e', 'f'].map(
        id => screen.getByTestId(id).getAttribute('style') ?? ''
      );
      const unique = new Set(styles);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe('Bordered', () => {
    it('produces a different recipe class when bordered', () => {
      const { rerender } = renderWithTheme(<Avatar testId="avatar" name="A" />);
      const plain = screen.getByTestId('avatar').className;
      rerender(<Avatar testId="avatar" name="A" bordered />);
      const bordered = screen.getByTestId('avatar').className;
      expect(plain).not.toBe(bordered);
    });
  });

  describe('Interactions', () => {
    it('does not have button role unless onClick is provided', () => {
      renderWithTheme(<Avatar testId="avatar" name="A" />);
      const el = screen.getByTestId('avatar');
      expect(el).not.toHaveAttribute('role');
      expect(el).not.toHaveAttribute('tabIndex');
    });

    it('becomes a button when onClick is provided', () => {
      renderWithTheme(
        <Avatar testId="avatar" name="A" onClick={() => undefined} />
      );
      const el = screen.getByTestId('avatar');
      expect(el).toHaveAttribute('role', 'button');
      expect(el).toHaveAttribute('tabIndex', '0');
    });

    it('fires onClick on mouse click', async () => {
      const onClick = vi.fn();
      renderWithTheme(<Avatar testId="avatar" name="A" onClick={onClick} />);
      await userEvent.click(screen.getByTestId('avatar'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('fires onClick on Enter key', () => {
      const onClick = vi.fn();
      renderWithTheme(<Avatar testId="avatar" name="A" onClick={onClick} />);
      const el = screen.getByTestId('avatar');
      fireEvent.keyDown(el, { key: 'Enter' });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('fires onClick on Space key', () => {
      const onClick = vi.fn();
      renderWithTheme(<Avatar testId="avatar" name="A" onClick={onClick} />);
      const el = screen.getByTestId('avatar');
      fireEvent.keyDown(el, { key: ' ' });
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClick on other keys', () => {
      const onClick = vi.fn();
      renderWithTheme(<Avatar testId="avatar" name="A" onClick={onClick} />);
      fireEvent.keyDown(screen.getByTestId('avatar'), { key: 'Tab' });
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('uses the name as accessible label when no aria-label is provided', () => {
      renderWithTheme(<Avatar testId="avatar" name="Alice Wong" />);
      expect(screen.getByTestId('avatar')).toHaveAttribute(
        'aria-label',
        'Alice Wong'
      );
    });

    it('falls back to alt when no name is provided', () => {
      renderWithTheme(
        <Avatar testId="avatar" src="/foo.png" alt="Profile picture" />
      );
      expect(screen.getByTestId('avatar')).toHaveAttribute(
        'aria-label',
        'Profile picture'
      );
    });

    it('explicit aria-label overrides name and alt', () => {
      renderWithTheme(
        <Avatar
          testId="avatar"
          name="Alice"
          alt="Pic"
          aria-label="Custom label"
        />
      );
      expect(screen.getByTestId('avatar')).toHaveAttribute(
        'aria-label',
        'Custom label'
      );
    });

    it('image alt falls back to the name when not provided', () => {
      renderWithTheme(
        <Avatar testId="avatar" src="/foo.png" name="Alice Wong" />
      );
      expect(screen.getByTestId('avatar').querySelector('img')).toHaveAttribute(
        'alt',
        'Alice Wong'
      );
    });
  });
});
