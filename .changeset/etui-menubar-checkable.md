---
'entangle-ui': minor
---

**E2 — MenuBar checkable / radio items.** Add `MenuBar.CheckboxItem`
(`checked` / `defaultChecked` / `onCheckedChange`) and `MenuBar.RadioGroup` +
`MenuBar.RadioItem` (`value` / `defaultValue` / `onValueChange`), mirroring the
navigation `Menu` API. Items reserve a leading check-mark gutter so checked and
unchecked rows align, use `role="menuitemcheckbox"` / `role="menuitemradio"` with
`aria-checked`, participate in arrow-key navigation, and keep the menu open on
activation by default (`closeOnClick={false}`). Additive.
