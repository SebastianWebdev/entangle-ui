---
editUrl: false
next: false
prev: false
title: "VanillaThemeProvider"
---

> `const` **VanillaThemeProvider**: `React.FC`\<[`VanillaThemeProviderProps`](/api/interfaces/vanillathemeproviderprops/)\>

Defined in: [src/theme/VanillaThemeProvider.tsx:32](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/theme/VanillaThemeProvider.tsx#L32)

Optional wrapper for scoped theme overrides.

The dark theme is applied globally on :root — most apps don't need
VanillaThemeProvider at all. Use it only when you need a different theme
for a subtree (e.g. a light-themed dialog inside a dark app).

## Example

```tsx
// No provider needed for default dark theme:
<App />

// Scoped override for a subtree:
<VanillaThemeProvider className="my-light-section">
  <SettingsPanel />
</VanillaThemeProvider>
```
