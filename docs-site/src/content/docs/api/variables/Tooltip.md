---
editUrl: false
next: false
prev: false
title: "Tooltip"
---

> `const` **Tooltip**: `React.FC`\<[`TooltipProps`](/api/type-aliases/tooltipprops/)\>

Defined in: [src/components/primitives/Tooltip/Tooltip.tsx:215](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/primitives/Tooltip/Tooltip.tsx#L215)

A tooltip component that displays contextual information on hover.

Built on @base-ui/react for robust accessibility and positioning.
Provides an intuitive API similar to MUI with advanced positioning and collision handling.
Supports both simple text and complex React nodes for advanced tooltip content.

## Example

```tsx
// Simple text tooltip
<Tooltip title="Save your work">
  <Button>Save</Button>
</Tooltip>

// Intuitive positioning (MUI-style)
<Tooltip placement="bottom-start" title="Menu options">
  <IconButton><MenuIcon /></IconButton>
</Tooltip>

// Intelligent collision handling (new default)
<Tooltip collision="smart" title="Intelligent positioning">
  <Button>Smart tooltip</Button>
</Tooltip>

// Advanced collision configuration
<Tooltip
  collisionConfig={{
    side: 'flip',
    align: 'shift',
    fallbackAxisSide: 'start',
    hideWhenDetached: true
  }}
  title="Custom collision handling"
>
  <Button>Advanced collision</Button>
</Tooltip>

// Advanced positioning
<Tooltip
  positioner={{
    offset: 12,
    padding: 10,
    sticky: true,
    boundary: '#container'
  }}
  title="Advanced positioning"
>
  <Button>Advanced</Button>
</Tooltip>

// Custom animations
<Tooltip
  animation={{
    animated: true,
    duration: 300,
    easing: 'ease-in-out'
  }}
  title="Custom animation"
>
  <Button>Animated</Button>
</Tooltip>

// Interactive tooltip
<Tooltip
  hoverable={true}
  closeDelay={300}
  title={
    <div>
      <strong>Interactive Content</strong>
      <br />
      <button>Click me</button>
    </div>
  }
>
  <Button>Hoverable tooltip</Button>
</Tooltip>

// Full control with raw props
<Tooltip
  arrow={false}
  rootProps={{ trackCursorAxis: 'x' }}
  positionerProps={{ arrowPadding: 20 }}
  title="Full control"
>
  <Button>Power user</Button>
</Tooltip>
```
