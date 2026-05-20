# TagInput

> Multi-value text input that captures a list of strings as removable chips, with configurable commit keys and validation.

A text input that captures a list of strings — keywords, layer names, asset tags — and renders each one as a removable chip. The user types, presses a commit key (Enter or Comma by default), and the draft becomes a chip. **Backspace** on an empty input removes the trailing chip; pasting a separator-delimited string splits the paste into multiple tags.

**Live Preview**

## When to use

- **TagInput** — free-text multi-value entry. The user invents the values.
- **MultiSelect** — multi-value entry from a known set of options.
- **Combobox** with `creatable` — single value, but the user can add brand-new options.

## Import

```tsx
import { TagInput } from 'entangle-ui';
```

## Usage

```tsx
const [tags, setTags] = useState<string[]>([]);

<TagInput
  label="Keywords"
  placeholder="Add a keyword and press Enter"
  value={tags}
  onChange={setTags}
/>;
```

**Basic**

## Controlled vs uncontrolled

```tsx
// Controlled
const [tags, setTags] = useState<string[]>([]);
<TagInput value={tags} onChange={setTags} />

// Uncontrolled
<TagInput defaultValue={['react', 'typescript']} onChange={setTags} />
```

## Sizes

**Sizes**

```tsx
<TagInput size="sm" />
<TagInput size="md" />
<TagInput size="lg" />
```

## Variants

**Variants**

```tsx
<TagInput variant="default" />
<TagInput variant="ghost" />
<TagInput variant="filled" />
```

## Commit keys

`separators` controls which keys / characters commit the current draft as a tag. The default is `['Enter', 'Comma']`.

**Separators**

| Separator | Commits on             | Notes                                                  |
| --------- | ---------------------- | ------------------------------------------------------ |
| `Enter`   | Enter key press        | Default. Always blocks form submit on empty input.     |
| `Comma`   | `,` keypress or paste  | Default. Pasting `foo,bar,baz` splits into three tags. |
| `Space`   | Space keypress / paste | Useful for hashtag-style entry.                        |
| `Tab`     | Tab keypress           | Only commits when the draft is non-empty.              |

```tsx
<TagInput separators={['Enter', 'Comma', 'Space']} />
```

Pasting text with separators is split automatically:

```tsx
// User pastes "react, typescript, vite"
// → adds three tags: ['react', 'typescript', 'vite']
```

## Add on blur

`addOnBlur` commits whatever is in the draft when the input loses focus — handy for forms where the user might forget to press Enter before tabbing away.

**Add on blur**

```tsx
<TagInput addOnBlur />
```

## Max tags

`max` caps the list. Once reached, the input is disabled until the user removes a tag. The validator receives `'max'` as the reason for further attempts.

**Max**

```tsx
<TagInput max={3} defaultValue={['one', 'two']} />
```

## Validation

Use `validate` to reject candidate values. Return `true` to accept, `false` to reject silently, or a string to use as a custom rejection reason. `onValidate` fires for every rejection with the raw value and the reason.

**Validation**

```tsx
<TagInput
  validate={value => /^[a-z0-9-]+$/.test(value) || 'lowercase, digits, hyphens'}
  onValidate={(rawValue, reason) => {
    setError(typeof reason === 'string' ? reason : 'invalid');
  }}
/>
```

| Reason        | When                                                               |
| ------------- | ------------------------------------------------------------------ |
| `'empty'`     | The normalised value is an empty string.                           |
| `'duplicate'` | The tag already exists (and `allowDuplicates={false}`).            |
| `'max'`       | The list already holds `max` tags.                                 |
| `'invalid'`   | The `validate` callback returned `false`.                          |
| _custom_      | The string returned from a `validate` callback is forwarded as-is. |

### Normalisation

`normalize` runs before validation. The default trims whitespace; override for case-folding, slug-ification, or anything else.

```tsx
<TagInput normalize={value => value.trim().toLowerCase()} />
```

### Duplicates

By default duplicates are rejected with reason `'duplicate'`. Set `allowDuplicates` to let them through.

```tsx
<TagInput allowDuplicates />
```

## Custom chip rendering

Replace the built-in chip with `renderTag` — return any node you like. The render state includes the tag, its index, the disabled flag, and a `remove` callback.

```tsx
<TagInput
  renderTag={({ tag, remove }) => (
    <Badge color="accent" onRemove={remove}>
      {tag}
    </Badge>
  )}
/>
```

## Read only

`readOnly` hides the input and disables chip removal — the list is visible but immutable.

**Read only**

```tsx
<TagInput readOnly defaultValue={['locked', 'frozen']} />
```

## Form integration

Use `name` to expose the tags in a native form submit — values are joined by `,`.

```tsx
<TagInput name="keywords" value={tags} onChange={setTags} />
```

## Accessibility

- The wrapper is a `role="group"`; clicks on empty padding focus the inner input.
- Each chip exposes its remove button with `aria-label="Remove <tag>"`.
- The inner input takes `inputAriaLabel` when no `label` is provided.
- **Backspace** on an empty draft removes the trailing tag — saves a round-trip to the mouse.
- `aria-invalid` is set in the error state; `aria-required` when `required` is set.
- `aria-describedby` links to helper / error text.

## API Reference

### `<TagInput>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string[]` | — | Controlled list of tags. |
| `defaultValue` | `string[]` | — | Default tags (uncontrolled). |
| `onChange` | `(tags: string[]) => void` | — | Called whenever the tag list changes. |
| `placeholder` | `string` | — | Placeholder shown in the inner input when empty. |
| `separators` | `Array<'Enter' \| 'Comma' \| 'Space' \| 'Tab'>` | `['Enter', 'Comma']` | Keys / characters that commit the current draft to a tag. |
| `addOnBlur` | `boolean` | `false` | Add the current draft as a tag when the input loses focus. |
| `allowDuplicates` | `boolean` | `false` | Allow duplicate tags. When `false`, attempts to add an existing tag are rejected with reason `duplicate`. |
| `max` | `number` | — | Maximum number of tags. When reached the input is disabled. |
| `validate` | `(value: string, current: string[]) => boolean \| string` | — | Synchronous validator. `false` rejects as `invalid`, a string is forwarded as the rejection reason. |
| `normalize` | `(value: string) => string` | `value => value.trim()` | Transform the candidate before validation. |
| `onValidate` | `(rawValue: string, reason: 'duplicate' \| 'max' \| 'empty' \| 'invalid' \| string) => void` | — | Called when a candidate fails validation. |
| `renderTag` | `(state: TagInputRenderTagState) => ReactNode` | — | Custom chip renderer. When omitted the built-in chip is used. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size. |
| `variant` | `'default' \| 'ghost' \| 'filled'` | `'default'` | Visual variant for the wrapper. |
| `label` | `string` | — | Label rendered above the input. |
| `helperText` | `string` | — | Helper text rendered below the input. |
| `error` | `boolean` | `false` | Error state. |
| `errorMessage` | `string` | — | Error message — shown in place of `helperText` when `error` is true. |
| `disabled` | `boolean` | `false` | Disable the entire control. |
| `required` | `boolean` | `false` | Mark the field as required. |
| `readOnly` | `boolean` | `false` | Read-only — chips are visible but not removable, input is hidden. |
| `name` | `string` | — | Name attribute used for form submission (joined by `,`). |
| `inputAriaLabel` | `string` | — | ARIA label for the inner text input. |
| `inputRef` | `Ref` | — | Ref forwarded to the inner `<input>`. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the wrapper element. |

### `TagInputRenderTagState`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tag` *(required)* | `string` | — | Tag value. |
| `index` *(required)* | `number` | — | Position in the array. |
| `disabled` *(required)* | `boolean` | — | Whether the parent component is disabled. |
| `remove` *(required)* | `() => void` | — | Remove this tag. |
