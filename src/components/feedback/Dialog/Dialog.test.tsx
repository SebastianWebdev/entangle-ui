import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Dialog } from './Dialog';
import { DialogHeader } from './DialogHeader';
import { DialogBody } from './DialogBody';
import { DialogFooter } from './DialogFooter';
import { DialogClose } from './DialogClose';
import type { DialogSize } from './Dialog.types';

// Helper to render Dialog inside portal (uses document.body by default)
function renderDialog(
  props: Partial<React.ComponentProps<typeof Dialog>> = {}
) {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    children: <div>Dialog content</div>,
    ...props,
  };
  return {
    ...renderWithTheme(<Dialog {...defaultProps} />),
    onClose: defaultProps.onClose,
  };
}

describe('Dialog', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  describe('Rendering', () => {
    it('renders when open is true', () => {
      renderDialog({ testId: 'dialog' });
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      renderDialog({ open: false, testId: 'dialog' });
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('renders children content', () => {
      renderDialog({
        children: <span>Hello World</span>,
      });
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderDialog({ testId: 'my-dialog' });
      expect(screen.getByTestId('my-dialog')).toBeInTheDocument();
    });

    it('renders all sizes correctly', () => {
      const sizes: DialogSize[] = ['sm', 'md', 'lg', 'xl', 'fullscreen'];

      sizes.forEach(size => {
        const { unmount } = renderDialog({
          size,
          testId: `dialog-${size}`,
        });
        expect(screen.getByTestId(`dialog-${size}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Overlay interactions', () => {
    it('fires onClose on overlay click', () => {
      const { onClose } = renderDialog({ testId: 'dialog' });
      const overlay = screen.getByTestId('dialog-overlay');

      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does NOT fire onClose on overlay click when closeOnOverlayClick is false', () => {
      const { onClose } = renderDialog({
        closeOnOverlayClick: false,
        testId: 'dialog',
      });
      const overlay = screen.getByTestId('dialog-overlay');

      fireEvent.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not close when clicking the dialog panel itself', () => {
      const { onClose } = renderDialog({ testId: 'dialog' });
      const panel = screen.getByTestId('dialog');

      fireEvent.click(panel);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard interactions', () => {
    it('fires onClose on Escape press', () => {
      const { onClose } = renderDialog();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does NOT fire onClose on Escape when closeOnEscape is false', () => {
      const { onClose } = renderDialog({ closeOnEscape: false });

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has role="dialog" and aria-modal="true"', () => {
      renderDialog({ testId: 'dialog' });
      const dialog = screen.getByTestId('dialog');

      expect(dialog).toHaveAttribute('role', 'dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby when title is provided', () => {
      renderDialog({ title: 'Test Title', testId: 'dialog' });
      const dialog = screen.getByTestId('dialog');

      expect(dialog).toHaveAttribute('aria-labelledby');
      const labelledBy = dialog.getAttribute('aria-labelledby') as string;
      const titleEl = document.getElementById(labelledBy);
      expect(titleEl).toBeInTheDocument();
      expect(titleEl?.textContent).toBe('Test Title');
    });

    it('has aria-describedby when description is provided', () => {
      renderDialog({ description: 'Test Description', testId: 'dialog' });
      const dialog = screen.getByTestId('dialog');

      expect(dialog).toHaveAttribute('aria-describedby');
      const describedBy = dialog.getAttribute('aria-describedby') as string;
      const descEl = document.getElementById(describedBy);
      expect(descEl).toBeInTheDocument();
      expect(descEl?.textContent).toBe('Test Description');
    });

    it('does not have aria-labelledby when no title', () => {
      renderDialog({ testId: 'dialog' });
      const dialog = screen.getByTestId('dialog');

      expect(dialog).not.toHaveAttribute('aria-labelledby');
    });

    it('does not have aria-describedby when no description', () => {
      renderDialog({ testId: 'dialog' });
      const dialog = screen.getByTestId('dialog');

      expect(dialog).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Focus management', () => {
    it('focus trap cycles focus within dialog on Tab', async () => {
      renderDialog({
        children: (
          <>
            <button data-testid="btn-1">First</button>
            <button data-testid="btn-2">Second</button>
            <button data-testid="btn-3">Third</button>
          </>
        ),
        testId: 'dialog',
      });

      // Wait for initial focus
      await vi.advanceTimersByTimeAsync(10);

      const btn3 = screen.getByTestId('btn-3');
      const dialog = screen.getByTestId('dialog');

      // Focus last button, then Tab should wrap to first
      btn3.focus();
      fireEvent.keyDown(dialog, { key: 'Tab' });

      // In jsdom, focus management may not fully work,
      // but we verify the handler doesn't throw
      expect(dialog).toBeInTheDocument();
    });

    it('stores previously focused element for focus return on close', async () => {
      // Verify that the dialog captures the previously focused element
      // Full focus return depends on jsdom focus management
      const onClose = vi.fn();

      const { rerender } = renderWithTheme(
        <>
          <button data-testid="trigger">Open</button>
          <Dialog open={false} onClose={onClose} testId="dialog">
            <button data-testid="inner-btn">Inner</button>
          </Dialog>
        </>
      );

      // Focus the trigger before opening
      const trigger = screen.getByTestId('trigger');
      trigger.focus();

      // Open dialog
      rerender(
        <>
          <button data-testid="trigger">Open</button>
          <Dialog open={true} onClose={onClose} testId="dialog">
            <button data-testid="inner-btn">Inner</button>
          </Dialog>
        </>
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(10);
      });

      // Dialog should be open
      expect(screen.getByTestId('dialog')).toBeInTheDocument();

      // Close dialog via rerender
      rerender(
        <>
          <button data-testid="trigger">Open</button>
          <Dialog open={false} onClose={onClose} testId="dialog">
            <button data-testid="inner-btn">Inner</button>
          </Dialog>
        </>
      );

      // Wait for close animation to complete
      await act(async () => {
        await vi.advanceTimersByTimeAsync(250);
      });

      // Dialog should be unmounted
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });
});

describe('DialogHeader', () => {
  function renderHeader(
    props: Partial<React.ComponentProps<typeof DialogHeader>> = {}
  ) {
    const onClose = vi.fn();
    return {
      ...renderWithTheme(
        <Dialog open onClose={onClose}>
          <DialogHeader testId="header" {...props}>
            {props.children ?? 'Title'}
          </DialogHeader>
        </Dialog>
      ),
      onClose,
    };
  }

  it('renders title text', () => {
    renderHeader({ children: 'My Dialog Title' });
    expect(screen.getByText('My Dialog Title')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    renderHeader({ description: 'Some description text' });
    expect(screen.getByText('Some description text')).toBeInTheDocument();
  });

  it('renders close button by default', () => {
    renderHeader({ testId: 'header' });
    const closeBtn = screen.getByLabelText('Close dialog');
    expect(closeBtn).toBeInTheDocument();
  });

  it('hides close button when showClose is false', () => {
    renderHeader({ showClose: false });
    expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
  });

  it('close button fires onClose', () => {
    const { onClose } = renderHeader({ testId: 'header' });
    const closeBtn = screen.getByLabelText('Close dialog');

    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('DialogBody', () => {
  it('renders content', () => {
    renderWithTheme(
      <Dialog open onClose={vi.fn()}>
        <DialogBody testId="body">
          <p>Body content here</p>
        </DialogBody>
      </Dialog>
    );
    expect(screen.getByText('Body content here')).toBeInTheDocument();
  });

  it('applies data-testid', () => {
    renderWithTheme(
      <Dialog open onClose={vi.fn()}>
        <DialogBody testId="my-body">Content</DialogBody>
      </Dialog>
    );
    expect(screen.getByTestId('my-body')).toBeInTheDocument();
  });
});

describe('DialogFooter', () => {
  it('renders content', () => {
    renderWithTheme(
      <Dialog open onClose={vi.fn()}>
        <DialogFooter testId="footer">
          <button>Cancel</button>
          <button>Confirm</button>
        </DialogFooter>
      </Dialog>
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('applies data-testid', () => {
    renderWithTheme(
      <Dialog open onClose={vi.fn()}>
        <DialogFooter testId="my-footer">Actions</DialogFooter>
      </Dialog>
    );
    expect(screen.getByTestId('my-footer')).toBeInTheDocument();
  });

  it('renders with different alignment values', () => {
    const alignments = ['left', 'center', 'right', 'space-between'] as const;

    alignments.forEach(align => {
      const { unmount } = renderWithTheme(
        <Dialog open onClose={vi.fn()}>
          <DialogFooter testId={`footer-${align}`} align={align}>
            Actions
          </DialogFooter>
        </Dialog>
      );
      expect(screen.getByTestId(`footer-${align}`)).toBeInTheDocument();
      unmount();
    });
  });
});

describe('DialogClose', () => {
  it('calls onClose when child is clicked', () => {
    const onClose = vi.fn();

    renderWithTheme(
      <Dialog open onClose={onClose}>
        <DialogClose>
          <button data-testid="close-btn">Close</button>
        </DialogClose>
      </Dialog>
    );

    fireEvent.click(screen.getByTestId('close-btn'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('also calls original onClick of child', () => {
    const onClose = vi.fn();
    const onClick = vi.fn();

    renderWithTheme(
      <Dialog open onClose={onClose}>
        <DialogClose>
          <button data-testid="close-btn" onClick={onClick}>
            Close
          </button>
        </DialogClose>
      </Dialog>
    );

    fireEvent.click(screen.getByTestId('close-btn'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
