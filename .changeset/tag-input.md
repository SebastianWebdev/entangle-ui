---
'entangle-ui': minor
---

Add `TagInput` component (`@/components/controls/TagInput`). Multi-value text input that captures a list of strings as removable chips. Controlled and uncontrolled modes via `value`/`defaultValue`/`onChange`, configurable commit keys (`Enter`, `Comma`, `Space`, `Tab`), optional `addOnBlur`, duplicate handling, `max` cap, custom `validate`/`normalize` callbacks with reason reporting through `onValidate`, custom chip rendering via `renderTag`, `Backspace` removes the trailing tag when the draft is empty, paste with separators is split into multiple tags, three sizes, three variants, and full label/helper/error wiring.
