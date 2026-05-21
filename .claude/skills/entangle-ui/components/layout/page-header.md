# PageHeader

> Structural page or view header with optional icon, subtitle, breadcrumbs, and right-aligned actions.

A semantic `<header>` element that arranges an optional leading icon, the title block (breadcrumbs + title + subtitle), and a right-aligned actions slot. Built for top-of-view headers inside a panel or page container, not for the application chrome — for that, use the components under `Shell`.

**Live Preview**

## Import

```tsx
import { PageHeader } from 'entangle-ui';
```

## Usage

**Basic**

```tsx
<PageHeader title="Project Assets" />
```

## Anatomy

```
[ icon ]  [ breadcrumbs        ]   [ actions ]
          [ title              ]
          [ subtitle           ]
```

The title block grows to fill available space; actions sit flush to the right.

## With Actions

**With actions**

```tsx
<PageHeader
  icon={<FolderIcon />}
  title="Project Assets"
  subtitle="124 items"
  actions={
    <>
      <Button>Import</Button>
      <Button variant="filled">Upload</Button>
    </>
  }
/>
```

## With Breadcrumbs

You can pass any `ReactNode` as `breadcrumbs` — typically your own breadcrumb component or a series of `<a>` tags.

**With breadcrumbs**

```tsx
<PageHeader
  breadcrumbs={<span>Workspace / Project / Assets</span>}
  title="Textures"
  subtitle="Baked PBR materials"
  icon={<FolderIcon />}
  actions={<Button variant="filled">New</Button>}
/>
```

## Sizes

The `size` prop scales the title font size and outer padding.

**Sizes**

```tsx
<PageHeader size="sm" title="Small" />
<PageHeader size="md" title="Medium" />
<PageHeader size="lg" title="Prominent" />
```

| Size | Title font size | Padding               |
| ---- | --------------- | --------------------- |
| `sm` | `md` (12px)     | `sm` × `md`           |
| `md` | `lg` (14px)     | `md` × `lg` (default) |
| `lg` | `xl` (16px)     | `lg` × `xl`           |

## Borderless

The bottom border is on by default. Pass `bordered={false}` when the header sits inside another bordered container.

**Inside a bordered container** — The header

```tsx
<div style={{ border: '1px solid var(--etui-color-border-default)' }}>
  <PageHeader title="Settings" bordered={false} />
  <div>panel body...</div>
</div>
```

## Inside a PanelSurface

```tsx
<PanelSurface>
  <PageHeader title="Inspector" actions={<IconButton icon={<MoreIcon />} />} />
  <PanelSurface.Body scroll>{/* content */}</PanelSurface.Body>
</PanelSurface>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` *(required)* | `ReactNode` | — | Title — plain string or custom ReactNode. |
| `icon` | `ReactNode` | — | Icon rendered before the title. |
| `subtitle` | `ReactNode` | — | Optional subtitle below the title. |
| `actions` | `ReactNode` | — | Actions rendered on the right (buttons, menus, IconButtons). |
| `breadcrumbs` | `ReactNode` | — | Breadcrumb slot rendered above the title. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size scale. |
| `bordered` | `boolean` | `true` | Render a bottom border separating the header from content. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying header element. |

## Accessibility

- Renders a semantic `<header>` element so assistive tech and search engines treat it as page-level metadata
- Title is rendered as `<h1>` inside the title block — pair with `aria-labelledby` on the surrounding section if needed
- Actions container is a plain `<div>` — wrap individual actions in `<Button>` or `<IconButton>` for proper button semantics and `aria-label`
