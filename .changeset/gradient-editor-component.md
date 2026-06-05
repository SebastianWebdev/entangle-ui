---
'entangle-ui': minor
---

Add `GradientEditor` — interactive editor for linear, radial, and conic gradients (Stage 1 flagship).

- Structured `GradientData` value (`{ type, angle, stops[] }`) with controlled/uncontrolled support, `onChange` (continuous) + `onChangeComplete` (commit boundary for undo) + `onSelectionChange`.
- Draggable color stops on a live ramp: click the ramp to add, drag a handle off vertically (or `Delete`/`Backspace`) to remove, arrow keys to nudge. Each stop is a `role="slider"` with value text.
- Stops are summarized as a grid of color cards (swatch + value in `swatchFormat` + ramp position + delete button); edit a card's color in a popover (`colorEditor="popover"`, default) or a shared inline `ColorPicker` (`colorEditor="inline"`).
- Linear/radial/conic types via a `SegmentedControl`, angle via an `AngleInput` dial (linear/conic), and a read-only CSS output row with a copy button.
- Pure helpers exported: `formatGradientCSS`, `parseGradientCSS` (parses `linear`/`radial`/`conic` with optional angle or direction keyword, returns `null` on garbage), `normalizeGradient`, `addStopAt`, `createDefaultGradient`, `generateStopId`.
- Ships with docs page, demos, and tests.
