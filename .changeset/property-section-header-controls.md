---
'entangle-ui': patch
---

`PropertySection`: render header controls as siblings of the collapse trigger instead of nested inside it.

The enable toggle (`checkable`) and the `actions` slot were rendered inside the section header's trigger `<button>`, which produced invalid HTML (`<button>` cannot contain another `<button>`/interactive control) and a React DOM warning. The header is now a flex strip containing the trigger button and a separate controls group as siblings, so toggles and actions are never nested in a button. The collapse behavior, sizing, and the expanded separator are unchanged; the trigger's hover highlight now covers the trigger area rather than the full strip width.
