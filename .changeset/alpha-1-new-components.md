---
'entangle-ui': minor
---

### New Components

- **Checkbox & CheckboxGroup** — Controlled/uncontrolled boolean input with indeterminate state, label positioning, sizes (sm/md/lg), variants (default/filled), and array value management via CheckboxGroup
- **Switch** — Toggle control with controlled/uncontrolled modes, label positioning, sizes, error state, and animated track/thumb
- **Select** — Dropdown single-value selection with search/filter, grouped options, keyboard navigation, clearable option, portal-based dropdown, sizes and variants (default/ghost/filled)
- **Tabs** — Compound component (Tabs, TabList, Tab, TabPanel) with variants (underline/pills/enclosed), vertical orientation, closable tabs, fullWidth mode, and keepMounted option
- **Accordion** — Compound component (Accordion, AccordionItem, AccordionTrigger, AccordionContent) with single/multiple expansion, collapsible option, variants, CSS grid animation
- **Popover** — Floating content container with focus trap, click outside/Escape handling, 12 placements, matchTriggerWidth, portal rendering, and scale+opacity animation
- **ScrollArea** — Custom scrollbar styling with keyboard scrolling support
- **SplitPane** — Draggable panel divider with configurable min/max sizes and collapse/expand
- **TreeView** — Hierarchical tree with keyboard navigation, selection management, and useTreeState hook
- **VectorInput** — Multi-value input (x/y/z/w) with linked/unlinked mode and per-component NumberInput editing
- **ColorPicker** — Full-featured color input with ColorArea, HueSlider, AlphaSlider, ColorInputs (Hex/RGB/HSL), ColorPalette, ColorPresets (700+ colors), ColorSwatch, and EyeDropper
- **Dialog** — Modal overlay with DialogHeader, DialogBody, DialogFooter, DialogClose, focus trap, and animations
- **Toast** — Notification system with ToastProvider, ToastContainer, ToastItem, useToast hook, auto-dismiss, progress bar, and severity variants
- **Collapsible** — Headless collapsible primitive for expandable content

### Refactoring & Improvements

- Translated all Polish comments and JSDoc to English across the entire codebase
- Added `forwardRef` and `displayName` to all primitive and layout components
- Added `React.memo` to stateless presentational components (Icon, Paper, Text, Spacer, FormLabel, FormHelperText, InputWrapper)
- Split monolithic Menu.tsx (693 lines) into modular files (types, hook, helpers, styled, component)
- Migrated Stack, Flex, Grid, Spacer to BaseComponent pattern with `css` prop support
- Hardened `mathExpression.ts` with blocked identifiers whitelist and 20 adversarial security tests
- Added comprehensive keyboard navigation tests for Button, Input, NumberInput, Slider, and Menu

### CI/CD

- Added GitHub Actions CI workflow (lint, build, type-check, test on PRs and main)
- Added GitHub Actions release workflow with Changesets and npm OIDC Trusted Publishing
- Configured Changesets for automated version management and changelog generation
