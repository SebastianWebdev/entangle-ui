import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { StatusBar } from './StatusBar';

describe('StatusBar', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      renderWithTheme(
        <StatusBar>
          <StatusBar.Section>
            <StatusBar.Item>Ready</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Ready')).toBeInTheDocument();
    });

    it('renders left and right sections', () => {
      renderWithTheme(
        <StatusBar>
          <StatusBar.Section side="left">
            <StatusBar.Item>Left</StatusBar.Item>
          </StatusBar.Section>
          <StatusBar.Section side="right">
            <StatusBar.Item>Right</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      expect(screen.getByText('Left')).toBeInTheDocument();
      expect(screen.getByText('Right')).toBeInTheDocument();
    });

    it('renders item with icon', () => {
      const TestIcon = () => <span data-testid="test-icon">IC</span>;
      renderWithTheme(
        <StatusBar>
          <StatusBar.Section>
            <StatusBar.Item icon={<TestIcon />}>With Icon</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('renders numeric badge', () => {
      renderWithTheme(
        <StatusBar>
          <StatusBar.Section>
            <StatusBar.Item badge={5}>Errors</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('renders dot badge when badge is true', () => {
      const { container } = renderWithTheme(
        <StatusBar>
          <StatusBar.Section>
            <StatusBar.Item badge={true}>Status</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      // The badge is a span after the text "Status" span, with no text content (dot badge)
      const statusItem = container.querySelector('span');
      const allSpans = container.querySelectorAll('span');
      // There should be at least 3 spans: the item wrapper, text span, and badge span
      expect(allSpans.length).toBeGreaterThanOrEqual(3);
      // Find the badge span (empty text content, which is the dot)
      const badgeSpan = Array.from(allSpans).find(
        s => s.textContent === '' && s !== statusItem
      );
      expect(badgeSpan).toBeDefined();
    });

    it('does not render badge when badge is false', () => {
      const { container } = renderWithTheme(
        <StatusBar>
          <StatusBar.Section>
            <StatusBar.Item badge={false}>Status</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      // No badge element should exist — only the span with text
      const spans = container.querySelectorAll('span');
      const hasBadge = Array.from(spans).some(
        s => s.textContent === '' && s.style.borderRadius
      );
      expect(hasBadge).toBe(false);
    });
  });

  describe('Interactions', () => {
    it('renders as button when onClick is provided', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <StatusBar>
          <StatusBar.Section>
            <StatusBar.Item onClick={handleClick}>Click Me</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      const button = screen.getByRole('button', { name: 'Click Me' });
      expect(button).toBeInTheDocument();
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders as span when onClick is not provided', () => {
      renderWithTheme(
        <StatusBar>
          <StatusBar.Section>
            <StatusBar.Item>Static</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByText('Static')).toBeInTheDocument();
    });

    it('disables button when disabled prop is set', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <StatusBar>
          <StatusBar.Section>
            <StatusBar.Item onClick={handleClick} disabled>
              Disabled
            </StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('renders error variant', () => {
      const { container } = renderWithTheme(
        <StatusBar variant="error">
          <StatusBar.Section>
            <StatusBar.Item>Error</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      const statusBar = container.firstElementChild as HTMLElement;
      expect(statusBar).toBeInTheDocument();
    });

    it('renders accent variant', () => {
      const { container } = renderWithTheme(
        <StatusBar variant="accent">
          <StatusBar.Section>
            <StatusBar.Item>Accent</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      const statusBar = container.firstElementChild as HTMLElement;
      expect(statusBar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="status" and aria-live="polite"', () => {
      renderWithTheme(
        <StatusBar>
          <StatusBar.Section>
            <StatusBar.Item>Status</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      const statusEl = screen.getByRole('status');
      expect(statusEl).toHaveAttribute('aria-live', 'polite');
    });

    it('supports title attribute for tooltips', () => {
      const { container } = renderWithTheme(
        <StatusBar>
          <StatusBar.Section>
            <StatusBar.Item title="Line info">Ln 42, Col 5</StatusBar.Item>
          </StatusBar.Section>
        </StatusBar>
      );
      const itemWithTitle = container.querySelector('[title="Line info"]');
      expect(itemWithTitle).toBeInTheDocument();
      expect(itemWithTitle).toHaveTextContent('Ln 42, Col 5');
    });
  });
});
