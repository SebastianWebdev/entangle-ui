---
'entangle-ui': minor
---

Add `AngleInput` — a circular dial for choosing an angle, with an optional compact numeric input.

- Dial follows the CSS gradient convention (0° up, clockwise) so the value maps straight onto `linear-gradient(<angle>, …)`. Drag (hold `Shift` to snap), arrow keys / `PageUp`/`PageDown` / `Home`/`End`, or type into the numeric input.
- `value` in degrees with controlled/uncontrolled support; `onChange` (continuous) + `onChangeComplete` (drag end / input blur / dial blur, for undo).
- Numeric input is on by default and positionable on any side via `inputPlacement` (`top`/`right`/`bottom`/`left`) or hidden with `showInput={false}`.
- `size` (`sm`/`md`/`lg`) or explicit `diameter`; configurable `step`/`largeStep`/`snap`/`min`/`max` (a full-turn range wraps, others clamp); re-skinnable via `--etui-angle-input-*` custom properties; i18n via `labels` (`DEFAULT_ANGLE_INPUT_LABELS`).
- The dial is a `role="slider"` with full ARIA value semantics and keyboard support.
- `GradientEditor` now uses `AngleInput` for its angle control (linear/conic), replacing the narrow number field; `onChangeComplete` now also fires on drag-end of the angle.
- Ships with a docs page, demos, and tests.
