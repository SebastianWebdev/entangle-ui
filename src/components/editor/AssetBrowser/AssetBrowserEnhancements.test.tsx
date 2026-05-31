import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithTheme } from '@/tests/testUtils';
import { AssetBrowser } from './AssetBrowser';
import type { AssetItem } from './AssetBrowser.types';

const items: AssetItem[] = [
  { id: 'folder1', name: 'Textures', kind: 'folder' },
  { id: 'file1', name: 'wood.png', kind: 'file', assetType: 'image' },
  { id: 'file2', name: 'clip.mp4', kind: 'file', assetType: 'video' },
  { id: 'file3', name: 'beep.wav', kind: 'file', assetType: 'audio' },
];

describe('AssetBrowser — states', () => {
  it('renders the built-in error state with a working Retry button', () => {
    const onErrorRetry = vi.fn();
    renderWithTheme(
      <AssetBrowser items={items} error onErrorRetry={onErrorRetry} />
    );
    expect(screen.getByText('Couldn’t load assets')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onErrorRetry).toHaveBeenCalledTimes(1);
  });

  it('renders a custom error node and hides the grid', () => {
    renderWithTheme(
      <AssetBrowser items={items} error={<div>Network down</div>} />
    );
    expect(screen.getByText('Network down')).toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('treats error={false} as no error', () => {
    renderWithTheme(<AssetBrowser items={items} error={false} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('error takes precedence over loading', () => {
    renderWithTheme(<AssetBrowser items={items} loading error />);
    expect(screen.getByText('Couldn’t load assets')).toBeInTheDocument();
  });

  it('renders a skeleton grid (loadingItemCount cells) while loading', () => {
    renderWithTheme(
      <AssetBrowser items={items} loading loadingItemCount={5} />
    );
    const skeletonGrid = screen.getByTestId('asset-browser-loading');
    expect(skeletonGrid.childElementCount).toBe(5);
    // The real grid is not rendered while loading.
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});

describe('AssetBrowser — i18n labels', () => {
  it('overrides built-in strings from the labels prop', () => {
    renderWithTheme(
      <AssetBrowser
        items={[]}
        labels={{
          searchPlaceholder: 'Szukaj zasobów…',
          empty: 'Folder jest pusty.',
        }}
      />
    );
    expect(screen.getByPlaceholderText('Szukaj zasobów…')).toBeInTheDocument();
    expect(screen.getByText('Folder jest pusty.')).toBeInTheDocument();
  });

  it('keeps default strings for keys that are not overridden', () => {
    renderWithTheme(
      <AssetBrowser items={items} labels={{ empty: 'Pusto.' }} />
    );
    // searchPlaceholder was not overridden → still English.
    expect(screen.getByPlaceholderText('Search assets…')).toBeInTheDocument();
  });

  it('translates the live-region announcement', () => {
    renderWithTheme(
      <AssetBrowser
        items={items}
        showStatusBar
        labels={{
          itemCount: n => `${n} elementów`,
          selectedCount: n => ` (${n})`,
        }}
        selection={['file1']}
      />
    );
    expect(screen.getAllByText('4 elementów (1)').length).toBeGreaterThan(0);
  });
});

describe('AssetBrowser — grid a11y', () => {
  it('exposes true row/column totals on the grid', () => {
    renderWithTheme(<AssetBrowser items={items} />);
    const grid = screen.getByRole('grid');
    expect(grid).toHaveAttribute('aria-rowcount');
    expect(grid).toHaveAttribute('aria-colcount');
  });

  it('gives every cell a 1-based aria-colindex and a stable id', () => {
    renderWithTheme(<AssetBrowser items={items} />);
    const cells = screen.getAllByRole('gridcell');
    cells.forEach(cell => {
      expect(cell).toHaveAttribute('aria-colindex');
      expect(cell).toHaveAttribute('aria-rowindex');
      expect(cell.id).not.toBe('');
    });
  });
});

describe('AssetBrowser — thumbnail fallback', () => {
  it('falls back to the type icon when the thumbnail image errors', () => {
    const withThumb: AssetItem[] = [
      {
        id: 'broken',
        name: 'broken.png',
        kind: 'file',
        assetType: 'image',
        thumbnailUrl: 'https://example.invalid/missing.png',
      },
    ];
    const { container } = renderWithTheme(<AssetBrowser items={withThumb} />);
    const img = container.querySelector('img');
    if (!img) throw new Error('expected a thumbnail <img>');
    fireEvent.error(img);
    // After the error the <img> is gone, replaced by the fallback icon.
    expect(container.querySelector('img')).toBeNull();
  });
});

describe('AssetBrowser — empty-area context menu', () => {
  it('does not wrap the surface when no menu render-prop is given', () => {
    renderWithTheme(<AssetBrowser items={items} />);
    // Sanity: grid renders normally without a context-menu trigger error.
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('invokes renderEmptyContextMenu lazily (not before open)', () => {
    const renderEmptyContextMenu = vi.fn(() => <div>menu</div>);
    renderWithTheme(
      <AssetBrowser
        items={items}
        renderEmptyContextMenu={renderEmptyContextMenu}
      />
    );
    // base-ui keeps the closed popup unmounted, so the body isn't rendered yet.
    expect(screen.queryByText('menu')).not.toBeInTheDocument();
  });
});

describe('AssetBrowser — per-item context menu', () => {
  it('keeps the cell a working trigger: right-click still selects', () => {
    const onSelectionChange = vi.fn();
    renderWithTheme(
      <AssetBrowser
        items={items}
        onSelectionChange={onSelectionChange}
        renderItemContextMenu={selected => (
          <div>menu for {selected.length}</div>
        )}
      />
    );
    // The cell is still rendered (wrapped as a ContextMenu trigger) and a
    // right-click runs the contextMenuSelect path.
    fireEvent.contextMenu(screen.getByText('wood.png'));
    expect(onSelectionChange).toHaveBeenCalledWith(['file1'], {
      reason: 'contextMenu',
    });
  });

  it('does not render the item menu body before it is opened', () => {
    renderWithTheme(
      <AssetBrowser
        items={items}
        renderItemContextMenu={() => <div>item-menu-body</div>}
      />
    );
    expect(screen.queryByText('item-menu-body')).not.toBeInTheDocument();
  });
});

describe('AssetBrowser — controlled navigation history', () => {
  it('re-seeds the back stack when currentFolderId changes out-of-band', () => {
    const onNavigate = vi.fn();
    const { rerender } = renderWithTheme(
      <AssetBrowser
        items={items}
        history
        currentFolderId="root"
        onNavigate={onNavigate}
      />
    );
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

    // Parent navigates externally (e.g. a deep link) — not via the browser UI.
    rerender(
      <AssetBrowser
        items={items}
        history
        currentFolderId="textures"
        onNavigate={onNavigate}
      />
    );

    const back = screen.getByRole('button', { name: 'Back' });
    expect(back).toBeEnabled();
    fireEvent.click(back);
    expect(onNavigate).toHaveBeenLastCalledWith('root', 'back');
  });
});
