# Entangle UI

React + TypeScript component library for building editor-style interfaces.

`entangle-ui` is focused on dense, keyboard-friendly UI patterns used in tools like 3D editors, node editors, scene inspectors, and technical dashboards.

**[Documentation](https://entangle-ui.dev)** | **[GitHub](https://github.com/SebastianWebdev/entangle-ui)**

## Status

This package is in alpha and still evolving.

- API can change between alpha releases.
- Use in production only if you are comfortable with rapid iteration.

## Installation

```bash
npm install entangle-ui@alpha
```

Peer dependencies:

- `react >= 19.1.0`
- `react-dom >= 19.1.0`
- `@base-ui/react ^1.1.0`
- `@floating-ui/react ^0.27.17`

## Quick Start

```tsx
import 'entangle-ui/darkTheme.css'; // registers --etui-* CSS custom properties on :root

import { AppShell, MenuBar, Toolbar, StatusBar } from 'entangle-ui';

export function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AppShell>
        <AppShell.MenuBar>
          <MenuBar>
            <MenuBar.Menu label="File">
              <MenuBar.Item onClick={() => {}}>New</MenuBar.Item>
            </MenuBar.Menu>
          </MenuBar>
        </AppShell.MenuBar>

        <AppShell.Toolbar>
          <Toolbar aria-label="Main toolbar">
            <Toolbar.Button onClick={() => {}}>Run</Toolbar.Button>
          </Toolbar>
        </AppShell.Toolbar>

        <AppShell.Dock>
          <div style={{ padding: 16 }}>Editor content</div>
        </AppShell.Dock>

        <AppShell.StatusBar>
          <StatusBar>
            <StatusBar.Section>
              <StatusBar.Item>Ready</StatusBar.Item>
            </StatusBar.Section>
          </StatusBar>
        </AppShell.StatusBar>
      </AppShell>
    </div>
  );
}
```

## Theming

Entangle UI uses [Vanilla Extract](https://vanilla-extract.style/) for zero-runtime styling. All theme tokens are exposed as stable CSS custom properties prefixed with `--etui-*`.

### Default dark theme

Import the dark theme CSS to register all `--etui-*` variables on `:root`:

```ts
import 'entangle-ui/darkTheme.css';
```

### Custom themes

Override tokens with plain CSS — no build tools required:

```css
.my-theme {
  --etui-color-accent-primary: #2aa1ff;
  --etui-color-bg-primary: #0d1117;
  --etui-spacing-md: 10px;
}
```

Or use the `createCustomTheme` helper in a `.css.ts` file for type-safe overrides:

```ts
// myTheme.css.ts
import { createCustomTheme } from 'entangle-ui';

createCustomTheme('.my-theme', {
  colors: {
    accent: { primary: '#2aa1ff' },
    background: { primary: '#0d1117' },
  },
});
```

Then wrap your app:

```tsx
import { VanillaThemeProvider } from 'entangle-ui';
import './myTheme.css';

<VanillaThemeProvider className="my-theme">
  <App />
</VanillaThemeProvider>;
```

### Theme contract

Access theme tokens programmatically in `.css.ts` files via the `vars` object:

```ts
import { style } from '@vanilla-extract/css';
import { vars } from 'entangle-ui';

export const card = style({
  background: vars.colors.surface.default,
  padding: vars.spacing.md,
  borderRadius: vars.borderRadius.md,
  color: vars.colors.text.primary,
});
```

## What Is Included

### Primitives

- `Button`, `IconButton`
- `Input`, `Text`, `Paper`, `Icon`
- `Checkbox`, `CheckboxGroup`, `Switch`
- `Tooltip`, `Popover`, `Collapsible`

### Layout

- `Stack`, `Flex`, `Grid`, `Spacer`
- `Accordion`
- `ScrollArea`
- `SplitPane`, `SplitPanePanel`
- `PanelSurface`

### Controls

- `NumberInput`, `Slider`, `Select`, `VectorInput`
- `ColorPicker`, `ColorPalette`, `ColorSwatch`, `EyeDropper`
- `TreeView`
- `CurveEditor` + helpers (`evaluateCurve`, `sampleCurve`, `createLinearCurve`, `domainToCanvas`)
- `CartesianPicker`

### Navigation

- `Menu`, `ContextMenu`, `useMenu`, `useContextMenuTarget`
- `Tabs`, `TabList`, `Tab`, `TabPanel`

### Shell

- `AppShell`, `useAppShell`
- `MenuBar`
- `Toolbar`
- `StatusBar`
- `FloatingPanel`, `FloatingManager`

### Editor

- `PropertyPanel`, `PropertySection`, `PropertyRow`, `PropertyGroup`
- `usePropertyUndo`
- `ViewportGizmo`
- `ChatPanel`, `ChatMessageList`, `ChatMessage`, `ChatBubble`, `ChatInput`
- `ChatTypingIndicator`, `ChatToolCall`, `ChatCodeBlock`
- `ChatAttachmentChip`, `ChatContextChip`, `ChatEmptyState`
- `ChatActionBar`, `ChatInputToolbar`
- `useChatMessages`, `useChatInput`, `useChatScroll`

### Feedback and Form

- `Dialog` primitives (`Dialog`, `DialogHeader`, `DialogBody`, `DialogFooter`, `DialogClose`)
- `ToastProvider`, `useToast`
- `FormLabel`, `FormHelperText`, `InputWrapper`

### Utilities

- `vars` — Theme contract object mapping to `--etui-*` CSS custom properties
- `darkThemeValues` — Default dark theme token values
- `createCustomTheme(selector, overrides)` — Type-safe custom theme helper
- `VanillaThemeProvider` — Scoped theme wrapper component
- `cx(...classes)` — Class name composition utility
- `cn(...classes)` — Conditional class name utility

## Development

```bash
npm install
npm run dev            # Storybook
npm run test           # Vitest
npm run lint
npm run type-check
npm run build
```

## Release Workflow

This repository uses Changesets.

```bash
npm run changeset
npm run version-packages
npm run release
```

## Links

- Documentation: https://entangle-ui.dev
- Source: https://github.com/SebastianWebdev/entangle-ui
- Issues: https://github.com/SebastianWebdev/entangle-ui/issues

## License

MIT
