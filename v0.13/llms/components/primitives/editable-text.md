# EditableText
> Text that looks like Text but becomes an inline editor on click — for renaming layers, nodes, and assets in place.

`EditableText` renders like `Text` until the user activates it, then swaps to a chrome-less inline `<input>` that shares the exact same typography — the editor-UI pattern for renaming layers, nodes, assets, and scene objects in place. The edit field auto-sizes to its content, commits on <kbd>Enter</kbd> (and on blur), and cancels on <kbd>Escape</kbd>.

**Live Preview**

## Import

```tsx
import { EditableText } from 'entangle-ui';
```

## Usage

```tsx
const [name, setName] = useState('Untitled Layer');

<EditableText value={name} onChange={setName} variant="heading" />;
```

`onChange` fires **on commit only** (Enter or blur), with the new string value — not on every keystroke. That matches the rename mental model: you get the final name, not each intermediate character.

## Controlled vs Uncontrolled

Like the other inputs, `EditableText` is controlled when you pass `value` and uncontrolled when you pass `defaultValue`.

**Controlled** — Committing the edit updates parent state, shown live below the field.

```tsx
// Controlled — parent owns the value
<EditableText value={value} onChange={setValue} />

// Uncontrolled — component owns the value
<EditableText defaultValue="Camera_01" onChange={value => console.log(value)} />
```

## Activation

`activationMode` controls how a pointer starts editing. Keyboard activation (<kbd>Enter</kbd> or <kbd>F2</kbd> while the text is focused) always works, regardless of the mode.

**Activation modes**

```tsx
<EditableText defaultValue="Click me once" activationMode="single" /> {/* default */}
<EditableText defaultValue="Double-click me" activationMode="double" />
```

Use `"single"` for form-like fields and `"double"` when single click is reserved for selecting a row (the file / node rename convention).

## Typography

Because the idle state _is_ a `Text`, every typography prop it accepts works here, and the edit field inherits the same font so the swap is seamless.

**Typography variants**

```tsx
<EditableText variant="display" defaultValue="Display heading" />
<EditableText variant="heading" defaultValue="Section heading" />
<EditableText variant="code" defaultValue="inline_code()" />
<EditableText size="lg" weight="semibold" color="accent" defaultValue="Custom" />
```

## In property rows

The most common use: an editable value paired with a static label, e.g. an object name or material in a property inspector.

**Editable property values** — Double-click any value to rename it in place.

```tsx
<Flex justify="space-between" align="center">
  <Text variant="caption" color="secondary">
    Object name
  </Text>
  <EditableText value={name} onChange={rename} mono activationMode="double" />
</Flex>
```

## Commit and cancel behavior

| Interaction       | Result                                                           |
| ----------------- | ---------------------------------------------------------------- |
| <kbd>Enter</kbd>  | Commit the draft (fires `onChange` if the value changed).        |
| <kbd>Escape</kbd> | Cancel — discard the draft, restore the previous value.          |
| Blur              | Commit by default; set `submitOnBlur={false}` to cancel instead. |

Set `selectOnEdit={false}` to place the caret instead of selecting the whole value when editing starts.

## Imperative handle

Pass a `ref` to drive the edit session from outside — e.g. a toolbar “Rename” button that starts editing the selected item.

```tsx
const ref = useRef<EditableTextHandle>(null);

<EditableText ref={ref} value={name} onChange={setName} />
<IconButton icon={<EditIcon />} onClick={() => ref.current?.edit()} />
```

The handle exposes `edit()`, `commit()`, `cancel()`, `focus()`, `isEditing()`, and `getElement()`.

## Disabled and read-only

**Disabled and read-only**

```tsx
<EditableText defaultValue="Read-only value" readOnly />
<EditableText defaultValue="Disabled value" disabled />
```

`readOnly` shows the value but never enters edit mode; `disabled` additionally mutes it, removes the hover affordance, and takes it out of the tab order.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Committed value (controlled). |
| `defaultValue` | `string` | — | Initial committed value (uncontrolled). |
| `onChange` | `(value: string) => void` | — | Called with the new value on commit (Enter / blur), not per keystroke. |
| `placeholder` | `string` | — | Shown in muted color when the value is empty. |
| `as` | `TextElement` | `'span'` | HTML element rendered for the idle display state. |
| `variant` | `TextVariant` | `'body'` | Semantic typography variant, matching Text. |
| `size` | `TextSize` | — | Text size, matching Text. |
| `weight` | `TextWeight` | — | Text weight, matching Text. |
| `color` | `TextColor` | `'primary'` | Text color, matching Text. |
| `lineHeight` | `TextLineHeight` | — | Line height, matching Text. |
| `align` | `TextAlign` | — | Text alignment. |
| `truncate` | `boolean` | `false` | Truncate the display text with an ellipsis on overflow. |
| `mono` | `boolean` | `false` | Use the monospace font family. |
| `activationMode` | `'single' \| 'double'` | `'single'` | How a pointer starts editing. Keyboard (Enter/F2) always works. |
| `disabled` | `boolean` | `false` | Disable editing entirely; mutes and removes from tab order. |
| `readOnly` | `boolean` | `false` | Show the value but do not allow editing. |
| `selectOnEdit` | `boolean` | `true` | Select the whole value when editing starts. |
| `submitOnBlur` | `boolean` | `true` | Commit on blur; when false, blurring cancels instead. |
| `maxLength` | `number` | — | Maximum number of characters accepted by the edit field. |
| `labels` | `Partial` | — | String overrides for localization. See Internationalization. |
| `aria-label` | `string` | — | Explicit accessible name; wins over the derived name and labels. |
| `onEditStart` | `() => void` | — | Called when an edit session starts. |
| `onEditEnd` | `(reason: 'commit' \| 'cancel') => void` | — | Called when an edit session ends, with the reason. |
| `onKeyDown` | `(event: KeyboardEvent) => void` | — | Key-down handler forwarded to the edit field (runs after built-ins). |
| `className` | `string` | — | Additional CSS class on the current root element. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Imperative handle: edit / commit / cancel / focus / isEditing / getElement. |

## Styling

`EditableText` exposes its own overridable custom properties for the interaction chrome; everything else (typography and text color) comes straight from the `Text` tokens, because the display and edit field both render with the `Text` recipe.

### Own custom properties

| Property                         | Default                      | Purpose                                    |
| -------------------------------- | ---------------------------- | ------------------------------------------ |
| `--etui-editable-text-hover-bg`  | `--etui-color-surface-hover` | Background of the display on hover.        |
| `--etui-editable-text-edit-bg`   | `--etui-color-bg-tertiary`   | Background of the field while editing.     |
| `--etui-editable-text-edit-ring` | `--etui-color-border-focus`  | Inset ring around the field while editing. |

### Consumed theme tokens

| Token                                                                                                                      | Used for                                            |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `--etui-color-surface-hover`                                                                                               | Default display hover background.                   |
| `--etui-color-bg-tertiary`                                                                                                 | Default edit-field background.                      |
| `--etui-color-border-focus`                                                                                                | Default edit-field ring.                            |
| `--etui-color-text-muted`                                                                                                  | Placeholder text (display and field).               |
| `--etui-shadow-focus`                                                                                                      | Focus ring on the keyboard-focused display element. |
| `--etui-radius-sm`                                                                                                         | Corner radius of the display and edit field.        |
| `--etui-transition-fast`                                                                                                   | Hover background transition.                        |
| `--etui-font-size-*`, `--etui-font-weight-*`, `--etui-line-height-*`, `--etui-font-family-sans`, `--etui-font-family-mono` | Typography, via the `Text` recipe.                  |
| `--etui-color-text-primary` … `--etui-color-accent-*`                                                                      | Text color, via the `Text` `color` prop.            |

## Internationalization

Every user-facing string routes through `labels` (with English defaults exported as `DEFAULT_EDITABLE_TEXT_LABELS`). An explicit `aria-label` prop still wins over the label, and the `placeholder` is its own prop.

| Key         | Type     | Default       | Description                                                                         |
| ----------- | -------- | ------------- | ----------------------------------------------------------------------------------- |
| `editLabel` | `string` | `'Edit text'` | Accessible name for the edit field, and the display when empty with no placeholder. |

**Localized** — Polish labels and placeholder; the explicit aria-label overrides the field name.

```tsx
<EditableText
  value={value}
  onChange={setValue}
  labels={{ editLabel: 'Edytuj tekst' }}
  placeholder="Kliknij, aby nazwać…"
/>
```

## Accessibility

- The idle display is exposed as a focusable `role="button"` when editable; its accessible name is the current value (or the placeholder / `editLabel` when empty).
- Activation works by pointer (`activationMode`) **and** keyboard — <kbd>Enter</kbd> or <kbd>F2</kbd> while focused.
- The edit field is a native `<input>` labelled by `aria-label` (`editLabel` by default).
- After a keyboard-driven commit or cancel, focus returns to the display element so keyboard users stay in place.
- `disabled` sets `aria-disabled` and removes the element from the tab order.
