---
'entangle-ui': minor
---

`PropertyRow`: fix the label tooltip and allow a `ReactNode` label.

- **Tooltip fix.** The label tooltip never appeared because the tooltip trigger wrapped its content in a `display: contents` element, which generates no box and therefore no hover/focus target (the `Tooltip` primitive disables pointer events on the trigger and re-enables them only on its direct child). The wrapper is now a real `inline-flex` box, so hovering or focusing the label shows the tooltip.
- **`label: ReactNode`.** `PropertyRow.label` was typed `string` but already rendered any node. It is now typed `React.ReactNode`, so an icon + text (or any custom markup) can be used as a label without a cast. This is a widening, so existing string labels are unaffected.
