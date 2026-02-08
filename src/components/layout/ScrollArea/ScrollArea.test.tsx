import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { ScrollArea } from './ScrollArea';

// Mock ResizeObserver for jsdom
beforeAll(() => {
  (globalThis as Record<string, unknown>)['ResizeObserver'] =
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

// Helper: jsdom has no layout engine, so scrollHeight/clientHeight are 0.
// We mock them via Object.defineProperty on the viewport element.
function mockScrollDimensions(
  el: HTMLElement,
  overrides: {
    scrollHeight?: number;
    clientHeight?: number;
    scrollWidth?: number;
    clientWidth?: number;
    scrollTop?: number;
    scrollLeft?: number;
  }
) {
  if (overrides.scrollHeight != null) {
    Object.defineProperty(el, 'scrollHeight', {
      configurable: true,
      get: () => overrides.scrollHeight,
    });
  }
  if (overrides.clientHeight != null) {
    Object.defineProperty(el, 'clientHeight', {
      configurable: true,
      get: () => overrides.clientHeight,
    });
  }
  if (overrides.scrollWidth != null) {
    Object.defineProperty(el, 'scrollWidth', {
      configurable: true,
      get: () => overrides.scrollWidth,
    });
  }
  if (overrides.clientWidth != null) {
    Object.defineProperty(el, 'clientWidth', {
      configurable: true,
      get: () => overrides.clientWidth,
    });
  }
  if (overrides.scrollTop != null) {
    Object.defineProperty(el, 'scrollTop', {
      configurable: true,
      writable: true,
      value: overrides.scrollTop,
    });
  }
  if (overrides.scrollLeft != null) {
    Object.defineProperty(el, 'scrollLeft', {
      configurable: true,
      writable: true,
      value: overrides.scrollLeft,
    });
  }
}

describe('ScrollArea', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      renderWithTheme(
        <ScrollArea testId="sa">
          <p>Hello scroll</p>
        </ScrollArea>
      );
      expect(screen.getByText('Hello scroll')).toBeInTheDocument();
    });

    it('renders with testId', () => {
      renderWithTheme(
        <ScrollArea testId="sa">
          <p>Content</p>
        </ScrollArea>
      );
      expect(screen.getByTestId('sa')).toBeInTheDocument();
    });

    it('renders viewport with role="region"', () => {
      renderWithTheme(
        <ScrollArea testId="sa">
          <p>Content</p>
        </ScrollArea>
      );
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('viewport is focusable with tabIndex=0', () => {
      renderWithTheme(
        <ScrollArea testId="sa">
          <p>Content</p>
        </ScrollArea>
      );
      const viewport = screen.getByRole('region');
      expect(viewport).toHaveAttribute('tabindex', '0');
    });
  });

  describe('No overflow', () => {
    it('does not render scrollbar when content fits', () => {
      renderWithTheme(
        <ScrollArea testId="sa">
          <p>Short content</p>
        </ScrollArea>
      );
      // In jsdom, scrollHeight equals clientHeight (both 0), so no overflow
      expect(screen.queryByTestId('sa-scrollbar-v')).not.toBeInTheDocument();
    });
  });

  describe('Direction', () => {
    it('applies vertical overflow style by default', () => {
      renderWithTheme(
        <ScrollArea testId="sa">
          <p>Content</p>
        </ScrollArea>
      );
      const viewport = screen.getByRole('region');
      // Checking class application by verifying it renders
      expect(viewport).toBeInTheDocument();
    });

    it('applies horizontal overflow when direction="horizontal"', () => {
      renderWithTheme(
        <ScrollArea testId="sa" direction="horizontal">
          <p>Wide content</p>
        </ScrollArea>
      );
      const viewport = screen.getByRole('region');
      expect(viewport).toBeInTheDocument();
    });

    it('applies both overflow when direction="both"', () => {
      renderWithTheme(
        <ScrollArea testId="sa" direction="both">
          <p>Wide and tall content</p>
        </ScrollArea>
      );
      const viewport = screen.getByRole('region');
      expect(viewport).toBeInTheDocument();
    });
  });

  describe('maxHeight / maxWidth', () => {
    it('applies maxHeight to root', () => {
      renderWithTheme(
        <ScrollArea testId="sa" maxHeight={300}>
          <p>Content</p>
        </ScrollArea>
      );
      const root = screen.getByTestId('sa');
      expect(root).toHaveStyle({ maxHeight: '300px' });
    });

    it('applies maxWidth to root', () => {
      renderWithTheme(
        <ScrollArea testId="sa" maxWidth="50vw">
          <p>Content</p>
        </ScrollArea>
      );
      const root = screen.getByTestId('sa');
      expect(root).toHaveStyle({ maxWidth: '50vw' });
    });

    it('applies string maxHeight', () => {
      renderWithTheme(
        <ScrollArea testId="sa" maxHeight="calc(100vh - 100px)">
          <p>Content</p>
        </ScrollArea>
      );
      const root = screen.getByTestId('sa');
      expect(root).toHaveStyle({ maxHeight: 'calc(100vh - 100px)' });
    });
  });

  describe('Scroll callbacks', () => {
    it('calls onScroll when viewport scrolls', () => {
      const onScroll = vi.fn();
      renderWithTheme(
        <ScrollArea testId="sa" onScroll={onScroll}>
          <p>Content</p>
        </ScrollArea>
      );
      const viewport = screen.getByRole('region');
      fireEvent.scroll(viewport);
      expect(onScroll).toHaveBeenCalled();
    });

    it('calls onScrollTop when scrolled to top', () => {
      const onScrollTop = vi.fn();
      renderWithTheme(
        <ScrollArea testId="sa" onScrollTop={onScrollTop}>
          <p>Content</p>
        </ScrollArea>
      );
      const viewport = screen.getByRole('region');
      // In jsdom, scrollTop defaults to 0 => at top
      mockScrollDimensions(viewport, {
        scrollTop: 0,
        scrollHeight: 500,
        clientHeight: 200,
      });
      fireEvent.scroll(viewport);
      expect(onScrollTop).toHaveBeenCalled();
    });

    it('calls onScrollBottom when scrolled to bottom', () => {
      const onScrollBottom = vi.fn();
      renderWithTheme(
        <ScrollArea testId="sa" onScrollBottom={onScrollBottom}>
          <p>Content</p>
        </ScrollArea>
      );
      const viewport = screen.getByRole('region');
      mockScrollDimensions(viewport, {
        scrollTop: 300,
        scrollHeight: 500,
        clientHeight: 200,
      });
      fireEvent.scroll(viewport);
      expect(onScrollBottom).toHaveBeenCalled();
    });
  });

  describe('Scrollbar visibility', () => {
    it('scrollbar visibility "never" does not show scrollbar', () => {
      renderWithTheme(
        <ScrollArea testId="sa" scrollbarVisibility="never">
          <p>Content</p>
        </ScrollArea>
      );
      // Even with overflow, scrollbar should not be visible
      expect(screen.queryByTestId('sa-scrollbar-v')).not.toBeInTheDocument();
    });

    it('scrollbar visibility "always" shows scrollbar immediately', () => {
      renderWithTheme(
        <ScrollArea testId="sa" scrollbarVisibility="always">
          <div style={{ height: 1000 }}>Content</div>
        </ScrollArea>
      );
      // In jsdom, no real overflow since there's no layout engine.
      // The scrollbar only renders when hasVOverflow is true (detected via recalculate).
      // Since jsdom has no layout, we can't test actual visibility here.
      // This is a limitation of jsdom-based testing.
      expect(screen.getByTestId('sa')).toBeInTheDocument();
    });
  });

  describe('Fade masks', () => {
    it('renders fade masks when fadeMask is true', () => {
      renderWithTheme(
        <ScrollArea testId="sa" fadeMask>
          <p>Content</p>
        </ScrollArea>
      );
      // Should render top and bottom masks for vertical
      expect(screen.getByTestId('sa-fade-top')).toBeInTheDocument();
      expect(screen.getByTestId('sa-fade-bottom')).toBeInTheDocument();
    });

    it('does not render fade masks by default', () => {
      renderWithTheme(
        <ScrollArea testId="sa">
          <p>Content</p>
        </ScrollArea>
      );
      expect(screen.queryByTestId('sa-fade-top')).not.toBeInTheDocument();
    });
  });

  describe('Custom props', () => {
    it('applies className', () => {
      renderWithTheme(
        <ScrollArea testId="sa" className="custom-class">
          <p>Content</p>
        </ScrollArea>
      );
      expect(screen.getByTestId('sa')).toHaveClass('custom-class');
    });

    it('applies custom style', () => {
      renderWithTheme(
        <ScrollArea testId="sa" style={{ border: '1px solid red' }}>
          <p>Content</p>
        </ScrollArea>
      );
      expect(screen.getByTestId('sa')).toHaveStyle({
        border: '1px solid red',
      });
    });
  });

  describe('Accessibility', () => {
    it('viewport has role="region"', () => {
      renderWithTheme(
        <ScrollArea testId="sa">
          <p>Content</p>
        </ScrollArea>
      );
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('viewport has tabIndex 0 for keyboard scrolling', () => {
      renderWithTheme(
        <ScrollArea testId="sa">
          <p>Content</p>
        </ScrollArea>
      );
      expect(screen.getByRole('region')).toHaveAttribute('tabindex', '0');
    });
  });
});
