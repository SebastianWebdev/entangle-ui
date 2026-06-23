---
'entangle-ui': minor
---

`Select`: add `fullWidth` and size the open dropdown to its content.

- **`fullWidth` (new prop).** When set, the select stretches the container and trigger to fill the available width instead of shrinking to the selected label. This fixes selects collapsing when placed inside a flex row or property panel. Default `false` preserves the previous content-width behavior.
- **Content-sized dropdown.** The open dropdown now sizes to its widest option (`width: max-content`), with a minimum of the trigger width (and `minDropdownWidth` when set) and a maximum clamped to the viewport. Long option labels are no longer clipped by a narrow trigger. `minDropdownWidth` continues to act as a floor.
