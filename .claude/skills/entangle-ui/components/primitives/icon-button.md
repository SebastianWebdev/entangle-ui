# IconButton

> Square button component for icon-based actions in toolbars and editor interfaces.

Square button component designed for icon-based actions in toolbars, quick controls, and icon-driven interactions. Always square and sized appropriately for the contained icon. Supports multiple variants, border radius options, and a pressed/toggle state.

**Live Preview**

## Import

```tsx
import { IconButton } from 'entangle-ui';
```

## Usage

```tsx
import { SaveIcon } from 'entangle-ui';

<IconButton aria-label="Save file">
  <SaveIcon />
</IconButton>;
```

## Variants

The `variant` prop controls the button's visual style.

```tsx
<IconButton variant="ghost" aria-label="Ghost action">
  <SettingsIcon />
</IconButton>

<IconButton variant="default" aria-label="Default action">
  <SettingsIcon />
</IconButton>

<IconButton variant="filled" aria-label="Filled action">
  <SettingsIcon />
</IconButton>
```

| Variant   | Description                             | Use case                      |
| --------- | --------------------------------------- | ----------------------------- |
| `ghost`   | No border, subtle hover state           | Toolbar icons, inline actions |
| `default` | Transparent with border, fills on hover | Secondary actions             |
| `filled`  | Solid background with accent color      | Primary actions               |

## Sizes

The button is always square, sized to match the icon.

```tsx
<IconButton size="sm" aria-label="Small">
  <SaveIcon />
</IconButton>
<IconButton size="md" aria-label="Medium">
  <SaveIcon />
</IconButton>
<IconButton size="lg" aria-label="Large">
  <SaveIcon />
</IconButton>
```

| Size | Dimensions | Icon size | Use case          |
| ---- | ---------- | --------- | ----------------- |
| `sm` | 20x20px    | 12px      | Compact toolbars  |
| `md` | 24x24px    | 16px      | Standard panels   |
| `lg` | 32x32px    | 20px      | Prominent actions |

## Border Radius

The `radius` prop controls the button's corner rounding.

```tsx
<IconButton radius="none" aria-label="Sharp corners">
  <SaveIcon />
</IconButton>
<IconButton radius="sm" aria-label="Slight rounding">
  <SaveIcon />
</IconButton>
<IconButton radius="md" aria-label="Moderate rounding">
  <SaveIcon />
</IconButton>
<IconButton radius="lg" aria-label="More rounding">
  <SaveIcon />
</IconButton>
<IconButton radius="full" aria-label="Circular">
  <SaveIcon />
</IconButton>
```

| Radius | Value | Use case              |
| ------ | ----- | --------------------- |
| `none` | 0px   | Sharp toolbar buttons |
| `sm`   | 2px   | Slightly rounded      |
| `md`   | 4px   | Standard rounding     |
| `lg`   | 6px   | Softer appearance     |
| `full` | 50%   | Circular buttons      |

## Pressed / Toggle State

Use the `pressed` prop for toggle states and active tool indicators. The button visually shows the pressed state and sets `aria-pressed`.

```tsx
const [isVisible, setIsVisible] = useState(true);

<IconButton
  pressed={isVisible}
  aria-label="Toggle visibility"
  onClick={() => setIsVisible(!isVisible)}
>
  <EyeIcon />
</IconButton>;
```

## Loading State

The `loading` prop shows a spinner and disables interaction.

```tsx
<IconButton loading aria-label="Saving...">
  <SaveIcon />
</IconButton>
```

## Disabled

```tsx
<IconButton disabled aria-label="Save (disabled)">
  <SaveIcon />
</IconButton>
```

## Combining Props

```tsx
<IconButton
  variant="filled"
  size="lg"
  radius="full"
  aria-label="Add new item"
  onClick={handleAdd}
>
  <AddIcon />
</IconButton>

<IconButton
  variant="default"
  radius="none"
  pressed={isActive}
  aria-label="Toggle grid"
  onClick={toggleGrid}
>
  <GridIcon />
</IconButton>
```

## Props

| Prop         | Type                                       | Default   | Description                                                             |
| ------------ | ------------------------------------------ | --------- | ----------------------------------------------------------------------- |
| `children`   | `ReactNode`                                | —         | Icon component to display inside the button.                            |
| `aria-label` | `string (required)`                        | —         | Accessible label for screen readers. Required for proper accessibility. |
| `variant`    | `'default' \| 'ghost' \| 'filled'`         | `'ghost'` | Visual variant of the button.                                           |
| `size`       | `'sm' \| 'md' \| 'lg'`                     | `'md'`    | Button size. The button is always square.                               |
| `radius`     | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'md'`    | Border radius for button shape control.                                 |
| `disabled`   | `boolean`                                  | `false`   | Whether the button is disabled.                                         |
| `loading`    | `boolean`                                  | `false`   | Loading state -- shows spinner and disables interaction.                |
| `pressed`    | `boolean`                                  | `false`   | Whether the button appears pressed/active. Sets aria-pressed.           |
| `onClick`    | `(event: MouseEvent) => void`              | —         | Click event handler.                                                    |
| `className`  | `string`                                   | —         | Additional CSS class names.                                             |
| `style`      | `CSSProperties`                            | —         | Inline styles.                                                          |
| `testId`     | `string`                                   | —         | Test identifier for automated testing.                                  |
| `ref`        | `Ref`                                      | —         | Ref to the underlying button element.                                   |

The component also accepts all standard HTML `<button>` attributes (except `children`).

## Accessibility

- Renders a native `<button>` element
- `aria-label` is required since there is no visible text content
- `pressed` state sets `aria-pressed` for toggle button semantics
- `disabled` and `loading` states set `disabled` on the native element
- Supports keyboard navigation (Enter/Space to activate)
