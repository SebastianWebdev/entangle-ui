# AppShell
> Top-level layout shell for editor applications with slots for menu bar, toolbars, dock area, and status bar.

Top-level layout shell that provides the structural skeleton for editor applications. Uses a compound component pattern with named slots for menu bar, toolbars (top, left, right), a central dock area, and a status bar. Includes a context-based toolbar visibility system and configurable chrome separators.

**Live Preview**

## Import

```tsx
import { AppShell } from 'entangle-ui';
```

## Usage

```tsx
<AppShell viewportLock>
  <AppShell.MenuBar>{/* MenuBar component goes here */}</AppShell.MenuBar>
  <AppShell.Toolbar position="top">{/* Top toolbar */}</AppShell.Toolbar>
  <AppShell.Toolbar position="left">{/* Left side toolbar */}</AppShell.Toolbar>
  <AppShell.Dock>{/* Main content / viewport */}</AppShell.Dock>
  <AppShell.Toolbar position="right">
    {/* Right side toolbar */}
  </AppShell.Toolbar>
  <AppShell.StatusBar>{/* Status bar */}</AppShell.StatusBar>
</AppShell>
```

## Compound Components

AppShell uses a compound component pattern. Each slot renders an appropriate semantic HTML element:

| Slot                 | Element              | Purpose                          |
| -------------------- | -------------------- | -------------------------------- |
| `AppShell.MenuBar`   | `<header>`           | Application menu bar area        |
| `AppShell.Toolbar`   | `<div>` or `<aside>` | Toolbar slots (top, left, right) |
| `AppShell.Dock`      | `<main>`             | Central content / viewport area  |
| `AppShell.StatusBar` | `<footer>`           | Bottom status bar                |

## Top Chrome

The `AppShell.MenuBar` slot paints the menu-bar chrome background
(`--etui-shell-menubar-bg`) by default, and a `MenuBar` placed inside it
stretches to fill the slot. Together they read as one continuous chrome strip
instead of a lighter content-width block — no per-app styling required. The
`MenuBar` triggers inset their hover/active fill from the strip edges so the
chrome reads cleanly.

## Docking Panels

There is no separate "panel dock" slot. Dock panels — a `PropertyPanel`,
inspector, outliner, etc. — into the **side toolbar slots**
(`AppShell.Toolbar position="left"` / `position="right"`). They render `<aside>`
landmarks, size to their content, and pick up the `sideChromeSeparator`. The
central `AppShell.Dock` is the viewport/canvas area; for resizable docks compose
[`SplitPane`](../../layout/split-pane/) inside it.

```tsx
<AppShell.Dock>{/* viewport / canvas */}</AppShell.Dock>
<AppShell.Toolbar position="right">
  <PropertyPanel>{/* docked inspector */}</PropertyPanel>
</AppShell.Toolbar>
```

## Viewport Lock

When `viewportLock` is enabled, the shell locks to the full viewport, preventing page scroll. This is the typical setup for editor applications.

```tsx
<AppShell viewportLock>{/* Full-viewport editor layout */}</AppShell>
```

## Chrome Separators

Control the visual separator between chrome areas (toolbars) and content. Separate options exist for the top chrome (menu + top toolbar) and side chrome (left/right toolbars).

```tsx
<AppShell topChromeSeparator="shadow" sideChromeSeparator="none">
  <AppShell.Toolbar position="top">{/* ... */}</AppShell.Toolbar>
  <AppShell.Dock>{/* ... */}</AppShell.Dock>
</AppShell>
```

| Value    | Effect                     |
| -------- | -------------------------- |
| `none`   | No visual separator        |
| `border` | Thin border line (default) |
| `shadow` | Drop shadow                |
| `both`   | Border and shadow combined |

## Toolbar Positions

The `AppShell.Toolbar` slot accepts a `position` prop that determines where the toolbar is placed in the layout.

```tsx
<AppShell>
  <AppShell.Toolbar position="top">
    {/* Horizontal toolbar below the menu bar */}
  </AppShell.Toolbar>
  <AppShell.Toolbar position="left">
    {/* Vertical toolbar on the left */}
  </AppShell.Toolbar>
  <AppShell.Dock>{/* ... */}</AppShell.Dock>
  <AppShell.Toolbar position="right">
    {/* Vertical toolbar on the right */}
  </AppShell.Toolbar>
</AppShell>
```

## Toolbar Visibility

AppShell provides a context-based system for toggling toolbar visibility. Use the `useAppShell` hook to programmatically show or hide toolbars.

```tsx
import { useAppShell } from 'entangle-ui';

function ToggleToolbarButton() {
  const { isToolbarVisible, setToolbarVisible } = useAppShell();

  return (
    <button
      onClick={() => setToolbarVisible('left', !isToolbarVisible('left'))}
    >
      Toggle Left Panel
    </button>
  );
}
```

## Props

### AppShell

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `viewportLock` | `boolean` | `false` | Lock the shell to the viewport, preventing page scroll. Injects global html/body styles. |
| `topChromeSeparator` | `'none' \| 'border' \| 'shadow' \| 'both'` | `'border'` | Visual separator under the top chrome area (menu + top toolbar). |
| `sideChromeSeparator` | `'none' \| 'border' \| 'shadow' \| 'both'` | `'border'` | Visual separator between side toolbars and dock content. |
| `children` | `ReactNode` | — | Slot components (AppShell.MenuBar, AppShell.Toolbar, AppShell.Dock, AppShell.StatusBar). |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the root element. |

### AppShell.MenuBar

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Menu bar content. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the header element. |

### AppShell.Toolbar

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `'top' \| 'left' \| 'right'` | `'top'` | Toolbar placement in the layout. Side positions render as <aside> elements. |
| `children` | `ReactNode` | — | Toolbar content. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the toolbar element. |

### AppShell.Dock

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Main content area. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the main element. |

### AppShell.StatusBar

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Status bar content. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the footer element. |

## Styling

AppShell defines no component-level CSS custom properties of its own; it is
re-skinned through the shared `--etui-*` theme tokens below.

### Theme tokens consumed

| Token                                                                                               | Used for                        |
| --------------------------------------------------------------------------------------------------- | ------------------------------- |
| `--etui-color-bg-primary`                                                                           | Shell background                |
| `--etui-color-text-primary`                                                                         | Shell text color                |
| `--etui-font-family-sans`                                                                           | Shell font family               |
| `--etui-shell-menubar-bg`                                                                           | Menu-bar slot chrome background |
| `--etui-color-border-default`                                                                       | Chrome separator borders        |
| `--etui-shadow-separator-bottom` / `--etui-shadow-separator-right` / `--etui-shadow-separator-left` | Chrome separator shadows        |
| `--etui-z-base`                                                                                     | Toolbar slot stacking order     |

## Accessibility

- The root element has `role="application"`, signaling to assistive technologies that this is an interactive application region
- `AppShell.MenuBar` renders a semantic `<header>` element
- `AppShell.Dock` renders a semantic `<main>` element
- `AppShell.StatusBar` renders a semantic `<footer>` element
- Side toolbars render as `<aside>` elements for landmark navigation
