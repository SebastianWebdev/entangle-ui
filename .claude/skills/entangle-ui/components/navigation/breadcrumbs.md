# Breadcrumbs

> Hierarchical navigation trail for pages, editor paths, and nested resources.

Breadcrumbs show where the current view sits in a hierarchy: file paths, nested categories, project folders, or parent routes. Use Tabs for sibling views at the same level; use Breadcrumbs when each segment is a parent of the next one.

**Live Preview**

## Import

```tsx
import {
  BreadcrumbEllipsis,
  BreadcrumbItem,
  Breadcrumbs,
  BreadcrumbSeparator,
} from 'entangle-ui';
```

## Usage

**Basic**

```tsx
<Breadcrumbs>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/components">Components</BreadcrumbItem>
  <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
</Breadcrumbs>
```

Pass `isCurrent` explicitly on the current page. Breadcrumbs does not infer the current segment from missing links.

## With Icons

**With icons**

```tsx
<BreadcrumbItem href="/" icon={<HomeIcon size="sm" decorative />}>
  Home
</BreadcrumbItem>
```

## Custom Separator

**String separator**

```tsx
<Breadcrumbs separator="/">
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
</Breadcrumbs>
```

**Icon separator**

```tsx
<Breadcrumbs separator={<ArrowRightIcon size="sm" decorative />}>
  {/* items */}
</Breadcrumbs>
```

## Sizes

**Sizes**

| Size | Font token | Separator gap |
| ---- | ---------- | ------------- |
| `sm` | `xs`       | `xs`          |
| `md` | `sm`       | `sm`          |
| `lg` | `md`       | `sm`          |

```tsx
<Breadcrumbs size="sm" />
<Breadcrumbs size="md" />
<Breadcrumbs size="lg" />
```

## Collapsed

**Collapsed**

```tsx
<Breadcrumbs maxItems={4} expandable={false}>
  {/* long trail */}
</Breadcrumbs>
```

When `maxItems` is greater than `0` and the item count exceeds it, the middle of the trail collapses into an ellipsis. By default, the first item and the last two items remain visible.

## Expandable

**Expandable**

```tsx
<Breadcrumbs maxItems={4}>
  {/* clicking the ellipsis expands the trail */}
</Breadcrumbs>
```

`expandable` defaults to `true`, so the ellipsis is a button with `aria-label="Show all breadcrumbs"`.

## Truncation

**Long labels**

```tsx
<BreadcrumbItem href="/captures" maxLength={16}>
  Photogrammetry capture workspace
</BreadcrumbItem>
```

Only string labels are truncated. Icons remain visible before the shortened label, and the full label is exposed through Tooltip.

## Editor Paths

**File path**

```tsx
<Breadcrumbs separator="/">
  <BreadcrumbItem href="/">project</BreadcrumbItem>
  <BreadcrumbItem href="/src">src</BreadcrumbItem>
  <BreadcrumbItem href="/src/components">components</BreadcrumbItem>
  <BreadcrumbItem isCurrent>Button.tsx</BreadcrumbItem>
</Breadcrumbs>
```

## Integration with PageHeader

**In PageHeader**

```tsx
<PageHeader
  breadcrumbs={
    <Breadcrumbs>
      <BreadcrumbItem href="/">Workspace</BreadcrumbItem>
      <BreadcrumbItem href="/projects">Project</BreadcrumbItem>
      <BreadcrumbItem isCurrent>Assets</BreadcrumbItem>
    </Breadcrumbs>
  }
  title="Textures"
/>
```

## Compound API

If you pass only `BreadcrumbItem` children, separators are inserted automatically. Use the `separator` prop to change the default separator for the whole trail.

```tsx
<Breadcrumbs separator="/">
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
</Breadcrumbs>
```

For full control, place `BreadcrumbSeparator` manually between items. When explicit separators are present, Breadcrumbs renders your children as provided.

```tsx
<Breadcrumbs>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbSeparator>/</BreadcrumbSeparator>
  <BreadcrumbItem isCurrent>Button</BreadcrumbItem>
</Breadcrumbs>
```

## When to use

Use Breadcrumbs for hierarchical paths: files, folders, nested categories, scene hierarchy depth, or parent route trails. Use a Stepper for linear numbered flows when that component ships. Do not use Breadcrumbs as primary navigation; they are supporting context and a way back up the hierarchy.

## Accessibility

- The root renders `<nav aria-label="Breadcrumb">` with an ordered list inside
- Each segment is an `<li>` so assistive tech announces a list of pages in order
- Mark the current segment with `isCurrent`, which applies `aria-current="page"`
- Separators are decorative and hidden from assistive tech
- Clickable ellipsis uses a native `<button>` and keyboard support when collapsed trails are expandable

## API Reference

### Breadcrumbs

| Prop                    | Type                   | Default | Description                                                                                      |
| ----------------------- | ---------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `children` _(required)_ | `ReactNode`            | —       | BreadcrumbItem children, optionally mixed with BreadcrumbSeparator for manual separator control. |
| `separator`             | `ReactNode`            | ``      | Default separator inserted between items.                                                        |
| `maxItems`              | `number`               | `0`     | Maximum item count before collapsing. Use 0 to never collapse.                                   |
| `itemsBeforeCollapse`   | `number`               | `1`     | Number of leading items to keep visible when collapsed.                                          |
| `itemsAfterCollapse`    | `number`               | `2`     | Number of trailing items to keep visible when collapsed.                                         |
| `expandable`            | `boolean`              | `true`  | Allow clicking the ellipsis to reveal all items.                                                 |
| `size`                  | `'sm' \| 'md' \| 'lg'` | `'sm'`  | Typography and separator spacing scale.                                                          |
| `className`             | `string`               | —       | Additional CSS class names.                                                                      |
| `style`                 | `CSSProperties`        | —       | Inline styles.                                                                                   |
| `testId`                | `string`               | —       | Test identifier for automated testing.                                                           |
| `ref`                   | `Ref`                  | —       | Ref to the underlying nav element.                                                               |

### BreadcrumbItem

| Prop                    | Type                          | Default | Description                                                  |
| ----------------------- | ----------------------------- | ------- | ------------------------------------------------------------ |
| `children` _(required)_ | `ReactNode`                   | —       | Segment label, typically a string.                           |
| `href`                  | `string`                      | —       | Render the segment as a link.                                |
| `onClick`               | `(event: MouseEvent) => void` | —       | Click handler for client-side routing.                       |
| `isCurrent`             | `boolean`                     | `false` | Mark the segment as the current page.                        |
| `icon`                  | `ReactNode`                   | —       | Icon rendered before the label.                              |
| `maxLength`             | `number`                      | —       | Maximum string length before truncating and showing Tooltip. |
| `className`             | `string`                      | —       | Additional CSS class names.                                  |
| `style`                 | `CSSProperties`               | —       | Inline styles.                                               |
| `testId`                | `string`                      | —       | Test identifier for automated testing.                       |
| `ref`                   | `Ref`                         | —       | Ref to the underlying list item.                             |

### BreadcrumbSeparator

| Prop        | Type            | Default | Description                            |
| ----------- | --------------- | ------- | -------------------------------------- |
| `children`  | `ReactNode`     | —       | Custom separator content.              |
| `className` | `string`        | —       | Additional CSS class names.            |
| `style`     | `CSSProperties` | —       | Inline styles.                         |
| `testId`    | `string`        | —       | Test identifier for automated testing. |
| `ref`       | `Ref`           | —       | Ref to the underlying list item.       |

### BreadcrumbEllipsis

| Prop        | Type            | Default | Description                                   |
| ----------- | --------------- | ------- | --------------------------------------------- |
| `onClick`   | `() => void`    | —       | Click handler used to expand collapsed items. |
| `tooltip`   | `ReactNode`     | —       | Tooltip content describing collapsed labels.  |
| `className` | `string`        | —       | Additional CSS class names.                   |
| `style`     | `CSSProperties` | —       | Inline styles.                                |
| `testId`    | `string`        | —       | Test identifier for automated testing.        |
| `ref`       | `Ref`           | —       | Ref to the underlying list item.              |
