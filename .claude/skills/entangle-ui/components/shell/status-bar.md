# StatusBar

> Application status bar with left/right sections, interactive items, badges, and color variants.

Application status bar for displaying live status information at the bottom of editor interfaces. Supports sectioned layout (left/right), interactive and static items, badge indicators, and color variants for different application states.

**Live Preview**

## Import

```tsx
import { StatusBar } from 'entangle-ui';
```

## Usage

```tsx
<StatusBar>
  <StatusBar.Section side="left">
    <StatusBar.Item icon={<BranchIcon />}>main</StatusBar.Item>
    <StatusBar.Item icon={<SyncIcon />} onClick={handleSync}>
      Synced
    </StatusBar.Item>
  </StatusBar.Section>
  <StatusBar.Section side="right">
    <StatusBar.Item>Ln 42, Col 8</StatusBar.Item>
    <StatusBar.Item onClick={handleLanguage}>TypeScript</StatusBar.Item>
  </StatusBar.Section>
</StatusBar>
```

## Compound Components

| Component           | Purpose                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `StatusBar.Section` | Container for grouping items on the left or right side                                        |
| `StatusBar.Item`    | Individual status item -- renders as a button when `onClick` is provided, otherwise as a span |

## Variants

The `variant` prop changes the status bar's background color to communicate application state.

```tsx
<StatusBar variant="default">
  <StatusBar.Section side="left">
    <StatusBar.Item>Ready</StatusBar.Item>
  </StatusBar.Section>
</StatusBar>

<StatusBar variant="error">
  <StatusBar.Section side="left">
    <StatusBar.Item>Build Failed</StatusBar.Item>
  </StatusBar.Section>
</StatusBar>

<StatusBar variant="accent">
  <StatusBar.Section side="left">
    <StatusBar.Item>Remote Connected</StatusBar.Item>
  </StatusBar.Section>
</StatusBar>
```

| Variant   | Use case                                         |
| --------- | ------------------------------------------------ |
| `default` | Normal application state (default)               |
| `error`   | Error or critical state (e.g., build failure)    |
| `accent`  | Active or special state (e.g., remote debugging) |

## Sizes

```tsx
<StatusBar size="sm">{/* Compact */}</StatusBar>
<StatusBar size="md">{/* Standard */}</StatusBar>
```

| Size | Use case                     |
| ---- | ---------------------------- |
| `sm` | Compact status bar (default) |
| `md` | Standard height              |

## Interactive Items

When an `onClick` handler is provided, `StatusBar.Item` renders as a `<button>` with hover and focus styles. Without `onClick`, it renders as a static `<span>`.

```tsx
<StatusBar>
  <StatusBar.Section side="left">
    {/* Static display */}
    <StatusBar.Item icon={<CheckIcon />}>No Errors</StatusBar.Item>
    {/* Clickable button */}
    <StatusBar.Item onClick={handleWarnings} icon={<WarningIcon />}>
      3 Warnings
    </StatusBar.Item>
  </StatusBar.Section>
</StatusBar>
```

## Badges

Items support badge indicators. Pass a number for a numeric badge, or `true` for a dot indicator.

```tsx
<StatusBar>
  <StatusBar.Section side="left">
    {/* Numeric badge */}
    <StatusBar.Item icon={<BellIcon />} badge={5} onClick={handleNotifications}>
      Notifications
    </StatusBar.Item>
    {/* Dot badge */}
    <StatusBar.Item icon={<UpdateIcon />} badge={true} onClick={handleUpdate}>
      Updates Available
    </StatusBar.Item>
  </StatusBar.Section>
</StatusBar>
```

## Sections

Use `StatusBar.Section` to align items to the left or right side of the status bar. Items within each section are laid out inline.

```tsx
<StatusBar>
  <StatusBar.Section side="left">
    <StatusBar.Item>Left-aligned items</StatusBar.Item>
  </StatusBar.Section>
  <StatusBar.Section side="right">
    <StatusBar.Item>Right-aligned items</StatusBar.Item>
  </StatusBar.Section>
</StatusBar>
```

## Props

### StatusBar

| Prop        | Type                               | Default     | Description                                 |
| ----------- | ---------------------------------- | ----------- | ------------------------------------------- |
| `size`      | `'sm' \| 'md'`                     | `'sm'`      | Size of the status bar.                     |
| `variant`   | `'default' \| 'error' \| 'accent'` | `'default'` | Color variant indicating application state. |
| `children`  | `ReactNode`                        | —           | StatusBar.Section components.               |
| `className` | `string`                           | —           | Additional CSS class names.                 |
| `style`     | `CSSProperties`                    | —           | Inline styles.                              |
| `testId`    | `string`                           | —           | Test identifier for automated testing.      |
| `ref`       | `Ref`                              | —           | Ref to the root element.                    |

### StatusBar.Section

| Prop        | Type                | Default  | Description                                         |
| ----------- | ------------------- | -------- | --------------------------------------------------- |
| `side`      | `'left' \| 'right'` | `'left'` | Which side of the status bar the section aligns to. |
| `children`  | `ReactNode`         | —        | StatusBar.Item components.                          |
| `className` | `string`            | —        | Additional CSS class names.                         |
| `style`     | `CSSProperties`     | —        | Inline styles.                                      |
| `testId`    | `string`            | —        | Test identifier for automated testing.              |
| `ref`       | `Ref`               | —        | Ref to the section element.                         |

### StatusBar.Item

| Prop        | Type                | Default | Description                                                                                                      |
| ----------- | ------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| `children`  | `ReactNode`         | —       | Item label text.                                                                                                 |
| `icon`      | `ReactNode`         | —       | Icon element displayed before the label.                                                                         |
| `onClick`   | `() => void`        | —       | Click handler. When provided, the item renders as a button instead of a span.                                    |
| `title`     | `string`            | —       | Tooltip text shown on hover.                                                                                     |
| `badge`     | `number \| boolean` | —       | Badge indicator. A number shows a count badge. `true` shows a dot badge. `false` or `undefined` hides the badge. |
| `disabled`  | `boolean`           | `false` | Whether the item is disabled (only applies to interactive items).                                                |
| `className` | `string`            | —       | Additional CSS class names.                                                                                      |
| `style`     | `CSSProperties`     | —       | Inline styles.                                                                                                   |
| `testId`    | `string`            | —       | Test identifier for automated testing.                                                                           |
| `ref`       | `Ref`               | —       | Ref to the item element (HTMLButtonElement when clickable, HTMLSpanElement when static).                         |

## Accessibility

- The root element has `role="status"` with `aria-live="polite"`, so screen readers announce content changes without interrupting the user
- Interactive items render as native `<button>` elements with full keyboard support
- Static items render as `<span>` elements
- Use the `title` prop on items to provide additional context via tooltip
