# MultiSelect

> Multi-value select that renders chosen options as inline chips, with a "+N more" overflow badge and optional search.

A dropdown that lets the user pick several values from a flat or grouped list. Selected values surface as inline chips inside the trigger; once the count exceeds `maxInlineChips`, the rest collapses into a `+N more` badge so the trigger never grows out of its slot. Supports optional in-dropdown search, a `max` cap, and a clear-all button.

**Live Preview**

## When to use

- **MultiSelect** — picking several values from a known set; the chips show the current selection at a glance.
- **Combobox** — single value, with typing-as-search.
- **TagInput** — multi-value where the entries are free text, not options from a list.

## Import

```tsx
import { MultiSelect } from 'entangle-ui';
import type { MultiSelectOption } from 'entangle-ui';
```

## Usage

```tsx
const options: MultiSelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
];

<MultiSelect
  label="Frameworks"
  options={options}
  value={selected}
  onChange={setSelected}
/>;
```

**Basic**

## Controlled vs uncontrolled

```tsx
// Controlled
const [value, setValue] = useState<string[]>([]);
<MultiSelect options={options} value={value} onChange={setValue} />

// Uncontrolled
<MultiSelect options={options} defaultValue={['react']} />
```

## Sizes

**Sizes**

```tsx
<MultiSelect size="sm" options={options} />
<MultiSelect size="md" options={options} />
<MultiSelect size="lg" options={options} />
```

## Variants

**Variants**

```tsx
<MultiSelect variant="default" options={options} />
<MultiSelect variant="ghost" options={options} />
<MultiSelect variant="filled" options={options} />
```

## Searchable

Pass `searchable` to render a filter input at the top of the dropdown. A custom `filterFn` overrides the default substring match.

**Searchable**

```tsx
<MultiSelect searchable searchPlaceholder="Filter..." options={options} />
```

```tsx
// Custom filter
<MultiSelect
  searchable
  filterFn={(option, query) => option.value.startsWith(query.toLowerCase())}
  options={options}
/>
```

## Grouped options

Options can be organised under non-selectable group headers.

**Grouped**

```tsx
<MultiSelect
  label="Fruits"
  options={[
    {
      label: 'Citrus',
      options: [
        { value: 'lemon', label: 'Lemon' },
        { value: 'lime', label: 'Lime' },
      ],
    },
    {
      label: 'Berries',
      options: [
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'blueberry', label: 'Blueberry' },
      ],
    },
  ]}
/>
```

## Max selection

`max` caps the number of selections. Once reached, additional options become un-selectable until the user removes one.

**Max**

```tsx
<MultiSelect
  label="Pick up to 2"
  options={options}
  max={2}
  helperText="Maximum 2 frameworks"
/>
```

## Inline chips overflow

`maxInlineChips` controls how many selected chips render in the trigger before the rest collapse into a `+N more` badge. Set to `Infinity` to render every chip; `0` shows only the count.

**Many chips**

```tsx
<MultiSelect
  options={options}
  defaultValue={['react', 'vue', 'svelte', 'angular']}
  maxInlineChips={2}
/>
```

## Close on select

By default the dropdown stays open across selections — useful when the user is picking several values in a row. Set `closeOnSelect` to dismiss after each pick.

```tsx
<MultiSelect closeOnSelect options={options} />
```

## Error state

**Error**

```tsx
<MultiSelect
  label="Frameworks"
  options={options}
  error
  errorMessage="Pick at least one framework"
  required
/>
```

## Form integration

Use `name` to render a hidden input with the selected values joined by `,`.

```tsx
<MultiSelect
  name="frameworks"
  options={options}
  value={value}
  onChange={setValue}
/>
```

## Accessibility

- Trigger is a `<button>` with `role="combobox"`, `aria-haspopup="listbox"`, and `aria-expanded`.
- Dropdown is a `role="listbox"` with `aria-multiselectable="true"`; each row is a `role="option"` with `aria-selected`.
- Grouped options use `role="group"` with `aria-label`.
- Keyboard: **Arrow Up / Down** to navigate, **Enter** / **Space** to toggle, **Escape** to close, **Home / End** for first / last, **Backspace** removes the trailing chip.
- `aria-invalid` is set in the error state; `aria-required` when `required` is set.
- `aria-describedby` links to helper / error text.
- Chip remove buttons have `aria-label="Remove <label>"`; the clear-all button has `aria-label="Clear selection"`.

## API Reference

### `<MultiSelect>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T[]` | — | Controlled list of selected values. |
| `defaultValue` | `T[]` | — | Default selection (uncontrolled). |
| `options` | `Array \| MultiSelectOptionGroup>` | — | Options — flat list or grouped. |
| `placeholder` | `string` | `'Select...'` | Placeholder shown when nothing is selected. |
| `searchable` | `boolean` | `false` | Whether to render a search input inside the dropdown. |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder for the search input. |
| `filterFn` | `(option: MultiSelectOption, query: string) => boolean` | — | Custom filter for searchable mode. |
| `emptyMessage` | `string` | `'No results found'` | Message shown when search yields no results. |
| `max` | `number` | — | Maximum number of selected items. |
| `maxInlineChips` | `number` | `3` | Cap of inline chips rendered in the trigger before falling back to a `+N more` badge. `Infinity` to render every chip; `0` to show only the count. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size. |
| `variant` | `'default' \| 'ghost' \| 'filled'` | `'default'` | Visual variant. |
| `label` | `string` | — | Label rendered above the trigger. |
| `helperText` | `string` | — | Helper text rendered below. |
| `error` | `boolean` | `false` | Error state. |
| `errorMessage` | `string` | — | Error message — overrides `helperText` when `error` is true. |
| `disabled` | `boolean` | `false` | Disable the entire control. |
| `required` | `boolean` | `false` | Mark the field as required. |
| `clearable` | `boolean` | `false` | Show a clear-all button when at least one value is selected. |
| `maxDropdownHeight` | `number` | `240` | Maximum dropdown height in pixels. |
| `minDropdownWidth` | `number` | — | Minimum dropdown width in pixels. |
| `closeOnSelect` | `boolean` | `false` | Close the dropdown after each selection. |
| `name` | `string` | — | Hidden form-input name. Selected values are joined by `,`. |
| `onChange` | `(values: T[]) => void` | — | Selection change handler. |
| `onOpenChange` | `(open: boolean) => void` | — | Open state change handler. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the trigger button element. |

### `MultiSelectOption`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` *(required)* | `T` | — | Unique value used for selection. |
| `label` | `string` | — | Display label. Falls back to `value` when omitted. |
| `icon` | `ReactNode` | — | Optional icon rendered before the label. |
| `disabled` | `boolean` | — | Whether this option is disabled. |

### `MultiSelectOptionGroup`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` *(required)* | `string` | — | Group header label (non-selectable). |
| `options` *(required)* | `MultiSelectOption[]` | — | Options inside this group. |
