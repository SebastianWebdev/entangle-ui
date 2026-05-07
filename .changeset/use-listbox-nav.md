---
'entangle-ui': minor
---

Add `useListboxNav` hook (`@/hooks/useListboxNav`). Generic keyboard navigation primitive for listbox-like surfaces (Select, MultiSelect, Combobox, CommandPalette). Tracks an `activeIndex`, skips disabled items, and exposes a single `handleKeyDown` covering ArrowUp/ArrowDown/Home/End/Enter/Escape with optional looping. The hook is purely logical — consumers render the list and bind the handler to an input or the listbox container. Resets the active index when the items array changes by reference.
