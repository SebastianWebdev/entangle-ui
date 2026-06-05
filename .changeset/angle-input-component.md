---
'entangle-ui': minor
---

Add `AngleInput` — a circular dial for choosing an angle, with an optional compact numeric input or read-only value readout.

- Dial follows the CSS gradient convention (0° up, clockwise) so the value maps straight onto `linear-gradient(<angle>, …)`. The rim handle rides on the dial border. Drag, arrow keys / `PageUp`/`PageDown` / `Home`/`End`, or type into the numeric input.
- `value` in degrees with controlled/uncontrolled support; `onChange` (continuous) + `onChangeComplete` (drag end / input blur / dial blur, for undo).
- Companion next to the dial is the editable input by default; with `showInput={false}` add `showValue` for a read-only readout. Position either on any side via `placement` (`top`/`right`/`bottom`/`left`).
- `discrete` mode snaps every interaction to `snap` increments (stepped dial); otherwise `Shift`-drag snaps. Holding `Shift` during a discrete drag restores fine control.
- `size` (`sm`/`md`/`lg`) or explicit `diameter`; `step`/`largeStep`/`snap`/`min`/`max` (a full-turn range wraps, others clamp); re-skinnable via `--etui-angle-input-*` custom properties; i18n via `labels` (`DEFAULT_ANGLE_INPUT_LABELS`). The dial is a `role="slider"` with full ARIA value semantics.
- `GradientEditor` now uses `AngleInput` for its angle control (linear/conic), replacing the narrow number field; `onChangeComplete` now also fires on angle drag-end.
- Fix `NumberInput`: the field now shrinks to its container (`min-width: 0`) instead of overflowing on edit in narrow wrappers (AngleInput, VectorInput axes).
- Ships with a docs page, demos, nav entry, skill reference, and tests.
