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
    it('wraps the +N indicator in a Tooltip trigger when tooltip is enabled', () => {
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
      // The overflow span sits inside a wrapper-span that owns the spacing
      // rule; with the tooltip enabled, Tooltip injects its own trigger
      // <div> between the wrapper and the +N span.
      expect(overflow?.parentElement?.tagName).toBe('DIV');
    });

    it('renders the +N indicator without a tooltip trigger when tooltip is disabled', () => {
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
      // No tooltip → +N sits directly inside the wrapper span.
      expect(overflow?.parentElement?.tagName).toBe('SPAN');
    });

    it('skips the tooltip wrapper when no hidden names exist', () => {
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
      expect(overflow?.parentElement?.tagName).toBe('SPAN');
    });

    it('keeps the spacing wrapper as a direct child of the group regardless of tooltip', () => {
      renderWithTheme(
        <AvatarGroup testId="group" max={1} showOverflowTooltip>
          <Avatar name="Alice" />
          <Avatar name="Bob" />
          <Avatar name="Carol" />
        </AvatarGroup>
      );
      const overflow = screen
        .getByTestId('group')
        .querySelector('[data-overflow="true"]');
      // Walk up to the direct child of the group — that's the wrapper that
      // owns marginLeft via :not(:first-child). It must always be a span,
      // not Tooltip's trigger div.
      const group = screen.getByTestId('group');
      let node: HTMLElement | null = overflow as HTMLElement | null;
      while (node?.parentElement && node.parentElement !== group) {
        node = node.parentElement;
      }
      expect(node?.tagName).toBe('SPAN');
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
