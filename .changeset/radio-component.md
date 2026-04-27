---
'entangle-ui': minor
---

Add `Radio` and `RadioGroup` primitives. Closes the last gap in Phase 1 by providing a styled, accessible alternative to native radio inputs for mutually exclusive selection.

- `Radio`: standalone (controlled or uncontrolled) or context-driven, with sizes (sm/md/lg), label position, helper text, and error state.
- `RadioGroup`: manages exclusive selection, propagates `name`, `size`, `disabled`, and `error` via context, supports vertical/horizontal orientation, custom spacing, required/error states, and helper text.
- Native `<input type="radio">` under the hood so browser arrow-key navigation and form submission work out of the box.
- Honors `prefers-reduced-motion`.
