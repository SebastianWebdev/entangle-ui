# Combobox

> Single-value select with an editable input, built-in fuzzy filtering, and optional free-solo or creatable modes.

A single-value select with an editable input. The option list filters as the user types — by default with the built-in fuzzy matcher shared with [CommandPalette](/components/feedback/command-palette), or with a custom `filterFn`. Reach for `Combobox` when the option set is too large for a plain `Select`, when the user might type a value that isn't there (`freeSolo`), or when they should be able to add new entries on the fly (`creatable`).

**Live Preview**

## When to use

- **Combobox** — long lists where typing is faster than scrolling, or any flow where the user might type a value not in the list.
- **Select** — short, fixed lists where the value must come from a known set. Lighter weight.
- **MultiSelect** — same shape as `Combobox` but the user picks several values at once.

## Import

```tsx
import { Combobox } from 'entangle-ui';
import type { ComboboxOption } from 'entangle-ui';
```

## Usage

```tsx
const options: ComboboxOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
];

<Combobox
  label="Framework"
  options={options}
  value={framework}
  onChange={setFramework}
/>;
```

**Basic**

## Controlled vs uncontrolled

Both modes are supported. `onChange` receives `null` when the value is cleared.

```tsx
// Controlled
const [value, setValue] = useState<string | null>(null);
<Combobox options={options} value={value} onChange={setValue} />

// Uncontrolled
<Combobox options={options} defaultValue="react" />
```

## Sizes

**Sizes**

```tsx
<Combobox size="sm" options={options} />
<Combobox size="md" options={options} />
<Combobox size="lg" options={options} />
```

## Variants

**Variants**

```tsx
<Combobox variant="default" options={options} />
<Combobox variant="ghost" options={options} />
<Combobox variant="filled" options={options} />
```

## Free-solo mode

`freeSolo` lets the user commit an arbitrary string that isn't in the options list. The `onChange` handler fires with the typed value on `Enter` or blur.

**Free-solo**

```tsx
<Combobox
  freeSolo
  label="Tag"
  options={existingTags}
  value={tag}
  onChange={setTag}
/>
```

## Creatable

`creatable` surfaces a `Create "<query>"` row when the query has no exact match. Pressing Enter (or clicking the row) invokes `onCreate` with the typed string — the consumer is responsible for adding the new option to the list. Implies `freeSolo`.

**Creatable**

```tsx
const [options, setOptions] = useState(initialOptions);
const [value, setValue] = useState<string | null>(null);

<Combobox
  creatable
  options={options}
  value={value}
  onChange={setValue}
  onCreate={input => {
    const created = { value: input, label: input };
    setOptions(prev => [...prev, created]);
    setValue(input);
  }}
/>;
```

Customise the row's label via `createLabel`:

```tsx
<Combobox
  creatable
  createLabel={q => (
    <>
      Add new tag: <strong>{q}</strong>
    </>
  )}
  options={options}
  onCreate={handleCreate}
/>
```

## Loading

Async option sources hand the component a `loading` flag — the dropdown shows a spinner row instead of options. Pair with `onInputChange` to debounce a remote search and re-feed `options` once the response lands.

**Loading**

```tsx
<Combobox
  options={options}
  loading={isFetching}
  loadingMessage="Searching..."
  onInputChange={query => debouncedSearch(query)}
/>
```

## Open on focus

By default the dropdown opens once the user starts typing. `openOnFocus` opens it the moment the input receives focus — useful for short curated lists where the input is more of a "filterable picker".

**Open on focus**

```tsx
<Combobox openOnFocus options={options} placeholder="Click to browse" />
```

## Custom filter

Replace the built-in fuzzy matcher with your own logic — `filterFn` can return a boolean (keep / drop) or a numeric score (higher = ranked higher).

```tsx
<Combobox
  options={options}
  filterFn={(option, query) =>
    option.value.startsWith(query.toLowerCase()) ? 2 : 0
  }
/>
```

## Error state

**Error**

```tsx
<Combobox
  label="Country"
  options={options}
  error
  errorMessage="Pick a country to continue"
  required
/>
```

## Form integration

Use `name` to render a hidden `<input>` with the selected value for native form submission.

```tsx
<Combobox
  name="country"
  options={countries}
  value={country}
  onChange={setCountry}
/>
```

## Accessibility

- Input renders with `role="combobox"`, `aria-haspopup="listbox"`, and `aria-expanded` reflecting the dropdown state.
- Dropdown is a `role="listbox"` with `role="option"` children; the active option is reflected via `aria-activedescendant`.
- Keyboard: **Arrow Up / Down** to navigate, **Enter** to select (or create in `creatable` mode), **Escape** to close, **Home / End** for first / last option, **Backspace** on an empty input clears a selected value when `clearable`.
- `aria-invalid` is set in the error state; `aria-required` when `required` is set.
- `aria-describedby` links to the helper / error text.
- Clear button (when shown) has `aria-label="Clear selection"`.

## API Reference

### `<Combobox>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `T \| null` | — | Controlled selected value. |
| `defaultValue` | `T` | — | Default selected value (uncontrolled). |
| `options` | `ComboboxOption[]` | — | Available options. |
| `placeholder` | `string` | — | Placeholder rendered when the input is empty. |
| `filterFn` | `(option: ComboboxOption, query: string) => boolean \| number` | — | Custom filter. Boolean keeps / drops; number is a score (higher = ranked higher). Defaults to the built-in fuzzy matcher. |
| `emptyMessage` | `string` | `'No results found'` | Message shown when filtering yields no results. |
| `loading` | `boolean` | `false` | Loading indicator — replaces options with a spinner row. |
| `loadingMessage` | `string` | `'Loading...'` | Message shown while loading. |
| `freeSolo` | `boolean` | `false` | Allow values not present in `options`. `onChange` fires with the typed string on blur / Enter. |
| `creatable` | `boolean` | `false` | Surface a "Create <query>" row when the query has no exact match. Implies `freeSolo`. |
| `createLabel` | `(query: string) => ReactNode` | — | Render the create row label. Defaults to `Create "<query>"`. |
| `openOnFocus` | `boolean` | `false` | Open the dropdown automatically when the input gains focus, even with no query. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size. |
| `variant` | `'default' \| 'ghost' \| 'filled'` | `'default'` | Visual variant. |
| `label` | `string` | — | Label rendered above the input. |
| `helperText` | `string` | — | Helper text rendered below. |
| `error` | `boolean` | `false` | Error state. |
| `errorMessage` | `string` | — | Error message — overrides `helperText` when `error` is true. |
| `disabled` | `boolean` | `false` | Disable the input. |
| `required` | `boolean` | `false` | Mark the field as required. |
| `readOnly` | `boolean` | `false` | Read-only — input value is fixed. |
| `clearable` | `boolean` | `false` | Show a clear button when a value is selected. |
| `maxDropdownHeight` | `number` | `240` | Maximum dropdown height in pixels. |
| `minDropdownWidth` | `number` | — | Minimum dropdown width in pixels. |
| `name` | `string` | — | Hidden form-input name. |
| `onChange` | `(value: T \| null) => void` | — | Selection change handler. `null` is passed when cleared. |
| `onInputChange` | `(input: string) => void` | — | Free-text change handler — fires every keystroke regardless of selection. |
| `onCreate` | `(input: string) => void` | — | Called when the user creates a new option (only with `creatable`). Falls back to `onChange` when omitted. |
| `onOpenChange` | `(open: boolean) => void` | — | Open state change handler. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the underlying input element. |

### `ComboboxOption`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` *(required)* | `T` | — | Unique value used for selection. |
| `label` | `string` | — | Display label. Falls back to `value` when omitted. |
| `description` | `string` | — | Optional description rendered next to the label. |
| `icon` | `ReactNode` | — | Optional icon rendered before the label. |
| `disabled` | `boolean` | — | Whether this option is disabled. |
