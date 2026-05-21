# Kbd

> Keyboard shortcut keycaps with platform-aware glyph rendering.

Kbd renders keyboard shortcuts as semantic `<kbd>` keycaps. Use it anywhere a shortcut hint appears: menu rows, tooltip footers, command palettes, help overlays, and keyboard reference panels. `Cmd` is intentionally reinterpreted as `Ctrl` outside macOS so consumers can describe the logical modifier once and get the expected platform display.

**Live Preview**

## Import

```tsx
import { Kbd } from 'entangle-ui';
```

## Usage

```tsx
<Kbd>Ctrl+S</Kbd>
<Kbd platform="mac" separator={null}>Cmd+S</Kbd>
<Kbd glyphs={false}>Ctrl+S</Kbd>
```

## Literal vs Glyphs

Use literal rendering when the shortcut text should stay exactly as written. Use glyph rendering for OS-aware shortcut hints.

**Literal**

```tsx
<Kbd glyphs={false} platform="windows">
  Ctrl+S
</Kbd>
```

**macOS glyphs**

```tsx
<Kbd platform="mac" separator={null}>
  Cmd+S
</Kbd>
```

## Sizes

**Sizes**

| Size | Height | Padding | Font           | Min-width |
| ---- | ------ | ------- | -------------- | --------- |
| `sm` | 16px   | 0 4px   | xxs (9px) mono | 16px      |
| `md` | 20px   | 0 6px   | xs (10px) mono | 20px      |
| `lg` | 24px   | 0 8px   | sm (11px) mono | 24px      |

```tsx
<Kbd size="sm">Ctrl+S</Kbd>
<Kbd size="md">Ctrl+S</Kbd>
<Kbd size="lg">Ctrl+S</Kbd>
```

## Variants

**Variants**

```tsx
<Kbd variant="solid">Ctrl+S</Kbd>
<Kbd variant="outline">Ctrl+S</Kbd>
<Kbd variant="ghost">Ctrl+S</Kbd>
```

## Multiple Keys

Strings are split on `+`, and arrays render as separate keycaps.

**Common shortcuts**

**Multiple keys**

```tsx
<Kbd>Ctrl+Shift+P</Kbd>
<Kbd>{['Ctrl', 'Shift', 'P']}</Kbd>
```

Strings are split on the literal `+` character, so the `+` key cannot be expressed in string form. Use the `Plus` keyword (which renders as `+` after glyph mapping) or pass an array of keys instead:

```tsx
<Kbd>Ctrl+Plus</Kbd>
<Kbd>{['Ctrl', '+']}</Kbd>
```

## Custom Separator

Use `separator` to change the text between keycaps, or pass `null` to render adjacent keycaps.

**Custom separator**

```tsx
<Kbd separator="→" glyphs={false}>
  Ctrl+S
</Kbd>
```

**No separator**

```tsx
<Kbd platform="mac" separator={null}>
  Cmd+S
</Kbd>
```

## In Tooltip

**In tooltip**

```tsx
<Tooltip
  title={
    <span>
      Save{' '}
      <Kbd size="sm" variant="ghost" glyphs={false}>
        Ctrl+S
      </Kbd>
    </span>
  }
>
  <Button>Save</Button>
</Tooltip>
```

## In Menu Item

**In menu item**

```tsx
<div className="menu-item">
  <span>Save</span>
  <Kbd size="sm" variant="ghost" glyphs={false}>
    Ctrl+S
  </Kbd>
</div>
```

## Keyboard Reference

**Editor shortcuts**

## Glyph Mapping

| Logical   | macOS glyph | Other (literal)                     |
| --------- | ----------- | ----------------------------------- |
| Cmd       | ⌘           | Ctrl ← Cmd reinterpreted on non-mac |
| Meta      | ⌘           | Win / Super                         |
| Ctrl      | ⌃           | Ctrl                                |
| Alt       | ⌥           | Alt                                 |
| Option    | ⌥           | Alt                                 |
| Shift     | ⇧           | Shift                               |
| Enter     | ↩           | Enter                               |
| Return    | ↩           | Enter                               |
| Tab       | ⇥           | Tab                                 |
| Esc       | ⎋           | Esc                                 |
| Escape    | ⎋           | Esc                                 |
| Space     | ␣           | Space                               |
| Backspace | ⌫           | Backspace                           |
| Delete    | ⌦           | Delete                              |
| Up        | ↑           | ↑                                   |
| Down      | ↓           | ↓                                   |
| Left      | ←           | ←                                   |
| Right     | →           | →                                   |

## Accessibility

- Each key renders as a native `<kbd>` element.
- The wrapper is a plain `<span>` and does not create an interactive target.
- The separator between keys is marked `aria-hidden` so screen readers announce the keys directly.
- Kbd is decorative; the actual keyboard binding, command name, and activation behavior live elsewhere.
- Do not add `tabIndex` or button behavior to Kbd.

## SSR and Platform Detection

With the default `platform="auto"`, Kbd renders Windows-style keys on the server and switches to the detected platform after the client mounts. This avoids hydration mismatches but means macOS users will briefly see `Ctrl+S` before it resolves to `⌘S`. To suppress the flash, set `platform` explicitly when you can derive it server-side (for example from the request `User-Agent` or a stored user preference).

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` *(required)* | `ReactNode` | — | Shortcut content. Strings split on "+", arrays render as separate keycaps, and other nodes render as one keycap. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Keycap size. |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'outline'` | Visual variant. |
| `glyphs` | `boolean` | `true` | Render OS-specific glyphs when possible. |
| `platform` | `'auto' \| 'mac' \| 'windows' \| 'linux'` | `'auto'` | Platform detection override. |
| `separator` | `ReactNode` | `'+'` | Separator rendered between multiple keycaps. Use null for adjacent keycaps. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the wrapper span. |

## Utility Helpers

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `getPlatform` | `() => Platform` | — | Detects the current platform from navigator and falls back to 'windows' during SSR. |
| `getKeyGlyph` | `(key: string, platform: Platform) => string` | — | Maps a logical key name to its display representation. |
| `parseShortcut` | `(shortcut: string) => string[]` | — | Splits shortcut strings on "+", trimming whitespace. |

## Migration Note

`MenuBar.Item` still accepts a `shortcut` string in v0.8. That prop will eventually be replaced with a `<Kbd>` child component so menu shortcuts share the same rendering path as tooltips, command palettes, and keyboard reference dialogs.
