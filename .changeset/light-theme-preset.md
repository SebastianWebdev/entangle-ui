---
'entangle-ui': minor
---

Add a maintained light theme preset. Ships `lightThemeValues` and a
`createLightTheme()` helper that generates a build-time CSS class via
Vanilla Extract. Unlike the dark theme, the light preset is not applied
on `:root` — consumers opt in by wrapping a subtree with
`VanillaThemeProvider` and the generated class, so the same theming
machinery powers both whole-app light mode and scoped light surfaces
inside a dark app (and vice versa). Structural tokens (spacing,
typography, border-radius, transitions, z-index) are identical between
themes so layout and rhythm don't drift when users switch modes.
Storybook gains a global theme toggle for inspecting any story under
either theme.
