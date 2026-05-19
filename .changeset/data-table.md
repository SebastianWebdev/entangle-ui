---
'entangle-ui': minor
---

Add `DataTable` component (`@/components/data/DataTable`) — a new `data` category. Sortable columns (three-state cycle asc → desc → none, controllable via `sort` / `onSortChange` / `manualSort`), single or multiple row selection with controlled and uncontrolled modes, custom `rowKey`, three densities (`comfortable` / `compact` / `dense`), sticky header, optional sticky-left columns via per-column `sticky`, optional column resizing via `resizableColumns`, custom row renderer, empty state slot, loading state with skeleton rows, and row virtualization auto-enabled above 100 rows (opt-in / opt-out via `virtualized`). Built on `@tanstack/react-virtual` (added as a peer dependency) and uses CSS grid under `role="grid"` so columns line up across the sticky header and individual virtualized rows. Keyboard navigation supports ArrowUp/Down, Home/End, PageUp/PageDown, Space (toggle in multi mode) and Enter (activate, toggle in single mode).
