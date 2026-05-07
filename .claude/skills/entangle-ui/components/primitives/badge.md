# Badge

> Inline status indicator and tag primitive with subtle, solid, outline, and dot variants.

A small inline indicator for status, counts, or tags. Designed for editor density: short label, semibold weight, optional uppercase. Supports semantic color tokens or arbitrary CSS color strings, an optional leading icon, and a removable variant for chip-like usage.

**Live Preview**

## Import

```tsx
import { Badge } from 'entangle-ui';
```

## Usage

```tsx
<Badge color="success">Saved</Badge>
<Badge variant="outline" color="warning">Draft</Badge>
<Badge variant="dot" color="error">Offline</Badge>
```

## Variants

The `variant` prop controls the visual treatment.

### Subtle

Tinted translucent fill with colored text — the default. Reads as a label without competing with surrounding UI.

**subtle**

```tsx
<Badge variant="subtle" color="success">
  Success
</Badge>
```

### Solid

Saturated fill with contrasting text. Use sparingly for high-visibility status.

**solid**

```tsx
<Badge variant="solid" color="primary">
  Primary
</Badge>
```

### Outline

Transparent background with a colored border. Good for secondary chips that share row space with subtle badges.

**outline**

```tsx
<Badge variant="outline" color="warning">
  Warning
</Badge>
```

### Dot

A small filled circle followed by the label. Use for online/offline or health indicators.

**dot**

```tsx
<Badge variant="dot" color="success">
  Online
</Badge>
```

## Sizes

| Size | Height | Use case                        |
| ---- | ------ | ------------------------------- |
| `xs` | 14px   | Inline counters in dense rows   |
| `sm` | 16px   | Default — paired with body text |
| `md` | 20px   | Standalone status pills         |
| `lg` | 24px   | Prominent labels in toolbars    |

**Sizes**

```tsx
<Badge size="xs">3</Badge>
<Badge size="sm">Default</Badge>
<Badge size="md">Status</Badge>
<Badge size="lg">Pill</Badge>
```

## Colors

Named colors map to theme accent tokens. Any other string is treated as a raw CSS color (hex, `rgb()`, `hsl()`, …).

| Name      | Maps to                 |
| --------- | ----------------------- |
| `neutral` | `colors.text.muted`     |
| `primary` | `colors.accent.primary` |
| `info`    | `colors.accent.primary` |
| `success` | `colors.accent.success` |
| `warning` | `colors.accent.warning` |
| `error`   | `colors.accent.error`   |

### Custom CSS colors

Pass any CSS color string — hex, `rgb()`, `hsl()`, CSS variables — and the badge picks it up via a per-instance runtime variable.

**Custom colors**

```tsx
<Badge color="#ff6600">orange hex</Badge>
<Badge color="#9b59b6" variant="solid">purple solid</Badge>
<Badge color="rgb(0, 180, 200)" variant="outline">teal rgb</Badge>
```

## Uppercase

Auto-applies `text-transform: uppercase` and a subtle letter-spacing — matches the editor-UI tag convention.

**Uppercase**

```tsx
<Badge uppercase color="warning">
  draft
</Badge>
```

## With Icon

The `icon` slot renders before the label. Pass any ReactNode — SVGs or Entangle's `Icon` wrappers are the common choice.

**With icon**

```tsx
<Badge color="success" icon={<CheckIcon />}>Saved</Badge>
<Badge color="warning" icon={<StarIcon />}>Featured</Badge>
<Badge variant="solid" color="primary" icon={<StarIcon />}>Pro</Badge>
```

## Removable

The `removable` prop renders a built-in close button. The badge body click is **not** treated as a remove action — use the dedicated button.

**Removable** — Click the × on any tag to remove it.

```tsx
const [tags, setTags] = useState([...]);

{tags.map(tag => (
  <Badge
    key={tag}
    color="primary"
    removable
    onRemove={() => setTags(prev => prev.filter(t => t !== tag))}
  >
    {tag}
  </Badge>
))}
```

The remove button gets `aria-label="Remove"` automatically. Clicks on the remove button stop propagation so your own click handler on the badge body remains separate.

## In a List Row

Pair with `ListItem` (or a plain row) for status-tagged lists.

**In a list row**

```tsx
<ListItem trailing={<Badge color="success">done</Badge>}>
  Bake meshes
</ListItem>
<ListItem trailing={<Badge color="warning">running</Badge>}>
  Normalize UVs
</ListItem>
```

## Props

| Prop        | Type                                                                              | Default     | Description                                                           |
| ----------- | --------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------- |
| `children`  | `ReactNode`                                                                       | —           | Label content.                                                        |
| `variant`   | `'subtle' \| 'solid' \| 'outline' \| 'dot'`                                       | `'subtle'`  | Visual style.                                                         |
| `size`      | `'xs' \| 'sm' \| 'md' \| 'lg'`                                                    | `'sm'`      | Size scale.                                                           |
| `color`     | `'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'error' \| string` | `'neutral'` | Semantic color name (mapped to theme accent) or any CSS color string. |
| `uppercase` | `boolean`                                                                         | `false`     | Auto-uppercase the label and apply a small letter-spacing.            |
| `icon`      | `ReactNode`                                                                       | —           | Icon rendered before the label.                                       |
| `removable` | `boolean`                                                                         | `false`     | Render a remove (×) button after the label.                           |
| `onRemove`  | `(event: MouseEvent) => void`                                                     | —           | Called when the remove button is clicked.                             |
| `className` | `string`                                                                          | —           | Additional CSS class names.                                           |
| `style`     | `CSSProperties`                                                                   | —           | Inline styles.                                                        |
| `testId`    | `string`                                                                          | —           | Test identifier for automated testing.                                |
| `ref`       | `Ref`                                                                             | —           | Ref to the underlying span element.                                   |

The component also accepts all standard HTML `<span>` attributes.

## Accessibility

- Renders a semantic `<span>` (inline)
- The remove button has `aria-label="Remove"` and stops click-propagation so the badge body click handler stays separate
- Decorative icons are marked `aria-hidden`; provide your own `aria-label` if the badge is the only label for an action
