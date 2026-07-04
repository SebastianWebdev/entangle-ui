import type { EditableTextLabels } from './EditableText.types';

/**
 * English defaults for every user-facing string EditableText renders. Override
 * any subset by passing `labels` to `<EditableText>`; the rest fall back here.
 */
export const DEFAULT_EDITABLE_TEXT_LABELS: EditableTextLabels = {
  editLabel: 'Edit text',
};

/** Merge a partial `labels` override onto the English defaults. */
export function resolveEditableTextLabels(
  overrides: Partial<EditableTextLabels> | undefined
): EditableTextLabels {
  return overrides
    ? { ...DEFAULT_EDITABLE_TEXT_LABELS, ...overrides }
    : DEFAULT_EDITABLE_TEXT_LABELS;
}
