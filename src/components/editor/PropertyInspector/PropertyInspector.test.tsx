import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { PropertyPanel } from './PropertyPanel';
import { PropertySection } from './PropertySection';
import { PropertyRow } from './PropertyRow';
import { PropertyGroup } from './PropertyGroup';
import { usePropertyUndo } from './usePropertyUndo';
import type { PropertyUndoEntry } from './PropertyInspector.types';

// --- Test helpers ---

const TestPanel = (
  props: Partial<React.ComponentProps<typeof PropertyPanel>>
) => (
  <PropertyPanel testId="panel" {...props}>
    <PropertySection title="Transform" testId="section-transform">
      <PropertyRow label="Position" testId="row-position">
        <span>0, 0, 0</span>
      </PropertyRow>
      <PropertyRow label="Rotation" testId="row-rotation">
        <span>0, 0, 0</span>
      </PropertyRow>
    </PropertySection>
    <PropertySection
      title="Material"
      defaultExpanded={false}
      testId="section-material"
    >
      <PropertyRow label="Shader">
        <span>Standard</span>
      </PropertyRow>
    </PropertySection>
  </PropertyPanel>
);

// === PropertyPanel ===

describe('PropertyPanel', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      renderWithTheme(<TestPanel />);
      expect(screen.getByText('Transform')).toBeInTheDocument();
      expect(screen.getByText('Material')).toBeInTheDocument();
    });

    it('renders header slot', () => {
      renderWithTheme(
        <TestPanel header={<div data-testid="custom-header">Inspector</div>} />
      );
      expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    });

    it('renders footer slot', () => {
      renderWithTheme(
        <TestPanel footer={<div data-testid="custom-footer">Status</div>} />
      );
      expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderWithTheme(<TestPanel />);
      expect(screen.getByTestId('panel')).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('renders search input when searchable', () => {
      renderWithTheme(<TestPanel searchable />);
      expect(
        screen.getByRole('searchbox', { name: 'Search properties' })
      ).toBeInTheDocument();
    });

    it('fires onSearchChange when typing', () => {
      const onSearchChange = vi.fn();
      renderWithTheme(<TestPanel searchable onSearchChange={onSearchChange} />);

      const input = screen.getByRole('searchbox');
      fireEvent.change(input, { target: { value: 'position' } });
      expect(onSearchChange).toHaveBeenCalledWith('position');
    });

    it('renders custom search placeholder', () => {
      renderWithTheme(<TestPanel searchable searchPlaceholder="Filter..." />);
      expect(screen.getByPlaceholderText('Filter...')).toBeInTheDocument();
    });
  });
});

// === PropertySection ===

describe('PropertySection', () => {
  describe('Rendering', () => {
    it('renders title text', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertySection title="Transform" testId="section">
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );
      expect(screen.getByText('Transform')).toBeInTheDocument();
    });

    it('renders icon in header', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertySection
            title="Transform"
            icon={<span data-testid="section-icon">T</span>}
          >
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );
      expect(screen.getByTestId('section-icon')).toBeInTheDocument();
    });

    it('renders actions in header', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertySection
            title="Transform"
            actions={<button data-testid="action-btn">Reset</button>}
          >
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );
      expect(screen.getByTestId('action-btn')).toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertySection title="Transform" testId="my-section">
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );
      expect(screen.getByTestId('my-section')).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse', () => {
    it('is expanded by default', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertySection title="Transform">
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('toggles on click', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertySection title="Transform">
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );

      // Initially expanded
      expect(screen.getByText('Content')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(screen.getByText('Transform'));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      // Click to expand again
      fireEvent.click(screen.getByText('Transform'));
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('respects defaultExpanded={false}', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertySection title="Transform" defaultExpanded={false}>
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('respects controlled expanded prop', () => {
      const { rerender } = renderWithTheme(
        <PropertyPanel>
          <PropertySection title="Transform" expanded={false}>
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      rerender(
        <PropertyPanel>
          <PropertySection title="Transform" expanded={true}>
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('calls onExpandedChange on toggle', () => {
      const onExpandedChange = vi.fn();
      renderWithTheme(
        <PropertyPanel>
          <PropertySection
            title="Transform"
            onExpandedChange={onExpandedChange}
          >
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );

      fireEvent.click(screen.getByText('Transform'));
      expect(onExpandedChange).toHaveBeenCalledWith(false);
    });

    it('does not toggle when disabled', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertySection title="Transform" disabled>
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );

      // Starts expanded by default
      expect(screen.getByText('Content')).toBeInTheDocument();

      // Click should not collapse
      fireEvent.click(screen.getByText('Transform'));
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('clicking actions does not toggle section', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertySection
            title="Transform"
            actions={<button data-testid="action-btn">Reset</button>}
          >
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('action-btn'));
      // Section should still be expanded
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('keepMounted', () => {
    it('unmounts content when collapsed by default', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertySection title="Transform" defaultExpanded={false}>
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('keeps content in DOM when keepMounted is true', () => {
      const { container } = renderWithTheme(
        <PropertyPanel>
          <PropertySection
            title="Transform"
            defaultExpanded={false}
            keepMounted
          >
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );
      // Content is in the DOM but hidden
      // The PropertyPanel also has role="region", so find the section's content region
      const regions = container.querySelectorAll('[role="region"]');
      // The second region is the PropertySection content
      const sectionRegion = Array.from(regions).find(r =>
        r.getAttribute('aria-labelledby')?.includes('property-section')
      );
      expect(sectionRegion).toBeInTheDocument();
      expect(sectionRegion).toHaveAttribute('hidden');
    });
  });

  describe('Accessibility', () => {
    it('trigger has aria-expanded', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertySection title="Transform">
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );

      const trigger = screen
        .getByText('Transform')
        .closest('button') as HTMLElement;
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('trigger has aria-controls pointing to content', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertySection title="Transform">
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );

      const trigger = screen
        .getByText('Transform')
        .closest('button') as HTMLElement;
      const contentId = trigger.getAttribute('aria-controls');
      expect(contentId).toBeTruthy();

      const content = document.getElementById(contentId as string);
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute('role', 'region');
    });

    it('content has role="region" and aria-labelledby', () => {
      const { container } = renderWithTheme(
        <PropertyPanel>
          <PropertySection title="Transform">
            <div>Content</div>
          </PropertySection>
        </PropertyPanel>
      );

      // Find the section content region (not the PropertyPanel region)
      const regions = container.querySelectorAll('[role="region"]');
      const sectionRegion = Array.from(regions).find(r =>
        r.getAttribute('aria-labelledby')?.includes('property-section')
      );
      expect(sectionRegion).toBeInTheDocument();
      expect(sectionRegion).toHaveAttribute('aria-labelledby');

      const labelledBy = sectionRegion?.getAttribute('aria-labelledby');
      const trigger = document.getElementById(labelledBy as string);
      expect(trigger).toBeInTheDocument();
    });
  });
});

// === PropertyRow ===

describe('PropertyRow', () => {
  describe('Rendering', () => {
    it('renders label and children', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertyRow label="Position">
            <span>0, 0, 0</span>
          </PropertyRow>
        </PropertyPanel>
      );
      expect(screen.getByText('Position')).toBeInTheDocument();
      expect(screen.getByText('0, 0, 0')).toBeInTheDocument();
    });

    it('renders modified dot when modified', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertyRow label="Position" modified>
            <span>1, 2, 3</span>
          </PropertyRow>
        </PropertyPanel>
      );
      expect(screen.getByTestId('modified-dot')).toBeInTheDocument();
    });

    it('renders full-width layout when fullWidth', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertyRow label="Notes" fullWidth testId="full-row">
            <textarea />
          </PropertyRow>
        </PropertyPanel>
      );
      const row = screen.getByTestId('full-row');
      expect(row).toBeInTheDocument();
    });

    it('respects custom splitRatio', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertyRow
            label="Position"
            splitRatio={[30, 70]}
            testId="custom-split"
          >
            <span>Value</span>
          </PropertyRow>
        </PropertyPanel>
      );
      expect(screen.getByTestId('custom-split')).toBeInTheDocument();
    });

    it('hides when visible=false', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertyRow label="Hidden" visible={false} testId="hidden-row">
            <span>Value</span>
          </PropertyRow>
        </PropertyPanel>
      );
      const row = screen.getByTestId('hidden-row');
      expect(row).toHaveStyle({ display: 'none' });
    });
  });

  describe('Interactions', () => {
    it('renders reset button when onReset is provided', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertyRow label="Position" onReset={() => {}}>
            <span>Value</span>
          </PropertyRow>
        </PropertyPanel>
      );
      expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    });

    it('calls onReset when reset button is clicked', () => {
      const onReset = vi.fn();
      renderWithTheme(
        <PropertyPanel>
          <PropertyRow label="Position" onReset={onReset}>
            <span>Value</span>
          </PropertyRow>
        </PropertyPanel>
      );

      fireEvent.click(screen.getByTestId('reset-button'));
      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });
});

// === PropertyGroup ===

describe('PropertyGroup', () => {
  describe('Rendering', () => {
    it('renders title and children', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertyGroup title="Textures" testId="group">
            <PropertyRow label="Albedo">
              <span>None</span>
            </PropertyRow>
          </PropertyGroup>
        </PropertyPanel>
      );
      expect(screen.getByText('Textures')).toBeInTheDocument();
      expect(screen.getByText('Albedo')).toBeInTheDocument();
    });

    it('applies indent styling', () => {
      renderWithTheme(
        <PropertyPanel>
          <PropertyGroup title="Nested" indent={2} testId="indented-group">
            <PropertyRow label="Value">
              <span>Test</span>
            </PropertyRow>
          </PropertyGroup>
        </PropertyPanel>
      );
      expect(screen.getByTestId('indented-group')).toBeInTheDocument();
    });
  });
});

// === usePropertyUndo ===

describe('usePropertyUndo', () => {
  it('starts with empty stacks', () => {
    const { result } = renderHook(() => usePropertyUndo());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.history).toHaveLength(0);
  });

  it('record adds entry to undo stack', () => {
    const { result } = renderHook(() => usePropertyUndo<number>());

    act(() => {
      result.current.record({
        propertyId: 'position.x',
        previousValue: 0,
        newValue: 5,
        label: 'Change X',
      });
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]?.propertyId).toBe('position.x');
    expect(result.current.history[0]?.timestamp).toBeGreaterThan(0);
  });

  it('undo returns last entry and enables redo', () => {
    const { result } = renderHook(() => usePropertyUndo<number>());

    act(() => {
      result.current.record({
        propertyId: 'position.x',
        previousValue: 0,
        newValue: 5,
        label: 'Change X',
      });
    });

    let entry: PropertyUndoEntry<number> | null = null;
    act(() => {
      entry = result.current.undo();
    });

    expect(entry).not.toBeNull();
    const undoneEntry = entry as unknown as PropertyUndoEntry<number>;
    expect(undoneEntry.propertyId).toBe('position.x');
    expect(undoneEntry.previousValue).toBe(0);
    expect(undoneEntry.newValue).toBe(5);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('redo restores undone entry', () => {
    const { result } = renderHook(() => usePropertyUndo<number>());

    act(() => {
      result.current.record({
        propertyId: 'position.x',
        previousValue: 0,
        newValue: 5,
        label: 'Change X',
      });
    });

    act(() => {
      result.current.undo();
    });

    let entry: PropertyUndoEntry<number> | null = null;
    act(() => {
      entry = result.current.redo();
    });

    expect(entry).not.toBeNull();
    const redoneEntry = entry as unknown as PropertyUndoEntry<number>;
    expect(redoneEntry.propertyId).toBe('position.x');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('new record clears redo stack', () => {
    const { result } = renderHook(() => usePropertyUndo<number>());

    act(() => {
      result.current.record({
        propertyId: 'position.x',
        previousValue: 0,
        newValue: 5,
        label: 'Change X',
      });
    });

    act(() => {
      result.current.undo();
    });

    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.record({
        propertyId: 'position.x',
        previousValue: 0,
        newValue: 10,
        label: 'Change X again',
      });
    });

    expect(result.current.canRedo).toBe(false);
    expect(result.current.history).toHaveLength(1);
  });

  it('clear empties both stacks', () => {
    const { result } = renderHook(() => usePropertyUndo<number>());

    act(() => {
      result.current.record({
        propertyId: 'position.x',
        previousValue: 0,
        newValue: 5,
        label: 'Change X',
      });
      result.current.record({
        propertyId: 'position.y',
        previousValue: 0,
        newValue: 3,
        label: 'Change Y',
      });
    });

    expect(result.current.history).toHaveLength(2);

    act(() => {
      result.current.clear();
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.history).toHaveLength(0);
  });

  it('respects maxHistory limit', () => {
    const { result } = renderHook(() =>
      usePropertyUndo<number>({ maxHistory: 3 })
    );

    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.record({
          propertyId: `prop.${i}`,
          previousValue: i,
          newValue: i + 1,
          label: `Change ${i}`,
        });
      }
    });

    expect(result.current.history).toHaveLength(3);
    // Oldest entries should have been dropped
    expect(result.current.history[0]?.propertyId).toBe('prop.2');
  });
});
