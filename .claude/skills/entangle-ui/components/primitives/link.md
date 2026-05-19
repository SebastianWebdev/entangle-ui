# Link

> Styled anchor primitive with variants, external-link affordances, and polymorphic router integration.

A styled `<a>` primitive that standardises theme color, hover and focus states, underline behavior, and external-link affordances. Polymorphic via `as` so it can wrap any router's link component.

`Link` is **styling-only**, not router-aware. Use the `as` prop to pass `react-router`'s `Link`, TanStack Router's `Link`, or Next.js's `Link` for client-side navigation. Out of the box, it renders a plain anchor.

**Live Preview**

## Import

```tsx
import { Link } from 'entangle-ui';
```

## Usage

```tsx
<Link href="/docs">Documentation</Link>
<Link href="https://example.com">Auto-detected external</Link>
<Link as={RouterLink} to="/profile">Profile</Link>
```

## Variants

**Variants**

| Variant   | Color                           | Use case                                |
| --------- | ------------------------------- | --------------------------------------- |
| `default` | Accent primary                  | Standalone calls-to-action              |
| `subtle`  | Secondary text, accent on hover | Status bars, footers, secondary actions |
| `inline`  | Inherits — always underlined    | Links inside prose                      |

```tsx
<Link href="/foo" variant="default">Default</Link>
<Link href="/foo" variant="subtle">Subtle</Link>
<Link href="/foo" variant="inline">Inline</Link>
```

## Underline

**Underline**

```tsx
<Link href="/foo" underline="always">Always</Link>
<Link href="/foo" underline="hover">Hover (default)</Link>
<Link href="/foo" underline="never">Never</Link>
```

`variant="inline"` forces `underline="always"` since color is no longer doing the work of distinguishing the link.

## Sizes

**Sizes**

| Size | Font size                | Use case             |
| ---- | ------------------------ | -------------------- |
| `sm` | `typography.fontSize.xs` | Toolbars, status bar |
| `md` | `typography.fontSize.sm` | Default              |
| `lg` | `typography.fontSize.md` | Prominent CTA links  |

## External links

External links are auto-detected when `href` starts with `http://` or `https://`. Detection adds an external-link icon, sets `target="_blank"` and `rel="noopener noreferrer"`, and announces "(opens in new tab)" to assistive tech.

Pass `external={false}` to force same-tab navigation on an absolute URL, or `external` to force external behavior on a relative one.

**External**

```tsx
<Link href="https://example.com">Auto-detected</Link>
<Link href="/internal" external>Forced external</Link>
<Link href="https://example.com" external={false}>Same-tab override</Link>
```

## Disabled

`disabled` renders as a `<span>` regardless of `as`, strips navigation handlers (`href`, `to`, `onClick`, key/pointer events), sets `aria-disabled`, and turns off pointer events. This means a disabled router link cannot navigate via mouse, keyboard, or programmatic activation — `aria-disabled` plus CSS alone wouldn't be enough to block router-driven triggers, so the wrapper enforces it at render time.

When `disabled` is true, the external-link icon and "(opens in new tab)" announcement are also suppressed, since there is no real external navigation to advertise.

**Disabled**

```tsx
<Link href="/foo" disabled>
  Disabled
</Link>
```

## Router integration (`as`)

Pass any router library's link component via `as` to get client-side navigation while keeping all of `Link`'s styling.

**Polymorphic `as`**

```tsx
// react-router v6+
import { Link as RouterLink } from 'react-router-dom';

<Link as={RouterLink} to="/profile">
  Profile
</Link>;
```

```tsx
// TanStack Router
import { Link as RouterLink } from '@tanstack/react-router';

<Link as={RouterLink} to="/profile">
  Profile
</Link>;
```

```tsx
// Next.js (App Router)
import NextLink from 'next/link';

<Link as={NextLink} href="/profile">
  Profile
</Link>;
```

`as` is the only place in the library where polymorphic rendering is supported. The pattern is too useful for `Link` to skip — but it's deliberately not adopted across other components.

## In prose

Use `variant="inline"` for links inside running text. They inherit color from the surrounding paragraph and stay underlined so they remain identifiable.

**Inline in prose**

```tsx
<Text>
  Read the{' '}
  <Link href="/guide" variant="inline">
    getting-started guide
  </Link>{' '}
  first.
</Text>
```

## Editor example

A status bar showing two `subtle` `sm` links — typical use inside an editor footer.

**Status bar**

## When to use

- **`Link`** — any visible navigation in your UI, internal or external
- **`<Button variant="ghost">`** — actions that don't navigate (form submit, modal trigger). Don't reach for a styled link to fire a JavaScript handler that has no URL behind it

## Accessibility

- External links automatically get a screen-reader-only "(opens in new tab)" announcement, either appended to your existing `aria-label` or rendered as a hidden span next to the icon
- The external-link icon itself is `aria-hidden` so it isn't announced twice
- `disabled` renders as a `<span>` with `aria-disabled="true"` so screen readers announce the state and browsers don't follow the link
- Focus-visible applies the theme focus ring (`shadows.focus`) so keyboard users can see where they are

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` *(required)* | `ReactNode` | — | Link content. |
| `href` | `string` | — | Destination URL. Omitted when `disabled` is true. |
| `as` | `ElementType` | `'a' (always 'span' when disabled)` | Polymorphic root override — pass a router's link component to get client-side navigation. When the resolved element is generic (e.g. a router link), its props (`to`, `replace`, …) are type-checked. Ignored when `disabled` is true. |
| `variant` | `'default' \| 'subtle' \| 'inline'` | `'default'` | Visual style. |
| `color` | `'primary' \| 'secondary' \| 'inherit' \| string` | — | Color override. Defaults follow the variant. Any CSS color string is accepted. |
| `underline` | `'always' \| 'hover' \| 'never'` | `'hover'` | Underline behavior. Forced to `always` for `variant="inline"`. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Font size. |
| `external` | `boolean` | — | Render as external link. Auto-detected from `href` when it starts with `http://` or `https://`. Explicit prop overrides detection. |
| `disabled` | `boolean` | `false` | Disable the link. Renders as a `<span>` with no `href`, `aria-disabled`, and `pointer-events: none`. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles applied to the rendered element. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the rendered anchor. |
