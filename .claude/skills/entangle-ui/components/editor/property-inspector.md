# PropertyInspector

> Property inspector system with collapsible sections, label-value rows, groups, search filtering, and undo support.

A property inspector system for editor interfaces, modeled after the property panels found in 3D tools (Blender, Unity, Unreal). Composed of four components -- `PropertyPanel`, `PropertySection`, `PropertyRow`, and `PropertyGroup` -- plus a `usePropertyUndo` hook for undo/redo support. The panel provides shared context for size and search filtering to all child components.

**Live Preview**

## Import

```tsx
import {
  PropertyPanel,
  PropertySection,
  PropertyRow,
  PropertyGroup,
  usePropertyUndo,
} from 'entangle-ui';
```

## Usage

```tsx
<PropertyPanel size="md" searchable>
  <PropertySection title="Transform">
    <PropertyRow label="Position X">
      <NumberInput value={posX} onChange={setPosX} />
    </PropertyRow>
    <PropertyRow label="Position Y">
      <NumberInput value={posY} onChange={setPosY} />
    </PropertyRow>
    <PropertyRow label="Position Z">
      <NumberInput value={posZ} onChange={setPosZ} />
    </PropertyRow>
  </PropertySection>
  <PropertySection title="Material">
    <PropertyRow label="Color">
      <ColorPicker value={color} onChange={setColor} />
    </PropertyRow>
    <PropertyRow label="Roughness" splitRatio={[35, 65]}>
      <Slider value={roughness} onChange={setRoughness} min={0} max={1} />
    </PropertyRow>
  </PropertySection>
</PropertyPanel>
```

## Components

### PropertyPanel

The root container that provides size context and optional search filtering to all child sections and rows. Supports a fixed header, footer, and scrollable content area.

```tsx
<PropertyPanel
  size="md"
  searchable
  searchPlaceholder="Filter properties..."
  onSearchChange={query => console.log(query)}
  header={<h3>Object Properties</h3>}
  footer={<button>Apply All</button>}
  maxHeight={500}
>
  {/* PropertySection components */}
</PropertyPanel>
```

### PropertySection

Collapsible section with a header trigger, optional icon, and action buttons. Supports both controlled and uncontrolled expanded state.

```tsx
<PropertySection
  title="Transform"
  icon={<TransformIcon />}
  defaultExpanded={true}
  actions={<IconButton icon={<ResetIcon />} onClick={handleReset} />}
>
  <PropertyRow label="Position X">
    <NumberInput value={0} />
  </PropertyRow>
</PropertySection>
```

#### Controlled Expansion

```tsx
const [expanded, setExpanded] = useState(true);

<PropertySection
  title="Advanced"
  expanded={expanded}
  onExpandedChange={setExpanded}
>
  {/* ... */}
</PropertySection>;
```

#### Custom Indicator

Pass a custom element as the `indicator` prop, or `null` to hide the chevron entirely.

```tsx
<PropertySection title="No Chevron" indicator={null}>
  {/* Always-visible content with no expand toggle */}
</PropertySection>
```

### PropertyRow

A label-value row with configurable split ratio, modified state indicator, tooltip, and reset button. Inherits size from the parent `PropertyPanel` or can override it individually.

```tsx
<PropertyRow
  label="Opacity"
  tooltip="Object opacity (0-1)"
  splitRatio={[40, 60]}
  modified
  onReset={() => setOpacity(1)}
>
  <Slider value={opacity} onChange={setOpacity} min={0} max={1} />
</PropertyRow>
```

#### Full Width Mode

When `fullWidth` is enabled, the label appears above the control instead of beside it. Useful for controls that need more horizontal space (e.g., text areas, color pickers).

```tsx
<PropertyRow label="Description" fullWidth>
  <textarea value={description} onChange={handleChange} />
</PropertyRow>
```

#### Modified State

The `modified` prop shows a visual dot indicator and bolds the label, signaling that the property has been changed from its default value. Combine with `onReset` to show a reset button on hover.

```tsx
<PropertyRow label="Scale" modified={scale !== 1} onReset={() => setScale(1)}>
  <NumberInput value={scale} onChange={setScale} />
</PropertyRow>
```

### PropertyGroup

Groups related rows together with an optional labeled divider. Supports indentation for nested groups.

```tsx
<PropertySection title="Physics">
  <PropertyGroup title="Rigid Body">
    <PropertyRow label="Mass">
      <NumberInput value={mass} onChange={setMass} />
    </PropertyRow>
    <PropertyRow label="Friction">
      <Slider value={friction} onChange={setFriction} min={0} max={1} />
    </PropertyRow>
  </PropertyGroup>
  <PropertyGroup title="Collision" indent={1}>
    <PropertyRow label="Shape">
      <select value={shape} onChange={handleShapeChange}>
        <option>Box</option>
        <option>Sphere</option>
        <option>Mesh</option>
      </select>
    </PropertyRow>
  </PropertyGroup>
</PropertySection>
```

## Sizes

The `size` prop on `PropertyPanel` cascades to all child sections and rows. Individual components can override with their own `size` prop.

| Size | Row Min Height | Use case                           |
| ---- | -------------- | ---------------------------------- |
| `sm` | 22px           | Dense inspector layouts            |
| `md` | 26px           | Standard property panels (default) |
| `lg` | 30px           | Touch-friendly or high-DPI layouts |

## Search Filtering

When `searchable` is enabled on `PropertyPanel`, a search input appears in the header. The search query is provided to child components via context. Use the `visible` prop on `PropertyRow` to filter rows based on the query.

```tsx
const [searchQuery, setSearchQuery] = useState('');

<PropertyPanel searchable onSearchChange={setSearchQuery}>
  <PropertySection title="Transform">
    <PropertyRow
      label="Position X"
      visible={'position x'.includes(searchQuery.toLowerCase())}
    >
      <NumberInput value={posX} />
    </PropertyRow>
  </PropertySection>
</PropertyPanel>;
```

## Undo / Redo

The `usePropertyUndo` hook provides undo/redo stack management for property changes.

```tsx
const { record, undo, redo, canUndo, canRedo } = usePropertyUndo({
  maxHistory: 50,
});

function handleChange(newValue: number) {
  record({
    propertyId: 'position.x',
    previousValue: posX,
    newValue,
    label: 'Change Position X',
  });
  setPosX(newValue);
}

<button onClick={undo} disabled={!canUndo}>Undo</button>
<button onClick={redo} disabled={!canRedo}>Redo</button>
```

## Props

### PropertyPanel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` *(required)* | `ReactNode` | — | Panel content -- PropertySection, PropertyGroup, or any elements. |
| `header` | `ReactNode` | — | Content rendered in the fixed header area above scrollable content. |
| `footer` | `ReactNode` | — | Content rendered in the fixed footer area below scrollable content. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size applied to all nested sections and rows. Individual components can override. |
| `maxHeight` | `number \| string` | — | Maximum height of the panel. Enables scrolling via ScrollArea when set. |
| `searchable` | `boolean` | `false` | Whether to show a search/filter input in the header. |
| `searchPlaceholder` | `string` | `'Search properties...'` | Placeholder for the search input. |
| `onSearchChange` | `(query: string) => void` | — | Callback when search query changes. |
| `contentTopSpacing` | `number` | — | Top padding for the scrollable content area in pixels. |
| `contentBottomSpacing` | `number` | — | Bottom padding for the scrollable content area in pixels. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the root element. |

### PropertySection

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` *(required)* | `string` | — | Section title displayed in the collapsible header. |
| `icon` | `ReactNode` | — | Icon displayed before the section title. |
| `actions` | `ReactNode` | — | Action buttons on the right side of the header. Clicking them does not toggle the section. |
| `expanded` | `boolean` | — | Whether the section is expanded (controlled mode). |
| `defaultExpanded` | `boolean` | `true` | Whether the section starts expanded (uncontrolled mode). |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Callback when expanded state changes. |
| `keepMounted` | `boolean` | `false` | Whether to keep content mounted in the DOM when collapsed. |
| `disabled` | `boolean` | `false` | Whether the section is disabled (not collapsible, dimmed). |
| `size` | `'sm' \| 'md' \| 'lg'` | — | Size override for this section and its rows. Inherits from PropertyPanel if not set. |
| `indicator` | `ReactNode \| null` | — | Custom chevron indicator. Pass null to hide the default chevron. |
| `onContextMenu` | `(event: MouseEvent) => void` | — | Right-click context menu handler on the section header. |
| `children` *(required)* | `ReactNode` | — | Section content -- PropertyRow, PropertyGroup, or any elements. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the root element. |

### PropertyRow

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` *(required)* | `string` | — | Property label text. |
| `tooltip` | `string` | — | Tooltip text shown on hover over the label. |
| `children` *(required)* | `ReactNode` | — | Control content displayed on the right side. |
| `fullWidth` | `boolean` | `false` | Whether the row spans full width with label above and control below. |
| `splitRatio` | `[number, number]` | `[40, 60]` | Label/value split ratio as percentages. |
| `modified` | `boolean` | `false` | Whether this property has been modified from its default. Shows a dot indicator and bolds the label. |
| `disabled` | `boolean` | `false` | Whether the row is disabled (dimmed, non-interactive). |
| `visible` | `boolean` | `true` | Whether the row is visible. Use with search filtering. |
| `size` | `'sm' \| 'md' \| 'lg'` | — | Size override. Inherits from PropertyPanel if not set. |
| `action` | `ReactNode` | — | Action button on the right edge of the row. |
| `onLabelContextMenu` | `(event: MouseEvent) => void` | — | Right-click handler on the label area. |
| `onReset` | `() => void` | — | Reset callback. When provided, a reset button automatically appears on hover. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the root element. |

### PropertyGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Optional group title rendered as a small label divider. |
| `children` *(required)* | `ReactNode` | — | Group content -- PropertyRow elements. |
| `indent` | `number` | `0` | Indent level for nested groups (number of indent steps). |
| `disabled` | `boolean` | `false` | Whether all rows in this group are disabled. |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the root element. |

## Accessibility

- `PropertyPanel` uses `role="region"` with `aria-label="Properties"`
- The search input has `role="searchbox"` with `aria-label="Search properties"`
- `PropertySection` headers are `<button>` elements with `aria-expanded` and `aria-controls` linking to the content region
- Content regions use `role="region"` with `aria-labelledby` referencing the trigger button
- Disabled sections set `aria-disabled` on the trigger
- `PropertyRow` reset buttons are keyboard-accessible with `role="button"` and `tabIndex={0}`
- Modified properties include an `aria-label="Modified"` on the indicator dot
