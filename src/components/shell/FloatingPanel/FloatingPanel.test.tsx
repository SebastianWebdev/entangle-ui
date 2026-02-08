import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { FloatingPanel, FloatingManager } from './FloatingPanel';

describe('FloatingPanel', () => {
  describe('Rendering', () => {
    it('renders with title', () => {
      renderWithTheme(
        <FloatingPanel title="Properties">
          <p>Panel content</p>
        </FloatingPanel>
      );
      expect(screen.getByText('Properties')).toBeInTheDocument();
      expect(screen.getByText('Panel content')).toBeInTheDocument();
    });

    it('has role="dialog" and aria-modal="false"', () => {
      renderWithTheme(<FloatingPanel title="Test">Content</FloatingPanel>);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'false');
      expect(dialog).toHaveAttribute('aria-label', 'Test');
    });

    it('renders close button when closable and onClose provided', () => {
      const handleClose = vi.fn();
      renderWithTheme(
        <FloatingPanel title="Test" onClose={handleClose}>
          Content
        </FloatingPanel>
      );
      expect(screen.getByLabelText('Close panel')).toBeInTheDocument();
    });

    it('does not render close button when closable is false', () => {
      renderWithTheme(
        <FloatingPanel title="Test" closable={false} onClose={() => {}}>
          Content
        </FloatingPanel>
      );
      expect(screen.queryByLabelText('Close panel')).not.toBeInTheDocument();
    });

    it('renders resize handle when resizable', () => {
      renderWithTheme(<FloatingPanel title="Test">Content</FloatingPanel>);
      expect(screen.getByTestId('resize-handle')).toBeInTheDocument();
    });

    it('does not render resize handle when not resizable', () => {
      renderWithTheme(
        <FloatingPanel title="Test" resizable={false}>
          Content
        </FloatingPanel>
      );
      expect(screen.queryByTestId('resize-handle')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('fires onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      renderWithTheme(
        <FloatingPanel title="Test" onClose={handleClose}>
          Content
        </FloatingPanel>
      );
      fireEvent.click(screen.getByLabelText('Close panel'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('toggles collapsed state', () => {
      renderWithTheme(
        <FloatingPanel title="Test">
          <p>Content</p>
        </FloatingPanel>
      );
      // Click collapse button
      const collapseBtn = screen.getByLabelText('Collapse panel');
      fireEvent.click(collapseBtn);
      // After collapse, button label should change
      expect(screen.getByLabelText('Expand panel')).toBeInTheDocument();
    });

    it('calls onCollapsedChange when toggled', () => {
      const handleCollapse = vi.fn();
      renderWithTheme(
        <FloatingPanel title="Test" onCollapsedChange={handleCollapse}>
          Content
        </FloatingPanel>
      );
      fireEvent.click(screen.getByLabelText('Collapse panel'));
      expect(handleCollapse).toHaveBeenCalledWith(true);
    });

    it('hides resize handle when collapsed', () => {
      renderWithTheme(
        <FloatingPanel title="Test" defaultCollapsed={true}>
          Content
        </FloatingPanel>
      );
      expect(screen.queryByTestId('resize-handle')).not.toBeInTheDocument();
    });
  });

  describe('FloatingManager', () => {
    it('renders multiple panels with z-index ordering', () => {
      renderWithTheme(
        <FloatingManager baseZIndex={200}>
          <FloatingPanel title="Panel A" panelId="a">
            Content A
          </FloatingPanel>
          <FloatingPanel title="Panel B" panelId="b">
            Content B
          </FloatingPanel>
        </FloatingManager>
      );
      expect(screen.getByText('Panel A')).toBeInTheDocument();
      expect(screen.getByText('Panel B')).toBeInTheDocument();
    });

    it('brings panel to front on click', () => {
      const { container } = renderWithTheme(
        <FloatingManager baseZIndex={200}>
          <FloatingPanel title="Panel A" panelId="a">
            Content A
          </FloatingPanel>
          <FloatingPanel title="Panel B" panelId="b">
            Content B
          </FloatingPanel>
        </FloatingManager>
      );
      const dialogs = container.querySelectorAll('[role="dialog"]');
      const panelA = dialogs[0] as HTMLElement;

      // Click panel A to bring to front
      fireEvent.pointerDown(panelA);

      // Panel A should now have a higher z-index than Panel B
      const panelAZ = parseInt(panelA.style.zIndex, 10);
      const panelBZ = parseInt((dialogs[1] as HTMLElement).style.zIndex, 10);
      expect(panelAZ).toBeGreaterThan(panelBZ);
    });
  });

  describe('Accessibility', () => {
    it('has collapse and close buttons with aria-labels', () => {
      renderWithTheme(
        <FloatingPanel title="Test" onClose={() => {}}>
          Content
        </FloatingPanel>
      );
      expect(screen.getByLabelText('Collapse panel')).toBeInTheDocument();
      expect(screen.getByLabelText('Close panel')).toBeInTheDocument();
    });
  });
});
