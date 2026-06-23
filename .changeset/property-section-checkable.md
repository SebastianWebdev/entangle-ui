---
'entangle-ui': minor
---

`PropertySection`: add a first-class checkable section.

Set `checkable` to render a managed enable/disable toggle in the section header (built on the `Switch` primitive). When the toggle is off, the section body is dimmed and made non-interactive (`pointer-events: none`) but **stays mounted**, so its state is preserved. The toggle is independent of the collapse state and supports controlled and uncontrolled use via `checked` / `defaultChecked` / `onCheckedChange`. The toggle's accessible name defaults to the section `title` and can be overridden with `checkLabel`. All additive — sections without `checkable` are unchanged.
