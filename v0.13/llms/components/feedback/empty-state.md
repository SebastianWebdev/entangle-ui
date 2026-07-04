# EmptyState
> Generic empty / loading state surface with icon, title, description, and action slots.

A generic empty-state surface for empty lists, filtered-out results, "not yet started" placeholders, and loading states. The `loading` prop swaps the icon for a `Spinner` and adds `role="status"` to the root so screen readers announce the loading state.

For chat-specific empty states (with quick-start suggestion chips) use `ChatEmptyState` instead.

**Live Preview**

## Import

```tsx
import { EmptyState } from 'entangle-ui';
```

## Usage

**Default**

```tsx
<EmptyState
  icon={<InboxIcon />}
  title="Inbox zero"
  description="You're all caught up — no unread messages."
/>
```

## With Action

**With action**

```tsx
<EmptyState
  icon={<SearchIcon size="lg" />}
  title="No results"
  description="Try adjusting your search or filters."
  action={
    <>
      <Button>Reset filters</Button>
      <Button variant="filled">New search</Button>
    </>
  }
/>
```

## Variants

### Default (centered column)

The default variant lays out icon, title, description, and action vertically centered — good for a whole panel or page.

### Compact (inline row)

The `compact` variant switches to a single horizontal row with reduced padding, for empty list cells where a full vertical layout would feel oversized.

**Compact**

```tsx
<EmptyState
  variant="compact"
  icon={<TagIcon />}
  title="No tags"
  description="Tags appear here once you add them."
/>
```

## Loading State

Set `loading` to render a `Spinner` in place of the icon. The root receives `role="status"` and `aria-live="polite"`.

**Loading**

```tsx
<EmptyState loading title="Loading conversation..." />
```

### Loading ↔ empty swap

A common pattern: the same container shows either the loading state or the real empty state, based on a boolean. Because the outer layout is identical, the swap is visually stable.

**Loading ↔ empty swap** — Click Retry to toggle between the empty state and the loading state.

```tsx
{
  loading ? (
    <EmptyState loading title="Searching..." />
  ) : (
    <EmptyState
      icon={<SearchIcon />}
      title="No results"
      description="Try adjusting your filters."
      action={<Button onClick={retry}>Retry</Button>}
    />
  );
}
```

## In a PanelSurface

Combine with `PanelSurface` to give the empty state a contained look:

```tsx
<PanelSurface>
  <PanelSurface.Body scroll>
    {items.length === 0 ? (
      <EmptyState
        icon={<TagIcon />}
        title="No tags"
        description="Press N to create one."
      />
    ) : (
      <TagList items={items} />
    )}
  </PanelSurface.Body>
</PanelSurface>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `ReactNode` | — | Icon or illustration (typically 48–64px). |
| `title` | `ReactNode` | — | Main heading. |
| `description` | `ReactNode` | — | Supporting description — one short paragraph. |
| `action` | `ReactNode` | — | CTA buttons rendered below the description. |
| `variant` | `'default' \| 'compact'` | `'default'` | Layout — centered column ("default") or single horizontal row ("compact"). |
| `loading` | `boolean` | `false` | Render a Spinner in place of the icon and mark the root as role="status". |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying div element. |

## Accessibility

- When `loading`, the root is marked with `role="status"` and `aria-live="polite"` so screen readers announce the loading state without requiring focus
- Title is rendered as `<h3>` inside the text column for proper document outline
- Description is rendered as `<p>` and constrained to roughly 48 characters for comfortable reading
