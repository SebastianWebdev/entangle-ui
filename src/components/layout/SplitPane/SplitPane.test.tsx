import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { SplitPane } from './SplitPane';
import { SplitPanePanel } from './SplitPanePanel';

// ---------------------------------------------------------------------------
// Mock ResizeObserver (not available in jsdom)
// ---------------------------------------------------------------------------

beforeAll(() => {
  (globalThis as Record<string, unknown>)['ResizeObserver'] =
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a basic two-panel split pane. */
function renderTwoPanels(
  props: Partial<React.ComponentProps<typeof SplitPane>> = {}
) {
  return renderWithTheme(
    <SplitPane testId="split" {...props}>
      <SplitPanePanel>Panel A</SplitPanePanel>
      <SplitPanePanel>Panel B</SplitPanePanel>
    </SplitPane>
  );
}

/** Build a three-panel split pane. */
function renderThreePanels(
  props: Partial<React.ComponentProps<typeof SplitPane>> = {}
) {
  return renderWithTheme(
    <SplitPane testId="split" {...props}>
      <SplitPanePanel>Panel 1</SplitPanePanel>
      <SplitPanePanel>Panel 2</SplitPanePanel>
      <SplitPanePanel>Panel 3</SplitPanePanel>
    </SplitPane>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SplitPane', () => {
  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------

  describe('Rendering', () => {
    it('renders 2 panels and 1 divider', () => {
      renderTwoPanels();

      expect(screen.getByText('Panel A')).toBeInTheDocument();
      expect(screen.getByText('Panel B')).toBeInTheDocument();
      expect(screen.getAllByRole('separator')).toHaveLength(1);
    });

    it('renders 3 panels and 2 dividers', () => {
      renderThreePanels();

      expect(screen.getByText('Panel 1')).toBeInTheDocument();
      expect(screen.getByText('Panel 2')).toBeInTheDocument();
      expect(screen.getByText('Panel 3')).toBeInTheDocument();
      expect(screen.getAllByRole('separator')).toHaveLength(2);
    });

    it('applies data-testid to the container', () => {
      renderTwoPanels();
      expect(screen.getByTestId('split')).toBeInTheDocument();
    });

    it('applies data-testid to dividers', () => {
      renderTwoPanels();
      expect(screen.getByTestId('split-divider-0')).toBeInTheDocument();
    });

    it('renders non-SplitPanePanel children without crashing', () => {
      renderWithTheme(
        <SplitPane testId="split">
          <div>Raw child 1</div>
          <div>Raw child 2</div>
        </SplitPane>
      );

      expect(screen.getByText('Raw child 1')).toBeInTheDocument();
      expect(screen.getByText('Raw child 2')).toBeInTheDocument();
      expect(screen.getAllByRole('separator')).toHaveLength(1);
    });
  });

  // -----------------------------------------------------------------------
  // Direction
  // -----------------------------------------------------------------------

  describe('Direction', () => {
    it('defaults to horizontal (flex-direction: row)', () => {
      renderTwoPanels();
      const container = screen.getByTestId('split');
      expect(container).toHaveStyle({ flexDirection: 'row' });
    });

    it('sets vertical direction (flex-direction: column)', () => {
      renderTwoPanels({ direction: 'vertical' });
      const container = screen.getByTestId('split');
      expect(container).toHaveStyle({ flexDirection: 'column' });
    });
  });

  // -----------------------------------------------------------------------
  // Accessibility
  // -----------------------------------------------------------------------

  describe('Accessibility', () => {
    it('divider has role="separator"', () => {
      renderTwoPanels();
      const divider = screen.getByRole('separator');
      expect(divider).toBeInTheDocument();
    });

    it('horizontal divider has aria-orientation="vertical"', () => {
      renderTwoPanels({ direction: 'horizontal' });
      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('vertical divider has aria-orientation="horizontal"', () => {
      renderTwoPanels({ direction: 'vertical' });
      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('divider has tabindex="0" for keyboard focus', () => {
      renderTwoPanels();
      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('tabindex', '0');
    });

    it('divider has aria-valuenow', () => {
      renderTwoPanels();
      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('aria-valuenow');
    });

    it('divider has aria-label', () => {
      renderTwoPanels();
      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('aria-label', 'Panel divider');
    });
  });

  // -----------------------------------------------------------------------
  // Keyboard resize
  // -----------------------------------------------------------------------

  describe('Keyboard resize', () => {
    it('ArrowRight increases left panel size on horizontal split', () => {
      const onResize = vi.fn();
      renderTwoPanels({
        sizes: [200, 200],
        onResize,
      });

      const divider = screen.getByRole('separator');
      fireEvent.keyDown(divider, { key: 'ArrowRight' });

      expect(onResize).toHaveBeenCalledWith([210, 190]);
    });

    it('ArrowLeft decreases left panel size on horizontal split', () => {
      const onResize = vi.fn();
      renderTwoPanels({
        sizes: [200, 200],
        onResize,
      });

      const divider = screen.getByRole('separator');
      fireEvent.keyDown(divider, { key: 'ArrowLeft' });

      expect(onResize).toHaveBeenCalledWith([190, 210]);
    });

    it('ArrowDown increases top panel size on vertical split', () => {
      const onResize = vi.fn();
      renderTwoPanels({
        direction: 'vertical',
        sizes: [150, 150],
        onResize,
      });

      const divider = screen.getByRole('separator');
      fireEvent.keyDown(divider, { key: 'ArrowDown' });

      expect(onResize).toHaveBeenCalledWith([160, 140]);
    });

    it('ArrowUp decreases top panel size on vertical split', () => {
      const onResize = vi.fn();
      renderTwoPanels({
        direction: 'vertical',
        sizes: [150, 150],
        onResize,
      });

      const divider = screen.getByRole('separator');
      fireEvent.keyDown(divider, { key: 'ArrowUp' });

      expect(onResize).toHaveBeenCalledWith([140, 160]);
    });

    it('Shift+Arrow resizes by 50px', () => {
      const onResize = vi.fn();
      renderTwoPanels({
        sizes: [200, 200],
        onResize,
      });

      const divider = screen.getByRole('separator');
      fireEvent.keyDown(divider, { key: 'ArrowRight', shiftKey: true });

      expect(onResize).toHaveBeenCalledWith([250, 150]);
    });

    it('Enter toggles collapse on collapsible panel', () => {
      const onResize = vi.fn();
      const onCollapseChange = vi.fn();
      renderTwoPanels({
        sizes: [200, 200],
        panels: [{ collapsible: true, minSize: 100 }, {}],
        onResize,
        onCollapseChange,
      });

      const divider = screen.getByRole('separator');
      fireEvent.keyDown(divider, { key: 'Enter' });

      expect(onCollapseChange).toHaveBeenCalledWith(0, true);
      expect(onResize).toHaveBeenCalledWith([0, 400]);
    });
  });

  // -----------------------------------------------------------------------
  // Controlled mode
  // -----------------------------------------------------------------------

  describe('Controlled mode', () => {
    it('uses provided sizes prop', () => {
      renderTwoPanels({ sizes: [300, 100] });

      const panelWrappers = screen
        .getByTestId('split')
        .querySelectorAll('[data-splitpane-panel-wrapper]');
      expect(panelWrappers[0]).toHaveStyle({ flex: '0 0 300px' });
      expect(panelWrappers[1]).toHaveStyle({ flex: '0 0 100px' });
    });

    it('fires onResize callback during keyboard resize', () => {
      const onResize = vi.fn();
      renderTwoPanels({
        sizes: [200, 200],
        onResize,
      });

      const divider = screen.getByRole('separator');
      fireEvent.keyDown(divider, { key: 'ArrowRight' });

      expect(onResize).toHaveBeenCalledTimes(1);
    });
  });

  // -----------------------------------------------------------------------
  // Disabled / edge cases
  // -----------------------------------------------------------------------

  describe('Edge cases', () => {
    it('does not crash with disabled prop', () => {
      expect(() =>
        renderWithTheme(
          <SplitPane testId="split" aria-disabled="true">
            <SplitPanePanel>A</SplitPanePanel>
            <SplitPanePanel>B</SplitPanePanel>
          </SplitPane>
        )
      ).not.toThrow();
    });

    it('handles single child gracefully', () => {
      expect(() =>
        renderWithTheme(
          <SplitPane testId="split">
            <SplitPanePanel>Only one</SplitPanePanel>
          </SplitPane>
        )
      ).not.toThrow();
    });
  });
});

describe('SplitPanePanel', () => {
  it('renders children', () => {
    renderWithTheme(
      <SplitPanePanel testId="panel">Hello panel</SplitPanePanel>
    );
    expect(screen.getByText('Hello panel')).toBeInTheDocument();
  });

  it('applies data-testid', () => {
    renderWithTheme(<SplitPanePanel testId="panel">Content</SplitPanePanel>);
    expect(screen.getByTestId('panel')).toBeInTheDocument();
  });
});
