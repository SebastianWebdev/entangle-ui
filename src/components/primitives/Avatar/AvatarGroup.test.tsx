import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { Avatar } from './Avatar';
import { AvatarGroup } from './AvatarGroup';

describe('AvatarGroup', () => {
  describe('Rendering', () => {
    it('renders all children when count is below max', () => {
      renderWithTheme(
        <AvatarGroup testId="group" max={4}>
          <Avatar testId="a" name="Alice" />
          <Avatar testId="b" name="Bob" />
          <Avatar testId="c" name="Carol" />
        </AvatarGroup>
      );
      expect(screen.getByTestId('a')).toBeInTheDocument();
      expect(screen.getByTestId('b')).toBeInTheDocument();
      expect(screen.getByTestId('c')).toBeInTheDocument();
      expect(
        screen.getByTestId('group').querySelector('[data-overflow="true"]')
      ).toBeNull();
    });

    it('renders all children when count equals max', () => {
      renderWithTheme(
        <AvatarGroup testId="group" max={3}>
          <Avatar testId="a" name="Alice" />
          <Avatar testId="b" name="Bob" />
          <Avatar testId="c" name="Carol" />
        </AvatarGroup>
      );
      expect(screen.getByTestId('a')).toBeInTheDocument();
      expect(screen.getByTestId('b')).toBeInTheDocument();
      expect(screen.getByTestId('c')).toBeInTheDocument();
      expect(
        screen.getByTestId('group').querySelector('[data-overflow="true"]')
      ).toBeNull();
    });

    it('renders the first `max` children plus a +N indicator on overflow', () => {
      renderWithTheme(
        <AvatarGroup testId="group" max={2}>
          <Avatar testId="a" name="Alice" />
          <Avatar testId="b" name="Bob" />
          <Avatar testId="c" name="Carol" />
          <Avatar testId="d" name="Dave" />
          <Avatar testId="e" name="Eve" />
        </AvatarGroup>
      );
      expect(screen.getByTestId('a')).toBeInTheDocument();
      expect(screen.getByTestId('b')).toBeInTheDocument();
      expect(screen.queryByTestId('c')).toBeNull();
      expect(screen.queryByTestId('d')).toBeNull();
      expect(screen.queryByTestId('e')).toBeNull();
      const overflow = screen
        .getByTestId('group')
        .querySelector('[data-overflow="true"]');
      expect(overflow).not.toBeNull();
      expect(overflow).toHaveTextContent('+3');
    });

    it('ignores non-Avatar children', () => {
      renderWithTheme(
        <AvatarGroup testId="group">
          <Avatar testId="a" name="A" />
          {/* Plain string children should be filtered out */}
          plain text
          <span>raw</span>
          <Avatar testId="b" name="B" />
        </AvatarGroup>
      );
      // Both real avatars render, the overflow indicator does not appear.
      expect(screen.getByTestId('a')).toBeInTheDocument();
      expect(screen.getByTestId('b')).toBeInTheDocument();
      expect(
        screen.getByTestId('group').querySelector('[data-overflow="true"]')
      ).toBeNull();
    });
  });

  describe('Spacing', () => {
    it('applies a numeric spacing value as pixels', () => {
      renderWithTheme(
        <AvatarGroup testId="group" spacing={-12}>
          <Avatar name="A" />
          <Avatar name="B" />
        </AvatarGroup>
      );
      const inline = screen.getByTestId('group').getAttribute('style') ?? '';
      expect(inline).toContain('-12px');
    });

    it('passes through a string spacing value', () => {
      renderWithTheme(
        <AvatarGroup testId="group" spacing="-0.5rem">
          <Avatar name="A" />
          <Avatar name="B" />
        </AvatarGroup>
      );
      const inline = screen.getByTestId('group').getAttribute('style') ?? '';
      expect(inline).toContain('-0.5rem');
    });
  });

  describe('Propagation', () => {
    it('propagates size to children', () => {
      renderWithTheme(
        <AvatarGroup testId="group" size="xl">
          <Avatar testId="a" name="A" size="xs" />
          <Avatar testId="b" name="B" />
        </AvatarGroup>
      );
      expect(screen.getByTestId('a')).toHaveAttribute('data-size', 'xl');
      expect(screen.getByTestId('b')).toHaveAttribute('data-size', 'xl');
    });

    it('propagates bordered=true by default', () => {
      const { rerender } = renderWithTheme(
        <AvatarGroup testId="group">
          <Avatar testId="a" name="A" />
        </AvatarGroup>
      );
      const borderedClass = screen.getByTestId('a').className;
      rerender(
        <AvatarGroup testId="group" bordered={false}>
          <Avatar testId="a" name="A" />
        </AvatarGroup>
      );
      const plainClass = screen.getByTestId('a').className;
      expect(borderedClass).not.toBe(plainClass);
    });
  });

  describe('Overflow tooltip', () => {
    it('exposes hidden names via the +N indicator wrapper when tooltip is enabled', () => {
      renderWithTheme(
        <AvatarGroup testId="group" max={1} showOverflowTooltip>
          <Avatar testId="a" name="Alice" />
          <Avatar testId="b" name="Bob" />
          <Avatar testId="c" name="Carol" />
        </AvatarGroup>
      );
      const overflow = screen
        .getByTestId('group')
        .querySelector('[data-overflow="true"]');
      expect(overflow).not.toBeNull();
      // When showOverflowTooltip is true and there are hidden names, the
      // overflow indicator is wrapped by a Tooltip trigger element. The
      // direct parent of the +N span is therefore not the group root.
      expect(overflow?.parentElement).not.toBe(screen.getByTestId('group'));
    });

    it('renders the +N indicator directly inside the group when tooltip is disabled', () => {
      renderWithTheme(
        <AvatarGroup testId="group" max={1} showOverflowTooltip={false}>
          <Avatar name="Alice" />
          <Avatar name="Bob" />
          <Avatar name="Carol" />
        </AvatarGroup>
      );
      const overflow = screen
        .getByTestId('group')
        .querySelector('[data-overflow="true"]');
      expect(overflow).not.toBeNull();
      expect(overflow?.parentElement).toBe(screen.getByTestId('group'));
    });

    it('renders the +N indicator without a tooltip when no hidden names exist', () => {
      renderWithTheme(
        <AvatarGroup testId="group" max={1}>
          <Avatar src="/a.png" />
          <Avatar src="/b.png" />
          <Avatar src="/c.png" />
        </AvatarGroup>
      );
      const overflow = screen
        .getByTestId('group')
        .querySelector('[data-overflow="true"]');
      expect(overflow).not.toBeNull();
      expect(overflow?.parentElement).toBe(screen.getByTestId('group'));
    });

    it('overflow indicator has an accessible label with the count', () => {
      renderWithTheme(
        <AvatarGroup testId="group" max={1} showOverflowTooltip={false}>
          <Avatar name="A" />
          <Avatar name="B" />
          <Avatar name="C" />
          <Avatar name="D" />
        </AvatarGroup>
      );
      const overflow = screen
        .getByTestId('group')
        .querySelector('[data-overflow="true"]');
      expect(overflow).toHaveAttribute('aria-label', '3 more');
    });
  });
});
