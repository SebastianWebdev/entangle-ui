# Input

> Versatile text input component for editor interfaces with labels, icons, error states, and multiple sizes.

Versatile text input component for editor interfaces. Supports labels, helper text, start/end icons, error states, and multiple sizes optimized for compact editor UIs.

**Live Preview**

## Import

```tsx
import { Input } from 'entangle-ui';
```

## Usage

```tsx
<Input placeholder="Enter text..." value={text} onChange={setText} />
```

## Sizes

Sizes are optimized for editor interface density.

```tsx
<Input size="sm" placeholder="Small (20px)" />
<Input size="md" placeholder="Medium (24px)" />
<Input size="lg" placeholder="Large (32px)" />
```

| Size | Height | Use case         |
| ---- | ------ | ---------------- |
| `sm` | 20px   | Compact toolbars |
| `md` | 24px   | Standard forms   |
| `lg` | 32px   | Prominent inputs |

## With Label

The `label` prop adds an accessible label above the input. Combine with `required` to show a red asterisk.

```tsx
<Input label="Project Name" placeholder="My Project" />
<Input label="Email" required placeholder="you@example.com" />
```

## With Icons

Use `startIcon` and `endIcon` to place icons inside the input field.

```tsx
import { SearchIcon, CloseIcon } from 'entangle-ui';

<Input startIcon={<SearchIcon />} placeholder="Search..." />
<Input endIcon={<CloseIcon />} placeholder="Clearable input" />
```

## Helper Text

The `helperText` prop displays descriptive text below the input.

```tsx
<Input
  label="Project Name"
  placeholder="My Project"
  helperText="Choose a unique name for your project"
/>
```

## Error State

Set `error` to `true` and provide an `errorMessage` to display validation feedback. The error message replaces the helper text when active.

```tsx
<Input
  label="Email"
  type="email"
  error={!!emailError}
  errorMessage={emailError}
  value={email}
  onChange={setEmail}
/>
```

## Input Types

The `type` prop supports common HTML input types.

```tsx
<Input type="text" placeholder="Text input" />
<Input type="email" placeholder="Email address" />
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="Number" />
<Input type="search" placeholder="Search" />
<Input type="url" placeholder="URL" />
<Input type="tel" placeholder="Phone number" />
```

## Read Only

```tsx
<Input readOnly value="This value cannot be changed" label="Read Only" />
```

## Disabled

```tsx
<Input disabled placeholder="Disabled input" />
<Input disabled label="Disabled" value="Cannot edit" />
```

## Combining Props

```tsx
<Input
  label="Search Files"
  placeholder="Type to search..."
  size="sm"
  startIcon={<SearchIcon />}
  helperText="Search across all project files"
  value={query}
  onChange={setQuery}
/>
```

## Props

| Prop           | Type                                                                        | Default  | Description                                                       |
| -------------- | --------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `value`        | `string`                                                                    | —        | Input value (controlled mode).                                    |
| `defaultValue` | `string`                                                                    | —        | Default value (uncontrolled mode).                                |
| `placeholder`  | `string`                                                                    | —        | Placeholder text displayed when input is empty.                   |
| `type`         | `'text' \| 'email' \| 'password' \| 'number' \| 'search' \| 'url' \| 'tel'` | `'text'` | HTML input type.                                                  |
| `size`         | `'sm' \| 'md' \| 'lg'`                                                      | `'md'`   | Input size optimized for editor interfaces.                       |
| `disabled`     | `boolean`                                                                   | `false`  | Whether the input is disabled.                                    |
| `error`        | `boolean`                                                                   | `false`  | Whether the input has an error state.                             |
| `required`     | `boolean`                                                                   | `false`  | Whether the input is required. Shows a red asterisk on the label. |
| `readOnly`     | `boolean`                                                                   | `false`  | Whether the input is read-only.                                   |
| `label`        | `string`                                                                    | —        | Input label displayed above the field.                            |
| `helperText`   | `string`                                                                    | —        | Helper text displayed below the input.                            |
| `errorMessage` | `string`                                                                    | —        | Error message displayed when error is true. Replaces helperText.  |
| `startIcon`    | `ReactNode`                                                                 | —        | Icon displayed at the start of the input.                         |
| `endIcon`      | `ReactNode`                                                                 | —        | Icon displayed at the end of the input.                           |
| `onChange`     | `(value: string) => void`                                                   | —        | Change event handler — receives the new string value directly.    |
| `onFocus`      | `(event: FocusEvent) => void`                                               | —        | Focus event handler.                                              |
| `onBlur`       | `(event: FocusEvent) => void`                                               | —        | Blur event handler.                                               |
| `onKeyDown`    | `(event: KeyboardEvent) => void`                                            | —        | Key down event handler.                                           |
| `className`    | `string`                                                                    | —        | Additional CSS class names.                                       |
| `style`        | `CSSProperties`                                                             | —        | Inline styles.                                                    |
| `testId`       | `string`                                                                    | —        | Test identifier for automated testing.                            |
| `ref`          | `Ref`                                                                       | —        | Ref to the underlying input element.                              |

The component also accepts all standard HTML `<input>` attributes (except `onChange` and `size`, which are replaced by the custom props above).

## Accessibility

- Label is linked to the input via `htmlFor`/`id` for screen readers
- `required` adds `required` attribute to the native input and displays a visual asterisk
- Error state helper text is associated with the input for assistive technology
- Supports standard keyboard navigation (Tab to focus, type to input)
- `disabled` and `readOnly` states are reflected on the native input element
