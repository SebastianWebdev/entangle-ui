---
'entangle-ui': patch
---

Honor `prefers-reduced-motion: reduce` across every existing component that
animates anything. Loading spinners (Button, IconButton), Dialog overlay
and panel fade-in/out, Toast slide-in and auto-dismiss progress bar,
Select dropdown scale-in, Popover entry, Tooltip popup transition, Switch
thumb travel, Checkbox check-mark draw, expand/collapse chevrons (Accordion,
Collapsible, Select, TreeView, PropertySection, ChatPanel tool-call),
Accordion and Collapsible content height transitions, Avatar / Slider /
ColorPicker hover scale effects, and every `transition: all` block on
interactive primitives now collapse to a static state under reduced
motion. Direct-manipulation interactions (drag, scrub, gizmo rotation,
focus rings, hover color changes) are preserved. A new
[Accessibility](https://entangle-ui.dev/guides/accessibility) guide page
documents the library's reduced-motion stance and shows how to follow the
same pattern in consumer code.
