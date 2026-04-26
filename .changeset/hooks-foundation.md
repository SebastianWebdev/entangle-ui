---
'entangle-ui': minor
---

Establish the public hooks library and ship the first reference hook, `useControlledState`. The hook codifies the controlled / uncontrolled state pattern that every input-like component in the library reimplements: it accepts an optional `value`, `defaultValue`, `onChange`, and a required `fallback`, and returns a `[value, setValue]` tuple just like `useState`. Switching between controlled and uncontrolled modes during a component's lifetime emits a development-only warning that mirrors React's own `<input value/defaultValue>` warning.

Also adds a small `devWarn` / `devError` helper used internally by the library to gate developer-facing warnings to development builds. Several internal warnings that previously logged in production (Skeleton circle aspect, SegmentedControl a11y warning, NumberInput parse errors, useKeyboard fallback) are now silent in production.

The hooks documentation site gets a new top-level "Hooks" section with a landing page and a dedicated page for `useControlledState`.
