---
editUrl: false
next: false
prev: false
title: "Slider"
---

> `const` **Slider**: `React.FC`\<[`SliderProps`](/api/type-aliases/sliderprops/)\>

Defined in: [src/components/controls/Slider/Slider.tsx:236](https://github.com/SebastianWebdev/entangle-ui/blob/3a4ec9f4fea9c67f55f22d9132b3047d3a5027ac/src/components/controls/Slider/Slider.tsx#L236)

A professional slider component with drag interaction and keyboard support.

Features:
- Smooth drag interaction with visual feedback
- Keyboard navigation with arrow keys
- Modifier key support: Ctrl (large steps), Shift (precision)
- Optional tick marks and value tooltip
- Comprehensive theming and size variants
- Accessible with proper ARIA attributes

## Example

```tsx
// Basic slider
<Slider
  value={opacity}
  onChange={setOpacity}
  min={0}
  max={1}
  step={0.1}
  unit="%"
/>

// Slider with ticks and custom formatting
<Slider
  value={rotation}
  onChange={setRotation}
  min={0}
  max={360}
  step={15}
  unit="°"
  showTicks
  tickCount={8}
  formatValue={(v) => `${v}°`}
/>

// Precision slider for fine control
<Slider
  value={scale}
  onChange={setScale}
  min={0.1}
  max={5}
  step={0.1}
  precisionStep={0.01}
  largeStep={1}
  precision={2}
/>
```
