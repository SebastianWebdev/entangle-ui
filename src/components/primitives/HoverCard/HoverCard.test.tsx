import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { HoverCard } from './HoverCard';

function renderHoverCard(props: Record<string, unknown> = {}) {
  return renderWithTheme(
    <HoverCard {...props}>
      <HoverCard.Trigger>
        <button>@octocat</button>
      </HoverCard.Trigger>
      <HoverCard.Content testId="hovercard">
        <p>Card content</p>
      </HoverCard.Content>
    </HoverCard>
  );
}

describe('HoverCard', () => {
  describe('Rendering', () => {
    it('renders the trigger element', () => {
      renderHoverCard();
      expect(screen.getByText('@octocat')).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      renderHoverCard();
      expect(screen.queryByText('Card content')).not.toBeInTheDocument();
    });

    it('renders content when defaultOpen', () => {
      renderHoverCard({ defaultOpen: true });
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });
  });

  describe('Hover behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('opens after openDelay on mouseenter', () => {
      renderHoverCard({ openDelay: 100, closeDelay: 50 });
      const trigger = screen.getByText('@octocat');
      act(() => {
        fireEvent.mouseEnter(trigger);
      });
      // Before delay elapses
      expect(screen.queryByText('Card content')).not.toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('closes after closeDelay when polygon disabled and pointer leaves', () => {
      renderHoverCard({
        openDelay: 0,
        closeDelay: 50,
        defaultOpen: true,
        disableSafePolygon: true,
      });
      expect(screen.getByText('Card content')).toBeInTheDocument();
      const trigger = screen.getByText('@octocat');
      act(() => {
        fireEvent.mouseLeave(trigger);
      });
      act(() => {
        vi.advanceTimersByTime(80);
      });
      expect(screen.queryByText('Card content')).not.toBeInTheDocument();
    });

    it('does not open when disabled', () => {
      renderHoverCard({ openDelay: 0, disabled: true });
      const trigger = screen.getByText('@octocat');
      act(() => {
        fireEvent.mouseEnter(trigger);
      });
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(screen.queryByText('Card content')).not.toBeInTheDocument();
    });
  });

  describe('Controlled', () => {
    it('respects controlled `open` prop', () => {
      const { rerender } = renderWithTheme(
        <HoverCard open={false}>
          <HoverCard.Trigger>
            <button>t</button>
          </HoverCard.Trigger>
          <HoverCard.Content>Content</HoverCard.Content>
        </HoverCard>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
      rerender(
        <HoverCard open>
          <HoverCard.Trigger>
            <button>t</button>
          </HoverCard.Trigger>
          <HoverCard.Content>Content</HoverCard.Content>
        </HoverCard>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('fires onOpenChange', () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const onOpenChange = vi.fn();
      renderWithTheme(
        <HoverCard openDelay={0} closeDelay={0} onOpenChange={onOpenChange}>
          <HoverCard.Trigger>
            <button>t</button>
          </HoverCard.Trigger>
          <HoverCard.Content>Content</HoverCard.Content>
        </HoverCard>
      );
      act(() => {
        fireEvent.mouseEnter(screen.getByText('t'));
      });
      act(() => {
        vi.advanceTimersByTime(20);
      });
      expect(onOpenChange).toHaveBeenCalledWith(true);
      vi.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('content has role="tooltip"', () => {
      renderHoverCard({ defaultOpen: true });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('trigger gets aria-describedby pointing at content when open', () => {
      renderHoverCard({ defaultOpen: true });
      const trigger = screen.getByText('@octocat');
      const content = screen.getByRole('tooltip');
      expect(trigger).toHaveAttribute('aria-describedby', content.id);
    });

    it('trigger has no aria-describedby when closed', () => {
      renderHoverCard();
      const trigger = screen.getByText('@octocat');
      expect(trigger).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Portal', () => {
    it('renders content in portal by default', () => {
      const { container } = renderHoverCard({ defaultOpen: true });
      const inside = container.querySelector('[data-testid="hovercard"]');
      expect(inside).toBeNull();
      expect(screen.getByTestId('hovercard')).toBeInTheDocument();
    });

    it('renders inline when portal=false', () => {
      const { container } = renderWithTheme(
        <HoverCard defaultOpen portal={false}>
          <HoverCard.Trigger>
            <button>t</button>
          </HoverCard.Trigger>
          <HoverCard.Content testId="hovercard">Content</HoverCard.Content>
        </HoverCard>
      );
      expect(
        container.querySelector('[data-testid="hovercard"]')
      ).toBeInTheDocument();
    });
  });

  describe('Content props', () => {
    it('applies width and maxHeight', () => {
      renderWithTheme(
        <HoverCard defaultOpen>
          <HoverCard.Trigger>
            <button>t</button>
          </HoverCard.Trigger>
          <HoverCard.Content testId="hovercard" width={280} maxHeight={120}>
            x
          </HoverCard.Content>
        </HoverCard>
      );
      const content = screen.getByTestId('hovercard');
      expect(content).toHaveStyle({ width: '280px', maxHeight: '120px' });
    });
  });
});
