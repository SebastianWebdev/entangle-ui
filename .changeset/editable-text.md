---
'entangle-ui': minor
---

Add `EditableText`: a primitive that renders like `Text` but becomes a chrome-less inline editor on click — the editor-UI pattern for renaming layers, nodes, and assets in place. The idle state renders a real `<Text>` (inheriting every typography prop) and the editing state renders an `<input>` sharing the same typography recipe, so the swap is seamless; the field auto-sizes to its content with no measurement effects. Supports controlled/uncontrolled `value`, `activationMode` (`single` / `double`, plus Enter/F2 keyboard activation), commit on Enter/blur, cancel on Escape, `submitOnBlur` and `selectOnEdit` toggles, an imperative handle (`edit` / `commit` / `cancel` / `focus` / `isEditing` / `getElement`), full i18n via `labels` (`DEFAULT_EDITABLE_TEXT_LABELS`), and overridable `--etui-editable-text-*` custom properties.
