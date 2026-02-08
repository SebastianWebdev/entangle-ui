import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithTheme } from '@/tests/testUtils';
import { TreeView } from './TreeView';
import type { TreeNodeData } from './TreeView.types';

const basicNodes: TreeNodeData[] = [
  {
    id: 'root1',
    label: 'Root 1',
    children: [
      { id: 'child1', label: 'Child 1' },
      { id: 'child2', label: 'Child 2' },
    ],
  },
  {
    id: 'root2',
    label: 'Root 2',
    children: [{ id: 'child3', label: 'Child 3' }],
  },
  { id: 'root3', label: 'Root 3' },
];

const disabledNodes: TreeNodeData[] = [
  { id: 'enabled', label: 'Enabled' },
  { id: 'disabled', label: 'Disabled', disabled: true },
];

describe('TreeView', () => {
  describe('Rendering', () => {
    it('renders tree from nodes data', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      expect(screen.getByRole('tree')).toBeInTheDocument();
      expect(screen.getByText('Root 1')).toBeInTheDocument();
      expect(screen.getByText('Root 2')).toBeInTheDocument();
      expect(screen.getByText('Root 3')).toBeInTheDocument();
    });

    it('does not show children of collapsed nodes', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Child 2')).not.toBeInTheDocument();
    });

    it('shows children of expanded nodes', () => {
      renderWithTheme(
        <TreeView nodes={basicNodes} defaultExpandedIds={['root1']} />
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('applies data-testid', () => {
      renderWithTheme(<TreeView nodes={basicNodes} testId="my-tree" />);
      expect(screen.getByTestId('my-tree')).toBeInTheDocument();
    });

    it('renders empty state when no nodes', () => {
      renderWithTheme(<TreeView nodes={[]} />);
      expect(screen.getByText('No items')).toBeInTheDocument();
    });

    it('renders custom empty content', () => {
      renderWithTheme(<TreeView nodes={[]} emptyContent="Nothing here" />);
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });
  });

  describe('Expansion', () => {
    it('expands node on chevron click', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();

      // Click on Root 1 row (which has a chevron)
      const root1 = screen
        .getByText('Root 1')
        .closest('[role="treeitem"]') as HTMLElement;
      const chevron = root1.querySelector(
        '[aria-hidden="true"]'
      ) as HTMLElement;
      fireEvent.click(chevron);

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('collapses expanded node on chevron click', () => {
      renderWithTheme(
        <TreeView nodes={basicNodes} defaultExpandedIds={['root1']} />
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();

      const root1 = screen
        .getByText('Root 1')
        .closest('[role="treeitem"]') as HTMLElement;
      const chevron = root1.querySelector(
        '[aria-hidden="true"]'
      ) as HTMLElement;
      fireEvent.click(chevron);

      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    });

    it('calls onExpandedChange when toggling', () => {
      const handleExpand = vi.fn();
      renderWithTheme(
        <TreeView nodes={basicNodes} onExpandedChange={handleExpand} />
      );

      const root1 = screen
        .getByText('Root 1')
        .closest('[role="treeitem"]') as HTMLElement;
      const chevron = root1.querySelector(
        '[aria-hidden="true"]'
      ) as HTMLElement;
      fireEvent.click(chevron);

      expect(handleExpand).toHaveBeenCalledWith(['root1']);
    });

    it('respects controlled expandedIds', () => {
      renderWithTheme(<TreeView nodes={basicNodes} expandedIds={['root1']} />);
      expect(screen.getByText('Child 1')).toBeInTheDocument();
    });
  });

  describe('Selection (single)', () => {
    it('selects node on click', () => {
      const handleSelection = vi.fn();
      renderWithTheme(
        <TreeView nodes={basicNodes} onSelectionChange={handleSelection} />
      );

      fireEvent.click(screen.getByText('Root 1'));
      expect(handleSelection).toHaveBeenCalledWith(['root1']);
    });

    it('replaces selection on subsequent click', () => {
      const handleSelection = vi.fn();
      renderWithTheme(
        <TreeView nodes={basicNodes} onSelectionChange={handleSelection} />
      );

      fireEvent.click(screen.getByText('Root 1'));
      fireEvent.click(screen.getByText('Root 2'));

      const lastCall = handleSelection.mock.calls[
        handleSelection.mock.calls.length - 1
      ] as [string[]];
      expect(lastCall[0]).toEqual(['root2']);
    });

    it('respects controlled selectedIds', () => {
      renderWithTheme(
        <TreeView
          nodes={basicNodes}
          selectedIds={['root1']}
          defaultExpandedIds={['root1']}
        />
      );
      const root1 = screen
        .getByText('Root 1')
        .closest('[role="treeitem"]') as HTMLElement;
      expect(root1).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Selection (multiple)', () => {
    it('supports Ctrl+Click toggle', () => {
      const handleSelection = vi.fn();
      renderWithTheme(
        <TreeView
          nodes={basicNodes}
          selectionMode="multiple"
          onSelectionChange={handleSelection}
        />
      );

      fireEvent.click(screen.getByText('Root 1'));
      fireEvent.click(screen.getByText('Root 2'), { ctrlKey: true });

      const lastCall = handleSelection.mock.calls[
        handleSelection.mock.calls.length - 1
      ] as [string[]];
      expect(lastCall[0]).toContain('root1');
      expect(lastCall[0]).toContain('root2');
    });

    it('supports Shift+Click range selection', () => {
      const handleSelection = vi.fn();
      renderWithTheme(
        <TreeView
          nodes={basicNodes}
          selectionMode="multiple"
          onSelectionChange={handleSelection}
        />
      );

      fireEvent.click(screen.getByText('Root 1'));
      fireEvent.click(screen.getByText('Root 3'), { shiftKey: true });

      const lastCall = handleSelection.mock.calls[
        handleSelection.mock.calls.length - 1
      ] as [string[]];
      expect(lastCall[0]).toContain('root1');
      expect(lastCall[0]).toContain('root2');
      expect(lastCall[0]).toContain('root3');
    });
  });

  describe('Selection (none)', () => {
    it('does not select in none mode', () => {
      const handleSelection = vi.fn();
      renderWithTheme(
        <TreeView
          nodes={basicNodes}
          selectionMode="none"
          onSelectionChange={handleSelection}
        />
      );

      fireEvent.click(screen.getByText('Root 1'));
      expect(handleSelection).not.toHaveBeenCalled();
    });
  });

  describe('Disabled Nodes', () => {
    it('disabled nodes have aria-disabled', () => {
      renderWithTheme(<TreeView nodes={disabledNodes} />);
      const disabledNode = screen
        .getByText('Disabled')
        .closest('[role="treeitem"]') as HTMLElement;
      expect(disabledNode).toHaveAttribute('aria-disabled', 'true');
    });

    it('disabled nodes are not selectable', () => {
      const handleSelection = vi.fn();
      renderWithTheme(
        <TreeView nodes={disabledNodes} onSelectionChange={handleSelection} />
      );

      fireEvent.click(screen.getByText('Disabled'));
      expect(handleSelection).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('ArrowDown moves focus to next visible node', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      const tree = screen.getByRole('tree');

      fireEvent.keyDown(tree, { key: 'ArrowDown' });
      // Should focus first node
      expect(tree).toHaveAttribute('aria-activedescendant', 'treenode-root1');

      fireEvent.keyDown(tree, { key: 'ArrowDown' });
      expect(tree).toHaveAttribute('aria-activedescendant', 'treenode-root2');
    });

    it('ArrowUp moves focus to previous visible node', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      const tree = screen.getByRole('tree');

      // Move down twice then up once
      fireEvent.keyDown(tree, { key: 'ArrowDown' });
      fireEvent.keyDown(tree, { key: 'ArrowDown' });
      fireEvent.keyDown(tree, { key: 'ArrowUp' });

      expect(tree).toHaveAttribute('aria-activedescendant', 'treenode-root1');
    });

    it('ArrowRight expands collapsed node', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      const tree = screen.getByRole('tree');

      // Focus root1
      fireEvent.keyDown(tree, { key: 'ArrowDown' });
      // Expand
      fireEvent.keyDown(tree, { key: 'ArrowRight' });

      expect(screen.getByText('Child 1')).toBeInTheDocument();
    });

    it('ArrowLeft collapses expanded node', () => {
      renderWithTheme(
        <TreeView nodes={basicNodes} defaultExpandedIds={['root1']} />
      );
      const tree = screen.getByRole('tree');

      // Focus root1
      fireEvent.keyDown(tree, { key: 'ArrowDown' });
      // Collapse
      fireEvent.keyDown(tree, { key: 'ArrowLeft' });

      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    });

    it('Home moves focus to first node', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      const tree = screen.getByRole('tree');

      // Move to end
      fireEvent.keyDown(tree, { key: 'End' });
      // Move to home
      fireEvent.keyDown(tree, { key: 'Home' });

      expect(tree).toHaveAttribute('aria-activedescendant', 'treenode-root1');
    });

    it('End moves focus to last visible node', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      const tree = screen.getByRole('tree');

      fireEvent.keyDown(tree, { key: 'End' });

      expect(tree).toHaveAttribute('aria-activedescendant', 'treenode-root3');
    });

    it('Enter selects focused node', () => {
      const handleSelection = vi.fn();
      renderWithTheme(
        <TreeView nodes={basicNodes} onSelectionChange={handleSelection} />
      );
      const tree = screen.getByRole('tree');

      fireEvent.keyDown(tree, { key: 'ArrowDown' });
      fireEvent.keyDown(tree, { key: 'Enter' });

      expect(handleSelection).toHaveBeenCalledWith(['root1']);
    });

    it('Space toggles selection in multiple mode', () => {
      const handleSelection = vi.fn();
      renderWithTheme(
        <TreeView
          nodes={basicNodes}
          selectionMode="multiple"
          onSelectionChange={handleSelection}
        />
      );
      const tree = screen.getByRole('tree');

      fireEvent.keyDown(tree, { key: 'ArrowDown' });
      fireEvent.keyDown(tree, { key: ' ' });

      expect(handleSelection).toHaveBeenCalled();
    });

    it('Ctrl+A selects all in multiple mode', () => {
      const handleSelection = vi.fn();
      renderWithTheme(
        <TreeView
          nodes={basicNodes}
          selectionMode="multiple"
          onSelectionChange={handleSelection}
        />
      );
      const tree = screen.getByRole('tree');

      fireEvent.keyDown(tree, { key: 'a', ctrlKey: true });

      const lastCall = handleSelection.mock.calls[
        handleSelection.mock.calls.length - 1
      ] as [string[]];
      expect(lastCall[0]).toContain('root1');
      expect(lastCall[0]).toContain('root2');
      expect(lastCall[0]).toContain('root3');
    });
  });

  describe('Context Menu', () => {
    it('fires onNodeContextMenu on right-click', () => {
      const handleContext = vi.fn();
      renderWithTheme(
        <TreeView nodes={basicNodes} onNodeContextMenu={handleContext} />
      );

      fireEvent.contextMenu(screen.getByText('Root 1'));
      expect(handleContext).toHaveBeenCalled();
      expect(handleContext.mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({ id: 'root1' })
      );
    });
  });

  describe('Accessibility', () => {
    it('has role="tree"', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    it('nodes have role="treeitem"', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      const items = screen.getAllByRole('treeitem');
      expect(items.length).toBe(3); // only root-level visible
    });

    it('parent nodes have aria-expanded', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      const root1 = screen
        .getByText('Root 1')
        .closest('[role="treeitem"]') as HTMLElement;
      expect(root1).toHaveAttribute('aria-expanded', 'false');
    });

    it('leaf nodes do not have aria-expanded', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      const root3 = screen
        .getByText('Root 3')
        .closest('[role="treeitem"]') as HTMLElement;
      expect(root3).not.toHaveAttribute('aria-expanded');
    });

    it('selected nodes have aria-selected', () => {
      renderWithTheme(
        <TreeView nodes={basicNodes} defaultSelectedIds={['root1']} />
      );
      const root1 = screen
        .getByText('Root 1')
        .closest('[role="treeitem"]') as HTMLElement;
      expect(root1).toHaveAttribute('aria-selected', 'true');
    });

    it('nodes have aria-level', () => {
      renderWithTheme(
        <TreeView nodes={basicNodes} defaultExpandedIds={['root1']} />
      );
      const root1 = screen
        .getByText('Root 1')
        .closest('[role="treeitem"]') as HTMLElement;
      expect(root1).toHaveAttribute('aria-level', '1');

      const child1 = screen
        .getByText('Child 1')
        .closest('[role="treeitem"]') as HTMLElement;
      expect(child1).toHaveAttribute('aria-level', '2');
    });

    it('has aria-multiselectable in multiple mode', () => {
      renderWithTheme(<TreeView nodes={basicNodes} selectionMode="multiple" />);
      expect(screen.getByRole('tree')).toHaveAttribute(
        'aria-multiselectable',
        'true'
      );
    });

    it('has aria-activedescendant when node is focused', () => {
      renderWithTheme(<TreeView nodes={basicNodes} />);
      const tree = screen.getByRole('tree');

      fireEvent.keyDown(tree, { key: 'ArrowDown' });
      expect(tree).toHaveAttribute('aria-activedescendant', 'treenode-root1');
    });
  });
});
