# Alert

> Persistent inline status banner with semantic variants, three appearances, optional close button, and a compound API for richer layouts.

A persistent inline status banner. Use `Alert` for messages tied to the surrounding UI — a read-only file warning above an inspector, an expired-credentials notice on a settings panel, or an unsaved-changes banner. For transient confirmations like "File saved" or "Export complete", reach for [Toast](/components/feedback/toast) instead.

**Live Preview**

## When to use

- **Alert** — persistent inline status that the user reads while they work. Doesn't auto-dismiss. Sits in the layout.
- **Toast** — transient confirmation that fades after a few seconds. Sits in an overlay corner. Use `useToast`.
- **Dialog** — blocks the rest of the UI and demands a response.

## Import

```tsx
import { Alert } from 'entangle-ui';
```

The compound members come along automatically:

```tsx
<Alert>
  <Alert.Title>...</Alert.Title>
  <Alert.Description>...</Alert.Description>
  <Alert.Actions>...</Alert.Actions>
</Alert>
```

If you'd rather destructure, the same components are also exported as named imports:

```tsx
import { Alert, AlertTitle, AlertDescription, AlertActions } from 'entangle-ui';
```

## Usage

```tsx
<Alert variant="warning" title="Read-only mode">
  Switch to edit mode to make changes.
</Alert>
```

A plain string in `children` is rendered as the description — no title needed for one-liners:

```tsx
<Alert variant="info">Auto-save is on.</Alert>
```

## Variants

The `variant` prop drives the color and the default icon.

**Variants**

| Variant   | Color token             | Default icon  | Role     |
| --------- | ----------------------- | ------------- | -------- |
| `info`    | `colors.accent.primary` | `InfoIcon`    | `status` |
| `success` | `colors.accent.success` | `CheckIcon`   | `status` |
| `warning` | `colors.accent.warning` | `WarningIcon` | `alert`  |
| `error`   | `colors.accent.error`   | `ErrorIcon`   | `alert`  |
| `neutral` | `colors.text.muted`     | _(none)_      | `region` |

```tsx
<Alert variant="info" />
<Alert variant="success" />
<Alert variant="warning" />
<Alert variant="error" />
<Alert variant="neutral" />
```

## Appearances

Three visual treatments. `subtle` is the default — and the right pick most of the time.

**Appearances**

| Appearance | Treatment                                      | When to use                                                |
| ---------- | ---------------------------------------------- | ---------------------------------------------------------- |
| `subtle`   | Tinted background with a faint matching border | Default. Inline status without grabbing attention.         |
| `solid`    | Filled accent background, white text           | High attention. Reserve for blocking errors / strong cues. |
| `outline`  | Transparent background with a colored border   | Quietest treatment. Useful in dense layouts.               |

```tsx
<Alert variant="info" appearance="subtle" />
<Alert variant="info" appearance="solid" />
<Alert variant="info" appearance="outline" />
```

## Without an icon

Pass `icon={false}` to drop the icon column, or pass any `ReactNode` to override the default.

**Without icon**

```tsx
<Alert icon={false} variant="warning" title="Read-only">
  Switch to edit mode.
</Alert>

<Alert icon={<MyCustomIcon />} variant="info">
  Custom icon.
</Alert>
```

## Dismissible

Provide `onClose` to render a close button in the top-right.

**Dismissible**

```tsx
const [open, setOpen] = useState(true);

{
  open && (
    <Alert
      variant="success"
      title="Export complete"
      onClose={() => setOpen(false)}
    >
      The scene was exported successfully.
    </Alert>
  );
}
```

The close button is keyboard-reachable in the default tab order and uses `aria-label="Close alert"`.

## Compact

Title only, or description only — both work. The icon stays unless you opt out.

**Compact**

```tsx
<Alert variant="info">Auto-save is on.</Alert>
```

## With actions

Use `Alert.Actions` to render action buttons below the description.

**With actions**

```tsx
<Alert variant="error" title="Couldn't reach the server">
  <Alert.Description>The request timed out after 30 seconds.</Alert.Description>
  <Alert.Actions align="right">
    <Button variant="filled" onClick={retry}>
      Retry
    </Button>
    <Button onClick={dismiss}>Dismiss</Button>
  </Alert.Actions>
</Alert>
```

The `align` prop controls horizontal placement: `left` (default), `right`, or `space-between`.

## Long content

The body wraps naturally. Stack multiple `Alert.Description` blocks for paragraphs. Long unbroken strings — URLs, file paths, command snippets — are wrapped with `overflow-wrap: anywhere`, so the alert never pushes its container wider than intended.

**Long content**

## Width

`Alert` defaults to `width: 100%` so it stretches to fill its parent and keeps a stable footprint regardless of content length. Override with the `width` prop — a number is treated as pixels, a string passes through as a CSS value.

```tsx
<Alert width={420} variant="info">Fixed-width alert.</Alert>
<Alert width="32rem" variant="info">Sized to the type scale.</Alert>
```

## Editor example

Pin a read-only warning above an inspector panel.

**Editor example**

## Compound API

`Alert` exposes three compound members. They can be used as `Alert.Title` / `Alert.Description` / `Alert.Actions`, or imported as named exports (`AlertTitle`, etc.) — both refer to the same component.

```tsx
<Alert variant="info">
  <Alert.Title>Heads up</Alert.Title>
  <Alert.Description>This is the body of the alert.</Alert.Description>
  <Alert.Actions>
    <Button>Dismiss</Button>
  </Alert.Actions>
</Alert>
```

If both the `title` prop and an `<Alert.Title>` child are supplied, both render — pick one.

## Accessibility

- Role is derived from the variant: `alert` for `error` / `warning` (assertive), `status` for `info` / `success` (polite), `region` with an `aria-label` for `neutral`.
- The component **doesn't auto-focus**. Inline alerts shouldn't grab focus — that's the job of `Dialog` and `Toast`.
- The icon is marked `aria-hidden="true"`; meaning is conveyed by the text and the role.
- The close button (when present) has `aria-label="Close alert"` and follows the default tab order.
- Color contrast meets WCAG AA across all five variants in both `subtle` and `solid` appearances on the dark theme.

## Props

### Alert

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'info' \| 'success' \| 'warning' \| 'error' \| 'neutral'` | `'info'` | Semantic intent. Drives color and the default icon. |
| `appearance` | `'subtle' \| 'solid' \| 'outline'` | `'subtle'` | Visual treatment. |
| `icon` | `ReactNode \| false` | `true` | Icon at the start. `false` hides the icon; any ReactNode overrides the default. |
| `onClose` | `() => void` | — | When provided, renders a close button and calls this on click. |
| `title` | `ReactNode` | — | Convenience prop equivalent to wrapping with `<Alert.Title>`. |
| `width` | `number \| string` | `'100%'` | Width of the alert. Number → px, string → CSS value. Defaults to filling the parent so the alert keeps a stable width regardless of content length; long strings wrap inside. |
| `children` | `ReactNode` | — | Compound children (Title / Description / Actions) or a plain string treated as the description. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the alert root element. |

### Alert.Title

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Title content. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the title element. |

### Alert.Description

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Description body content. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the description element. |

### Alert.Actions

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Action buttons. |
| `align` | `'left' \| 'right' \| 'space-between'` | `'left'` | Horizontal alignment of the action row. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the actions row element. |
