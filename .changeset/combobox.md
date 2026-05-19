---
'entangle-ui': minor
---

Add `Combobox` component (`@/components/controls/Combobox`). Single-value select with an editable input — filters the option list as the user types using the built-in fuzzy matcher (`fuzzyScore` from CommandPalette), configurable via `filterFn`. Supports controlled and uncontrolled modes, optional `freeSolo` for accepting arbitrary input, optional `creatable` mode that surfaces a `Create "<query>"` row and invokes `onCreate`, an async-friendly `loading` state, optional `openOnFocus`, optional `clearable` button, and shares keyboard navigation with MultiSelect through `useListboxNav`.
