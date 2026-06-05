# PathBar

> File-path breadcrumbs like the VS Code editor bar — clickable segments, sibling dropdowns, and overflow collapsing.

PathBar turns a file path into clickable breadcrumb segments, like the VS Code editor breadcrumb bar. It is a thin specialization of [Breadcrumbs](/components/navigation/breadcrumbs): give it a path — a delimited string or a structured segment array — and it renders each segment as a crumb, leaning on Breadcrumbs for separators, overflow collapsing, and accessibility.

**Live Preview**

## Import

```tsx
import { PathBar } from 'entangle-ui';
import type { PathBarProps, PathSegment } from 'entangle-ui';
```

## Usage

**Basic**

```tsx
<PathBar value="src/components/Button/Button.tsx" />
```

The string is split on `delimiter` (default `/`). The final segment is treated as the current location: it is rendered with `aria-current="page"` and is **not** a navigation target. Every preceding (folder) segment is clickable.

## Navigation

`onNavigate` fires when a folder crumb is clicked, or when a sibling is chosen from a dropdown. It receives the path up to the activated segment, the segment itself, and its index.

```tsx
<PathBar
  value="src/components/Button/Button.tsx"
  onNavigate={(path, segment, index) => {
    router.push(path); // e.g. "src/components"
  }}
/>
```

### Controlled vs. uncontrolled

PathBar can own the current path or let you drive it:

- **Controlled** — pass `value`. PathBar renders exactly that path and never mutates it; update `value` yourself from `onNavigate`.
- **Uncontrolled** — pass `defaultValue`. PathBar tracks the path itself: clicking a folder crumb truncates the trail to that ancestor.

**Interactive (controlled)**

```tsx
const [path, setPath] = useState('src/components/Button/Button.tsx');

<PathBar value={path} onNavigate={setPath} />;
```

## Sibling dropdown

Provide `getSiblings` to add a VS-Code-style dropdown to each crumb. Return the sibling entries for a segment (the other entries in its parent folder); choosing one swaps that segment and drops anything below it. Return an empty array to leave a segment without a dropdown.

**Sibling picker**

```tsx
<PathBar
  value={path}
  onNavigate={setPath}
  getSiblings={segment => fileTree.childrenOfParentOf(segment.value)}
/>
```

`getSiblings` is called during render for each segment, so keep it cheap (an array or map lookup) — or memoize the underlying data. Each crumb with a non-empty result gains a chevron caret that opens a [Menu](/components/navigation/menu) of siblings; the crumb label still navigates on click.

## Icons

Pass a structured `PathSegment[]` to give individual segments their own icon. `rootIcon` sets a default icon for the first segment when it has none of its own.

**With icons**

```tsx
<PathBar
  value={[
    { label: 'workspace', icon: <HomeIcon size="sm" decorative /> },
    { label: 'src', icon: <FolderIcon size="sm" decorative /> },
    { label: 'components', icon: <FolderIcon size="sm" decorative /> },
    { label: 'Button.tsx', icon: <CodeIcon size="sm" decorative /> },
  ]}
/>
```

## Separators

The default separator is a chevron, matching the VS Code path bar. Override it with any node — a string `/` is common for file paths.

**Separators**

```tsx
<PathBar value="src/components/PathBar/PathBar.tsx" />          {/* chevron */}
<PathBar separator="/" value="src/components/PathBar/PathBar.tsx" />
```

## Collapsing long paths

PathBar reuses the Breadcrumbs collapse machinery. When `maxItems` is greater than `0` and the segment count exceeds it, the middle collapses into an ellipsis. By default the first segment and the last two stay visible, and the ellipsis is clickable to expand.

**Collapsed**

```tsx
<PathBar
  separator="/"
  maxItems={4}
  value="usr/local/share/entangle/packages/ui/dist/index.js"
/>
```

## Sizes

**Sizes**

```tsx
<PathBar size="sm" value="src/components/Button.tsx" />
<PathBar size="md" value="src/components/Button.tsx" />
<PathBar size="lg" value="src/components/Button.tsx" />
```

## Paths

PathBar normalizes paths predictably:

- A leading delimiter marks the path absolute; the navigation values handed to `onNavigate` keep it (`/usr` → `/usr/local`).
- Trailing and doubled delimiters collapse — `src//components/` yields `src`, `components`.
- An empty string (or a path of only delimiters) renders an empty bar.
- Windows-style `\` separators are out of scope for v1. Pass `delimiter="\\"` explicitly if you need them.

## When to use

Use PathBar for file-system-flavored locations: editor breadcrumb bars, asset paths, project tree positions. For generic page or route hierarchies, reach for [Breadcrumbs](/components/navigation/breadcrumbs) directly. For sibling views at the same level, use [Tabs](/components/navigation/tabs).

## Accessibility

- The root is the Breadcrumbs `<nav aria-label="Breadcrumb">` with an ordered list inside.
- Folder crumbs are keyboard-activatable (Enter / Space mirror the click).
- The final segment carries `aria-current="page"`.
- Each sibling-dropdown caret is a labelled icon button (`Browse <segment> siblings`) backed by the accessible Menu (focus management, Esc, arrow keys).

## API Reference

### PathBar

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| ReadonlyArray<string \| PathSegment>` | — | Controlled current path: a delimited string or a pre-split segment array. |
| `defaultValue` | `string \| ReadonlyArray<string \| PathSegment>` | — | Uncontrolled initial path. PathBar then tracks the current path itself. |
| `delimiter` | `string` | `'/'` | Delimiter used to split string paths and join cumulative navigation values. |
| `onNavigate` | `(path: string, segment: PathSegment, index: number) => void` | — | Called when a folder crumb is clicked or a sibling is chosen. `path` is the activated segment’s value. |
| `getSiblings` | `(segment: PathSegment, index: number) => ReadonlyArray<string \| PathSegment>` | — | Return a segment’s siblings to enable a dropdown picker on that crumb. Empty array = no dropdown. |
| `rootIcon` | `ReactNode` | — | Icon shown before the first segment when it has no icon of its own. |
| `separator` | `ReactNode` | `` | Separator inserted between segments. |
| `maxItems` | `number` | `0` | Maximum segments before collapsing the middle. 0 never collapses. |
| `itemsBeforeCollapse` | `number` | `1` | Leading segments kept visible when collapsed. |
| `itemsAfterCollapse` | `number` | `2` | Trailing segments kept visible when collapsed. |
| `expandable` | `boolean` | `true` | Allow clicking the ellipsis to reveal all segments. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Typography and spacing scale. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying nav element. |

### PathSegment

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` *(required)* | `string` | — | Text shown for the segment. |
| `value` | `string` | — | Path handed to onNavigate when activated. Defaults to the cumulative path built from labels and the delimiter. |
| `icon` | `ReactNode` | — | Icon rendered before the label. |
