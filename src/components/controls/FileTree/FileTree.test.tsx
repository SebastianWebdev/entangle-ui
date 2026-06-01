import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { renderWithTheme } from '@/tests/testUtils';

import { FileTree } from './FileTree';

import type { FileTreeImportPayload, FileTreeNode } from './FileTree.types';

const nodes: FileTreeNode[] = [
  {
    id: 'src',
    name: 'src',
    kind: 'folder',
    children: [
      { id: 'btn', name: 'Button.tsx', kind: 'file' },
      { id: 'logo', name: 'logo.svg', kind: 'file' },
    ],
  },
  {
    id: 'assets',
    name: 'assets',
    kind: 'folder',
    children: [{ id: 'song', name: 'theme.mp3', kind: 'file' }],
  },
  { id: 'readme', name: 'README.md', kind: 'file' },
];

/** Builds a minimal file-carrying DataTransfer for drag events. */
function filesTransfer(files: File[]): DataTransfer {
  return {
    types: ['Files'],
    files,
    dropEffect: 'none',
  } as unknown as DataTransfer;
}

describe('FileTree', () => {
  describe('Rendering', () => {
    it('renders root files and folders by name', () => {
      renderWithTheme(<FileTree nodes={nodes} />);
      expect(screen.getByText('src')).toBeInTheDocument();
      expect(screen.getByText('assets')).toBeInTheDocument();
      expect(screen.getByText('README.md')).toBeInTheDocument();
    });

    it('hides children of collapsed folders', () => {
      renderWithTheme(<FileTree nodes={nodes} />);
      expect(screen.queryByText('Button.tsx')).not.toBeInTheDocument();
    });

    it('shows children of folders in defaultExpandedIds', () => {
      renderWithTheme(<FileTree nodes={nodes} defaultExpandedIds={['src']} />);
      expect(screen.getByText('Button.tsx')).toBeInTheDocument();
      expect(screen.getByText('logo.svg')).toBeInTheDocument();
    });

    it('renders a built-in file-type icon for files', () => {
      const { container } = renderWithTheme(
        <FileTree
          nodes={[{ id: 'a', name: 'a.ts', kind: 'file' }]}
          showChevrons={false}
        />
      );
      const row = container.querySelector('#treenode-a');
      expect(row?.querySelector('svg')).toBeTruthy();
    });

    it('renders a custom empty state', () => {
      renderWithTheme(<FileTree nodes={[]} emptyContent="No files" />);
      expect(screen.getByText('No files')).toBeInTheDocument();
    });

    it('applies the testId to the container', () => {
      renderWithTheme(<FileTree nodes={nodes} testId="ft" />);
      expect(screen.getByTestId('ft')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('uses resolveIcon when provided', () => {
      renderWithTheme(
        <FileTree
          nodes={nodes}
          defaultExpandedIds={['src']}
          resolveIcon={node => <span data-testid={`ic-${node.id}`} />}
        />
      );
      expect(screen.getByTestId('ic-readme')).toBeInTheDocument();
      expect(screen.getByTestId('ic-btn')).toBeInTheDocument();
    });

    it('exposes expansion state to resolveIcon', () => {
      const resolveIcon = vi.fn<
        (node: FileTreeNode, state: { expanded: boolean }) => null
      >(() => null);
      renderWithTheme(
        <FileTree
          nodes={nodes}
          defaultExpandedIds={['src']}
          resolveIcon={resolveIcon}
        />
      );
      const srcCall = resolveIcon.mock.calls.find(
        ([node]) => node.id === 'src'
      );
      expect(srcCall?.[1]).toEqual({ expanded: true });
    });
  });

  describe('Render escape hatches', () => {
    it('fully replaces node content with renderNode', () => {
      renderWithTheme(
        <FileTree
          nodes={nodes}
          renderNode={(node, state) => (
            <span data-testid={`rn-${node.id}`}>
              {node.name}
              {state.isFolder ? ' (dir)' : ''}
            </span>
          )}
        />
      );
      expect(screen.getByTestId('rn-src')).toHaveTextContent('src (dir)');
      expect(screen.getByTestId('rn-readme')).toHaveTextContent('README.md');
    });

    it('renders trailing actions with renderActions', () => {
      renderWithTheme(
        <FileTree
          nodes={nodes}
          renderActions={node => (
            <button data-testid={`act-${node.id}`}>x</button>
          )}
        />
      );
      expect(screen.getByTestId('act-readme')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('fires onNodeClick with the FileTreeNode', () => {
      let clicked: FileTreeNode | undefined;
      const onNodeClick = vi.fn((node: FileTreeNode) => {
        clicked = node;
      });
      renderWithTheme(<FileTree nodes={nodes} onNodeClick={onNodeClick} />);
      fireEvent.click(screen.getByText('README.md'));
      expect(onNodeClick).toHaveBeenCalledTimes(1);
      expect(clicked?.id).toBe('readme');
      expect(clicked?.kind).toBe('file');
    });

    it('fires onSelectionChange on click', () => {
      const onSelectionChange = vi.fn();
      renderWithTheme(
        <FileTree nodes={nodes} onSelectionChange={onSelectionChange} />
      );
      fireEvent.click(screen.getByText('README.md'));
      expect(onSelectionChange).toHaveBeenCalledWith(['readme']);
    });

    it('expands a folder via the chevron', () => {
      const onExpandedChange = vi.fn();
      const { container } = renderWithTheme(
        <FileTree nodes={nodes} onExpandedChange={onExpandedChange} />
      );
      const srcRow = container.querySelector('#treenode-src');
      const chevron = srcRow?.querySelector('span');
      expect(chevron).toBeTruthy();
      fireEvent.click(chevron as Element);
      expect(onExpandedChange).toHaveBeenCalledWith(['src']);
      expect(screen.getByText('Button.tsx')).toBeInTheDocument();
    });
  });

  describe('Drag and drop import', () => {
    it('imports files dropped onto a folder, targeting that folder', () => {
      let payload: FileTreeImportPayload | undefined;
      const onImport = vi.fn((p: FileTreeImportPayload) => {
        payload = p;
      });
      const { container } = renderWithTheme(
        <FileTree nodes={nodes} onImport={onImport} />
      );
      const srcRow = container.querySelector('#treenode-src') as Element;
      const file = new File(['data'], 'texture.png', { type: 'image/png' });

      fireEvent.dragOver(srcRow, { dataTransfer: filesTransfer([file]) });
      expect(srcRow).toHaveAttribute('data-drop-target', 'true');

      fireEvent.drop(srcRow, { dataTransfer: filesTransfer([file]) });
      expect(onImport).toHaveBeenCalledTimes(1);
      expect(payload?.files).toHaveLength(1);
      expect(payload?.targetFolder?.id).toBe('src');
    });

    it('imports files dropped on empty space, targeting the root', () => {
      let payload: FileTreeImportPayload | undefined;
      const onImport = vi.fn((p: FileTreeImportPayload) => {
        payload = p;
      });
      renderWithTheme(
        <FileTree nodes={nodes} onImport={onImport} testId="ft" />
      );
      const root = screen.getByTestId('ft');
      const file = new File(['data'], 'notes.txt', { type: 'text/plain' });

      fireEvent.drop(root, { dataTransfer: filesTransfer([file]) });
      expect(onImport).toHaveBeenCalledTimes(1);
      expect(payload?.targetFolder).toBeNull();
    });

    it('does not highlight or import non-file drags', () => {
      const onImport = vi.fn();
      const { container } = renderWithTheme(
        <FileTree nodes={nodes} onImport={onImport} />
      );
      const srcRow = container.querySelector('#treenode-src') as Element;
      const textTransfer = {
        types: ['text/plain'],
        files: [],
        dropEffect: 'none',
      } as unknown as DataTransfer;

      fireEvent.dragOver(srcRow, { dataTransfer: textTransfer });
      expect(srcRow).not.toHaveAttribute('data-drop-target');
    });

    it('attaches no drop wiring without onImport', () => {
      const { container } = renderWithTheme(<FileTree nodes={nodes} />);
      const srcRow = container.querySelector('#treenode-src') as Element;
      const file = new File(['data'], 'a.png', { type: 'image/png' });

      fireEvent.dragOver(srcRow, { dataTransfer: filesTransfer([file]) });
      expect(srcRow).not.toHaveAttribute('data-drop-target');
    });
  });

  describe('Accessibility', () => {
    it('exposes a tree with treeitems', () => {
      renderWithTheme(<FileTree nodes={nodes} />);
      expect(screen.getByRole('tree')).toBeInTheDocument();
      expect(screen.getAllByRole('treeitem').length).toBeGreaterThan(0);
    });
  });
});
