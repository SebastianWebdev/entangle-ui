import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { Collapsible } from './Collapsible';

// =====================================================
// Collapsible tests
// =====================================================

describe('Collapsible', () => {
  describe('Rendering', () => {
    it('renders trigger content', () => {
      renderWithTheme(
        <Collapsible trigger="Section Title">
          <p>Content</p>
        </Collapsible>
      );
      expect(screen.getByText('Section Title')).toBeInTheDocument();
    });

    it('renders collapsed by default', () => {
      renderWithTheme(
        <Collapsible trigger="Section">
          <p>Content</p>
        </Collapsible>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('renders expanded when defaultOpen is true', () => {
      renderWithTheme(
        <Collapsible trigger="Section" defaultOpen>
          <p>Content</p>
        </Collapsible>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderWithTheme(
        <Collapsible trigger="Section" testId="my-collapsible">
          <p>Content</p>
        </Collapsible>
      );
      expect(screen.getByTestId('my-collapsible')).toBeInTheDocument();
    });

    it('renders chevron indicator by default', () => {
      renderWithTheme(
        <Collapsible trigger="Section">
          <p>Content</p>
        </Collapsible>
      );
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Interactions', () => {
    it('expands on click', () => {
      renderWithTheme(
        <Collapsible trigger="Section">
          <p>Content</p>
        </Collapsible>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('collapses on second click', () => {
      renderWithTheme(
        <Collapsible trigger="Section" defaultOpen>
          <p>Content</p>
        </Collapsible>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button'));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('calls onChange with new state', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Collapsible trigger="Section" onChange={onChange}>
          <p>Content</p>
        </Collapsible>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onChange).toHaveBeenCalledWith(true);
      fireEvent.click(screen.getByRole('button'));
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Controlled mode', () => {
    it('respects open prop', () => {
      renderWithTheme(
        <Collapsible trigger="Section" open>
          <p>Content</p>
        </Collapsible>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('does not toggle without open prop update', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Collapsible trigger="Section" open={false} onChange={onChange}>
          <p>Content</p>
        </Collapsible>
      );
      fireEvent.click(screen.getByRole('button'));
      // onChange called but content stays hidden (controlled)
      expect(onChange).toHaveBeenCalledWith(true);
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('Disabled', () => {
    it('does not toggle when disabled', () => {
      renderWithTheme(
        <Collapsible trigger="Section" disabled>
          <p>Content</p>
        </Collapsible>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('does not call onChange when disabled', () => {
      const onChange = vi.fn();
      renderWithTheme(
        <Collapsible trigger="Section" disabled onChange={onChange}>
          <p>Content</p>
        </Collapsible>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('has disabled attribute on trigger', () => {
      renderWithTheme(
        <Collapsible trigger="Section" disabled>
          <p>Content</p>
        </Collapsible>
      );
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Custom indicator', () => {
    it('renders custom indicator element', () => {
      renderWithTheme(
        <Collapsible
          trigger="Section"
          indicator={<span data-testid="custom-icon">+</span>}
        >
          <p>Content</p>
        </Collapsible>
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('hides indicator when indicator={null}', () => {
      renderWithTheme(
        <Collapsible trigger="Section" indicator={null}>
          <p>Content</p>
        </Collapsible>
      );
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toBeNull();
    });
  });

  describe('keepMounted', () => {
    it('keeps content in DOM when collapsed with keepMounted', () => {
      const { container } = renderWithTheme(
        <Collapsible trigger="Section" keepMounted>
          <p>Content</p>
        </Collapsible>
      );
      const region = container.querySelector('[role="region"]');
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute('hidden');
    });

    it('removes hidden attribute when expanded', () => {
      const { container } = renderWithTheme(
        <Collapsible trigger="Section" keepMounted defaultOpen>
          <p>Content</p>
        </Collapsible>
      );
      const region = container.querySelector('[role="region"]');
      expect(region).not.toHaveAttribute('hidden');
    });

    it('unmounts content when collapsed without keepMounted', () => {
      const { container } = renderWithTheme(
        <Collapsible trigger="Section">
          <p>Content</p>
        </Collapsible>
      );
      const region = container.querySelector('[role="region"]');
      expect(region).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('trigger has aria-expanded=false when collapsed', () => {
      renderWithTheme(
        <Collapsible trigger="Section">
          <p>Content</p>
        </Collapsible>
      );
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    it('trigger has aria-expanded=true when expanded', () => {
      renderWithTheme(
        <Collapsible trigger="Section" defaultOpen>
          <p>Content</p>
        </Collapsible>
      );
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });

    it('trigger aria-controls matches content id', () => {
      renderWithTheme(
        <Collapsible trigger="Section" defaultOpen>
          <p>Content</p>
        </Collapsible>
      );
      const trigger = screen.getByRole('button');
      const contentId = trigger.getAttribute('aria-controls');
      expect(contentId).toBeTruthy();
      expect(screen.getByRole('region')).toHaveAttribute('id', contentId);
    });

    it('content has aria-labelledby matching trigger id', () => {
      renderWithTheme(
        <Collapsible trigger="Section" defaultOpen>
          <p>Content</p>
        </Collapsible>
      );
      const trigger = screen.getByRole('button');
      const triggerId = trigger.getAttribute('id');
      expect(triggerId).toBeTruthy();
      expect(screen.getByRole('region')).toHaveAttribute(
        'aria-labelledby',
        triggerId
      );
    });

    it('content has role="region"', () => {
      renderWithTheme(
        <Collapsible trigger="Section" defaultOpen>
          <p>Content</p>
        </Collapsible>
      );
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });
});
