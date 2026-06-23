# Pagination
> Page navigator with sibling/boundary ellipsis logic, controlled and uncontrolled modes, three sizes, and optional first/last jump buttons.

A 1-based page navigator that collapses long page ranges with ellipses. Use it under any list, table, or grid that can be paged through. The MUI-style sibling/boundary algorithm keeps the control compact even for thousands of pages, and the component works in both controlled and uncontrolled modes.

**Live Preview**

## Import

```tsx
import { Pagination } from 'entangle-ui';
```

## Usage

In uncontrolled mode, pass `count` and (optionally) `defaultPage`. The component owns the page state and notifies the consumer via `onChange`.

```tsx
<Pagination count={20} defaultPage={1} onChange={(_, page) => loadPage(page)} />
```

For full control, pass `page` and react in `onChange`:

```tsx
const [page, setPage] = useState(1);

<Pagination count={20} page={page} onChange={(_, next) => setPage(next)} />;
```

Pages are 1-based. `count` is the total number of pages; pass `0` to render nothing.

## Controlled

**Controlled**

## Sizes

Three sizes match the rest of the type scale.

**Sizes**

```tsx
<Pagination size="sm" count={10} />
<Pagination size="md" count={10} />
<Pagination size="lg" count={10} />
```

## Ellipsis logic

`siblingCount` controls how many page numbers are shown on each side of the current page. `boundaryCount` controls how many are pinned to the start and end. Anything skipped collapses into an ellipsis.

**Many pages**

```tsx
<Pagination count={50} defaultPage={25} />
// renders: 1 … 24 [25] 26 … 50
```

Tighter layouts can drop the siblings entirely:

**Compact**

```tsx
<Pagination count={20} defaultPage={10} siblingCount={0} boundaryCount={1} />
// renders: ‹ 1 … [10] … 20 ›
```

## First and last jump buttons

For tables with many pages, surface "jump to first" and "jump to last" controls explicitly.

**Full controls**

```tsx
<Pagination count={50} defaultPage={25} showFirstButton showLastButton />
```

Conversely, hide the prev/next controls in compact contexts:

```tsx
<Pagination count={10} hidePrevButton hideNextButton />
```

## Disabled

Use `disabled` to lock the whole control while the consumer is in a transitional state (e.g. fetching a page).

**Disabled**

```tsx
<Pagination count={10} defaultPage={4} disabled />
```

## Localised labels

Override the aria-labels for each item type with `getItemAriaLabel`. Useful for non-English UIs.

```tsx
<Pagination
  count={20}
  getItemAriaLabel={(type, page, selected) => {
    if (type === 'previous') return 'Strona poprzednia';
    if (type === 'next') return 'Strona następna';
    if (type === 'first') return 'Pierwsza strona';
    if (type === 'last') return 'Ostatnia strona';
    if (type === 'page')
      return selected ? `Strona ${page}` : `Idź do strony ${page}`;
    return 'Więcej stron';
  }}
/>
```

## Accessibility

- The root is a `<nav aria-label="pagination">` so screen readers announce it as a navigation region.
- The current page has `aria-current="page"`.
- Each button has a descriptive `aria-label` (`Go to page 5`, `Go to next page`, etc.) — customise with `getItemAriaLabel`.
- Disabled state is conveyed via the native `disabled` attribute on the button.
- Ellipses are decorative and use `aria-hidden="true"`.
- Buttons are keyboard-reachable in the default tab order; `Enter` and `Space` activate them.

## API Reference

### `<Pagination>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `number` | — | Total number of pages. |
| `page` | `number` | — | Currently selected page (1-based). Controls the component when set. |
| `defaultPage` | `number` | `1` | Default selected page in uncontrolled mode (1-based). |
| `onChange` | `(event: SyntheticEvent, page: number) => void` | — | Called when the user requests a new page. |
| `siblingCount` | `number` | `1` | Pages shown on each side of the current page. |
| `boundaryCount` | `number` | `1` | Pages always shown at the start and end of the list. |
| `showFirstButton` | `boolean` | `false` | Show the "jump to first" button. |
| `showLastButton` | `boolean` | `false` | Show the "jump to last" button. |
| `hidePrevButton` | `boolean` | `false` | Hide the previous-page button. |
| `hideNextButton` | `boolean` | `false` | Hide the next-page button. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Visual size. |
| `disabled` | `boolean` | `false` | Disable the whole control. |
| `getItemAriaLabel` | `(type, page, selected) => string` | — | Custom aria-label generator for each item. |
