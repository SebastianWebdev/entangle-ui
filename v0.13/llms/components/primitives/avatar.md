# Avatar
> Identity primitive with image, initials, and icon fallback chain. AvatarGroup handles overlapping clusters with overflow.

Render a person, agent, or any named entity. `Avatar` resolves an image when one is available, falls back to initials derived from the name, and finally to a generic user glyph. `AvatarGroup` overlaps multiple avatars and collapses overflow into a `+N` indicator.

Reach for `Avatar` to represent identities — collaborators, comment authors, agent attributions. For decorative imagery (thumbnails, hero photos) use a plain `<img>`; an avatar isn't the right semantic.

**Live Preview**

## Import

```tsx
import { Avatar, AvatarGroup } from 'entangle-ui';
```

## Usage

```tsx
<Avatar src="/users/alice.png" name="Alice Wong" />
<Avatar name="Sebastian Kowalski" status="online" />
<Avatar name="Bot" color="primary" shape="rounded" />
```

When `src` is provided the avatar attempts to load it; the underlying initials remain in place as a backdrop until the image paints (or fails). If it fails, the initials become the visible content.

## Sizes

Six fixed sizes from `xs` (toolbar / chip) through `xxl` (profile header).

**Sizes**

| Size  | Diameter | Use case                       |
| ----- | -------- | ------------------------------ |
| `xs`  | 16px     | Inline next to dense rows      |
| `sm`  | 20px     | Compact lists / chat bubbles   |
| `md`  | 24px     | Default                        |
| `lg`  | 32px     | Side panels, comments          |
| `xl`  | 40px     | Cards, member rows             |
| `xxl` | 56px     | Profile pages / detail headers |

```tsx
<Avatar size="xs" name="Alice" />
<Avatar size="xxl" name="Alice" />
```

## Shapes

**Shapes**

| Shape     | Border radius     | When to use                         |
| --------- | ----------------- | ----------------------------------- |
| `circle`  | `50%`             | Default — people / personal context |
| `square`  | `0`               | Logos, machine identifiers          |
| `rounded` | `borderRadius.md` | Soft fallback between the two       |

```tsx
<Avatar shape="circle" />
<Avatar shape="square" />
<Avatar shape="rounded" />
```

## Initials

Without a `src`, the avatar derives initials from `name`. A single word produces its first two characters; multi-word names produce the first character of the first and last word. With `color="auto"` (default) the background colour is hashed deterministically from the name — same name, same colour, every render.

**Initials**

```tsx
<Avatar name="Sebastian Kowalski" />   {/* "SK" */}
<Avatar name="Alice" />                 {/* "AL" */}
<Avatar name="Mary Anne Smith" />       {/* "MS" */}
<Avatar name="Sebastian" initials="SK" /> {/* explicit override */}
```

To force a specific accent, pass `color="primary"` (or `success`, `warning`, `error`, `info`, `neutral`). Any other string is treated as a raw CSS colour.

```tsx
<Avatar name="Bot" color="primary" />
<Avatar name="Bot" color="#9b59b6" />
```

## Icon fallback

When neither `src` nor `name`/`initials` resolves, a generic user glyph renders. Override it with `fallbackIcon`.

**Icon fallback**

```tsx
<Avatar />
<Avatar fallbackIcon={<RobotIcon />} />
```

## Statuses

Add a presence indicator in the bottom-right corner via the `status` prop.

**Statuses**

| Status    | Colour token            |
| --------- | ----------------------- |
| `online`  | `colors.accent.success` |
| `away`    | `colors.accent.warning` |
| `busy`    | `colors.accent.error`   |
| `offline` | `colors.text.muted`     |

```tsx
<Avatar name="Alice" status="online" />
<Avatar name="Bob" status="away" />
<Avatar name="Carol" status="busy" />
<Avatar name="Dave" status="offline" />
```

## Fallback chain

The component renders both the image and the fallback in the same DOM, with the image positioned over the fallback. As soon as the image loads it paints over the initials; if it errors, the image is hidden via `data-loaded="false"` and the initials become visible without a layout shift.

**Broken image**

In order:

1. **Image** — `src` provided and loads successfully
2. **Initials** — derived from `name` (or set explicitly via `initials`)
3. **Icon** — `fallbackIcon` if provided, otherwise a generic user glyph

## Image source recommendations

- Square aspect ratio. The `<img>` is rendered with `object-fit: cover`, so non-square sources crop to centre.
- Render at 2× the avatar's pixel size for crisp results on HiDPI displays — for a 32px avatar, a 64×64 source.
- Prefer modern formats (WebP / AVIF). Avatars sit in a container with `overflow: hidden`, so transparency is preserved when the format supports it.
- For user-uploaded images, consider running them through a face-aware crop service (Unsplash, Cloudinary, your own pipeline) before passing the URL to `<Avatar>`.

## Clickable

Provide `onClick` to make the avatar interactive — focusable, with a hover affordance and Enter/Space activation.

**Clickable**

```tsx
<Avatar
  src="/users/alice.png"
  name="Alice"
  onClick={() => openProfile('alice')}
/>
```

## AvatarGroup

Display multiple avatars as an overlapping cluster.

**AvatarGroup**

```tsx
<AvatarGroup max={4}>
  <Avatar src="/users/alice.png" name="Alice" />
  <Avatar name="Bob" />
  <Avatar name="Carol" />
  <Avatar name="Dave" />
  <Avatar name="Eve" />
</AvatarGroup>
```

`size` and `bordered` propagate to every child — the group always wins so the cluster reads uniformly. The default `bordered={true}` adds a 2px ring matching the surrounding background; the leftmost avatar stacks on top via descending z-index.

## AvatarGroup overflow

When the number of children exceeds `max`, the remainder collapses into a `+N` indicator. Hover it to reveal the names of the hidden avatars.

**AvatarGroup overflow**

```tsx
<AvatarGroup max={4}>{/* 12 avatars — 4 visible, "+8" overflow */}</AvatarGroup>
```

Disable the tooltip with `showOverflowTooltip={false}` when the names aren't useful in context (e.g. when none of the avatars carry a `name` prop).

### Group sizes

**Group sizes**

### Editor example

A collaborators row in a project header.

**Editor example**

## Accessibility

- The accessible name resolves in this order: `aria-label` → `name` → `alt`. Always supply at least one of these.
- The image's `alt` attribute defaults to `name` (then the empty string), so when an image fails the underlying initials read with the supplied name.
- The status dot has its own `aria-label` (`"Status: Online"` etc.) so a screen reader reaches it independently of the avatar's name.
- When `onClick` is provided, the avatar gets `role="button"` and `tabIndex={0}`, and Enter / Space trigger the handler.
- The fallback glyph is marked `aria-hidden="true"` once an image successfully loads so it doesn't double-announce.

## API Reference

### Avatar

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | — | Image source URL. Falls back to initials, then to an icon, on error. |
| `alt` | `string` | — | Image alt text and accessible name fallback. |
| `name` | `string` | — | Display name. Drives initials and the auto color hash. |
| `initials` | `string` | — | Manual initials override. Truncated to two characters and uppercased. |
| `fallbackIcon` | `ReactNode` | — | Icon shown when neither image nor initials resolve. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'` | `'md'` | Diameter (16 / 20 / 24 / 32 / 40 / 56 px). |
| `shape` | `'circle' \| 'square' \| 'rounded'` | `'circle'` | Border radius treatment. |
| `color` | `'auto' \| 'neutral' \| 'primary' \| 'success' \| 'warning' \| 'error' \| 'info' \| string` | `'auto'` | Background colour for the initials / icon surface. |
| `status` | `'online' \| 'away' \| 'busy' \| 'offline'` | — | Optional presence indicator in the bottom-right corner. |
| `onClick` | `(event) => void` | — | When provided, the avatar becomes a focusable button with Enter/Space activation. |
| `bordered` | `boolean` | `false` | Render a 2px ring matching the surrounding background. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the avatar root element. |

### AvatarGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `max` | `number` | `4` | Maximum number of visible avatars before the +N indicator appears. |
| `spacing` | `number \| string` | `-8` | Spacing between avatars. Negative values overlap. Numbers are pixels. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'` | `'md'` | Size applied to every child avatar. |
| `bordered` | `boolean` | `true` | Force a border on every child, separating overlapping avatars. |
| `showOverflowTooltip` | `boolean` | `true` | Show a tooltip listing hidden avatar names when the +N indicator is visible. |
| `children` *(required)* | `ReactNode` | — | Avatar children. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the group root element. |
