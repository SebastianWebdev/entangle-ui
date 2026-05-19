import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Drawer } from './Drawer';
import type { DrawerAnchor } from './Drawer.types';

function renderDrawer(
  props: Partial<React.ComponentProps<typeof Drawer>> = {}
) {
  const onClose = props.onClose ?? vi.fn();
  return {
    ...renderWithTheme(
      <Drawer open onClose={onClose} testId="drawer" {...props}>
        {props.children ?? <div>Drawer content</div>}
      </Drawer>
    ),
    onClose,
  };
}

describe('Drawer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  describe('Rendering', () => {
    it('renders when open is true', () => {
      renderDrawer();
      expect(screen.getByTestId('drawer')).toBeInTheDocument();
    });

    it('does not render when never opened', () => {
      renderDrawer({ open: false });
      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
    });

    it('renders an overlay in modal mode', () => {
      renderDrawer();
      expect(screen.getByTestId('drawer-overlay')).toBeInTheDocument();
    });

    it('does not render an overlay in non-modal mode', () => {
      renderDrawer({ modal: false });
      expect(screen.queryByTestId('drawer-overlay')).not.toBeInTheDocument();
    });

    it('renders a Drawer.Header with close button', () => {
      renderDrawer({
        children: <Drawer.Header testId="hdr">Filters</Drawer.Header>,
      });
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByTestId('hdr-close')).toBeInTheDocument();
    });

    it('renders Drawer.Body and Drawer.Footer', () => {
      renderDrawer({
        children: (
          <>
            <Drawer.Body>Body</Drawer.Body>
            <Drawer.Footer>
              <button>Apply</button>
            </Drawer.Footer>
          </>
        ),
      });
      expect(screen.getByText('Body')).toBeInTheDocument();
      expect(screen.getByText('Apply')).toBeInTheDocument();
    });

    it('renders with each anchor', () => {
      const anchors: DrawerAnchor[] = ['left', 'right', 'top', 'bottom'];
      for (const anchor of anchors) {
        const { unmount } = renderDrawer({
          anchor,
          testId: `drawer-${anchor}`,
        });
        expect(screen.getByTestId(`drawer-${anchor}`)).toHaveAttribute(
          'data-anchor',
          anchor
        );
        unmount();
      }
    });
  });

  describe('Closing behavior', () => {
    it('fires onClose when overlay is clicked', () => {
      const { onClose } = renderDrawer();
      fireEvent.click(screen.getByTestId('drawer-overlay'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClose on overlay click when closeOnOverlayClick is false', () => {
      const { onClose } = renderDrawer({ closeOnOverlayClick: false });
      fireEvent.click(screen.getByTestId('drawer-overlay'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('fires onClose on Escape', () => {
      const { onClose } = renderDrawer();
      fireEvent.keyDown(screen.getByTestId('drawer'), { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClose on Escape when closeOnEscape is false', () => {
      const { onClose } = renderDrawer({ closeOnEscape: false });
      fireEvent.keyDown(screen.getByTestId('drawer'), { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('Drawer.Header close button calls onClose', () => {
      const { onClose } = renderDrawer({
        children: <Drawer.Header testId="hdr">Title</Drawer.Header>,
      });
      fireEvent.click(screen.getByTestId('hdr-close'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('Drawer.CloseButton calls onClose', () => {
      const { onClose } = renderDrawer({
        children: (
          <Drawer.Body>
            <Drawer.CloseButton testId="cb" />
          </Drawer.Body>
        ),
      });
      fireEvent.click(screen.getByTestId('cb'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Sizes', () => {
    it('applies preset width on horizontal anchors', () => {
      renderDrawer({ anchor: 'right', size: 'sm', testId: 'drawer' });
      expect(screen.getByTestId('drawer')).toHaveStyle({ width: '280px' });
    });

    it('applies preset height on vertical anchors', () => {
      renderDrawer({ anchor: 'top', size: 'lg', testId: 'drawer' });
      expect(screen.getByTestId('drawer')).toHaveStyle({ height: '480px' });
    });

    it('accepts a numeric size as pixels', () => {
      renderDrawer({ anchor: 'right', size: 320, testId: 'drawer' });
      expect(screen.getByTestId('drawer')).toHaveStyle({ width: '320px' });
    });

    it('accepts a string size as a CSS value', () => {
      renderDrawer({ anchor: 'right', size: '50vw', testId: 'drawer' });
      expect(screen.getByTestId('drawer')).toHaveStyle({ width: '50vw' });
    });
  });

  describe('Accessibility', () => {
    it('has role=dialog and aria-modal=true in modal mode', () => {
      renderDrawer();
      const drawer = screen.getByTestId('drawer');
      expect(drawer).toHaveAttribute('role', 'dialog');
      expect(drawer).toHaveAttribute('aria-modal', 'true');
    });

    it('omits aria-modal in non-modal mode', () => {
      renderDrawer({ modal: false });
      expect(screen.getByTestId('drawer')).not.toHaveAttribute('aria-modal');
    });

    it('wires aria-labelledby when title is set', () => {
      renderDrawer({ title: 'My drawer' });
      const drawer = screen.getByTestId('drawer');
      const labelId = drawer.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();
      if (!labelId) throw new Error('expected aria-labelledby');
      expect(document.getElementById(labelId)).toHaveTextContent('My drawer');
    });

    it('Drawer.Header close button has aria-label', () => {
      renderDrawer({
        children: <Drawer.Header testId="hdr">Title</Drawer.Header>,
      });
      expect(screen.getByTestId('hdr-close')).toHaveAttribute(
        'aria-label',
        'Close drawer'
      );
    });
  });

  describe('Portal', () => {
    it('renders content in document.body by default', () => {
      const { container } = renderDrawer();
      expect(container.querySelector('[data-testid="drawer"]')).toBeNull();
      expect(screen.getByTestId('drawer')).toBeInTheDocument();
    });

    it('renders inline when portal=false', () => {
      const { container } = renderDrawer({ portal: false });
      expect(
        container.querySelector('[data-testid="drawer"]')
      ).toBeInTheDocument();
    });
  });

  describe('Animation lifecycle', () => {
    it('keeps the drawer mounted briefly while closing animation plays', () => {
      const { rerender } = renderWithTheme(
        <Drawer open onClose={vi.fn()} testId="drawer">
          <div>x</div>
        </Drawer>
      );
      expect(screen.getByTestId('drawer')).toBeInTheDocument();

      rerender(
        <Drawer open={false} onClose={vi.fn()} testId="drawer">
          <div>x</div>
        </Drawer>
      );
      // Still mounted while closing animation runs
      expect(screen.getByTestId('drawer')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
    });
  });
});
