/**
 * Localizable strings for {@link FileTree}. Every user-facing / screen-reader
 * string the component renders on its own goes through here so the whole
 * component can be localized in one place (file and folder names come from your
 * data, so they are already yours to localize).
 *
 * @see DEFAULT_FILE_TREE_LABELS for the English defaults.
 */
export interface FileTreeLabels {
  /** Accessible name for the tree region (`role="tree"` `aria-label`). */
  treeLabel: string;
  /** Text shown when the tree is empty (unless `emptyContent` is provided). */
  emptyLabel: string;
}

/** English defaults for {@link FileTreeLabels}. Spread-and-tweak to localize. */
export const DEFAULT_FILE_TREE_LABELS: FileTreeLabels = {
  treeLabel: 'File tree',
  emptyLabel: 'No files',
};
