import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Popover } from './Popover';
import { PopoverTrigger } from './PopoverTrigger';
import { PopoverContent } from './PopoverContent';
import { PopoverClose } from './PopoverClose';

// Helper to render a basic popover
function renderPopover(props: Record<string, unknown> = {}) {
  return renderWithTheme(
    <Popover {...props}>
      <PopoverTrigger>
        <button>Open popover</button>
      </PopoverTrigger>
      <PopoverContent testId="popover-content">
        <p>Popover content</p>
      </PopoverContent>
    </Popover>
  );
}

describe('Popover', () => {
  describe('Rendering', () => {
    it('renders the trigger element', () => {
      renderPopover();
      expect(screen.getByText('Open popover')).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      renderPopover();
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });

    it('renders content when open', () => {
      renderPopover({ defaultOpen: true });
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });
  });

  describe('Open/Close', () => {
    it('opens on trigger click', () => {
      renderPopover();
      fireEvent.click(screen.getByText('Open popover'));
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    it('closes on second trigger click (toggle)', () => {
      renderPopover();
      const trigger = screen.getByText('Open popover');
      fireEvent.click(trigger);
      expect(screen.getByText('Popover content')).toBeInTheDocument();
      fireEvent.click(trigger);
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });

    it('closes on Escape key', () => {
      renderPopover({ defaultOpen: true });
      expect(screen.getByText('Popover content')).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });

    it('does not close on Escape when closeOnEscape is false', () => {
      renderPopover({ defaultOpen: true, closeOnEscape: false });
      expect(screen.getByText('Popover content')).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    it('closes on click outside', () => {
      renderPopover({ defaultOpen: true });
      expect(screen.getByText('Popover content')).toBeInTheDocument();
      fireEvent.mouseDown(document.body);
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });

    it('does not close on click outside when closeOnClickOutside is false', () => {
      renderPopover({
        defaultOpen: true,
        closeOnClickOutside: false,
      });
      expect(screen.getByText('Popover content')).toBeInTheDocument();
      fireEvent.mouseDown(document.body);
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    it('does not close when clicking inside content', () => {
      renderPopover({ defaultOpen: true });
      const content = screen.getByText('Popover content');
      fireEvent.mouseDown(content);
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });
  });

  describe('Controlled', () => {
    it('respects controlled open prop', () => {
      const { rerender } = renderWithTheme(
        <Popover open={false}>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      rerender(
        <Popover open={true}>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('calls onOpenChange when toggling', () => {
      const onOpenChange = vi.fn();
      renderWithTheme(
        <Popover onOpenChange={onOpenChange}>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );
      fireEvent.click(screen.getByText('Open'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('calls onOpenChange(false) on close', () => {
      const onOpenChange = vi.fn();
      renderWithTheme(
        <Popover defaultOpen onOpenChange={onOpenChange}>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('PopoverClose', () => {
    it('renders close button', () => {
      renderWithTheme(
        <Popover defaultOpen>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverClose testId="close-btn" />
            <p>Content</p>
          </PopoverContent>
        </Popover>
      );
      expect(screen.getByTestId('close-btn')).toBeInTheDocument();
    });

    it('closes popover when PopoverClose is clicked', () => {
      renderWithTheme(
        <Popover defaultOpen>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverClose testId="close-btn" />
            <p>Content</p>
          </PopoverContent>
        </Popover>
      );
      fireEvent.click(screen.getByTestId('close-btn'));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('renders custom close button content', () => {
      renderWithTheme(
        <Popover defaultOpen>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverClose>Close me</PopoverClose>
          </PopoverContent>
        </Popover>
      );
      expect(screen.getByText('Close me')).toBeInTheDocument();
    });
  });

  describe('Focus management', () => {
    it('returns focus to trigger on close', async () => {
      renderWithTheme(
        <Popover defaultOpen>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>
            <button>Inside</button>
          </PopoverContent>
        </Popover>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(screen.getByText('Open')).toHaveFocus();
      });
    });

    it('does not return focus when returnFocus is false', () => {
      renderWithTheme(
        <Popover defaultOpen returnFocus={false}>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>
            <button>Inside</button>
          </PopoverContent>
        </Popover>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.getByText('Open')).not.toHaveFocus();
    });
  });

  describe('Portal', () => {
    it('renders content in a portal by default', () => {
      const { container } = renderPopover({ defaultOpen: true });
      // Content should NOT be inside the test container (it's in document.body via portal)
      const contentInContainer = container.querySelector(
        '[data-testid="popover-content"]'
      );
      expect(contentInContainer).toBeNull();
      // But it should exist in the document
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    it('renders content inline when portal is false', () => {
      const { container } = renderWithTheme(
        <Popover defaultOpen portal={false}>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent testId="popover-content">Content</PopoverContent>
        </Popover>
      );
      const contentInContainer = container.querySelector(
        '[data-testid="popover-content"]'
      );
      expect(contentInContainer).toBeInTheDocument();
    });
  });

  describe('Content props', () => {
    it('applies custom width', () => {
      renderWithTheme(
        <Popover defaultOpen>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent testId="popover-content" width={300}>
            Content
          </PopoverContent>
        </Popover>
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveStyle({ width: '300px' });
    });

    it('applies string width', () => {
      renderWithTheme(
        <Popover defaultOpen>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent testId="popover-content" width="50vw">
            Content
          </PopoverContent>
        </Popover>
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveStyle({ width: '50vw' });
    });

    it('applies maxHeight', () => {
      renderWithTheme(
        <Popover defaultOpen>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent testId="popover-content" maxHeight={200}>
            Content
          </PopoverContent>
        </Popover>
      );
      const content = screen.getByTestId('popover-content');
      expect(content).toHaveStyle({ maxHeight: '200px' });
    });
  });

  describe('Accessibility', () => {
    it('trigger has aria-haspopup="dialog"', () => {
      renderPopover();
      const trigger = screen.getByText('Open popover');
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('trigger has aria-expanded when open', () => {
      renderPopover({ defaultOpen: true });
      const trigger = screen.getByText('Open popover');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('trigger has aria-expanded false when closed', () => {
      renderPopover();
      const trigger = screen.getByText('Open popover');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('content has role="dialog"', () => {
      renderPopover({ defaultOpen: true });
      const content = screen.getByRole('dialog');
      expect(content).toBeInTheDocument();
    });

    it('trigger has aria-controls linking to content', () => {
      renderPopover({ defaultOpen: true });
      const trigger = screen.getByText('Open popover');
      const content = screen.getByRole('dialog');
      expect(trigger).toHaveAttribute('aria-controls', content.id);
    });

    it('close button has aria-label', () => {
      renderWithTheme(
        <Popover defaultOpen>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverClose testId="close-btn" />
          </PopoverContent>
        </Popover>
      );
      expect(screen.getByTestId('close-btn')).toHaveAttribute(
        'aria-label',
        'Close'
      );
    });
  });

  describe('Uncontrolled with defaultOpen', () => {
    it('starts open with defaultOpen=true', () => {
      renderPopover({ defaultOpen: true });
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    it('can be toggled from defaultOpen', () => {
      renderPopover({ defaultOpen: true });
      fireEvent.click(screen.getByText('Open popover'));
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });
  });
});
