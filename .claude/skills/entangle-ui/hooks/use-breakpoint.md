# useBreakpoint

> Reactive named-breakpoint matcher for the library's responsive scale.

`useBreakpoint` returns booleans for each named breakpoint (`xs`, `sm`, `md`, `lg`, `xl`) plus a `current` field with the largest matching name. It is built on top of `useMediaQuery` and uses the same px values as `Stack` and every other responsive layout primitive, so logic written against the hook stays consistent with what the components render.

**Live preview**

## Import

```ts
import { useBreakpoint } from 'entangle-ui';
```

## Signature

```ts
function useBreakpoint(): UseBreakpointReturn;

interface BreakpointMap {
  xs: boolean; // always true
  sm: boolean; // min-width: 576px
  md: boolean; // min-width: 768px
  lg: boolean; // min-width: 992px
  xl: boolean; // min-width: 1200px
}

interface UseBreakpointReturn extends BreakpointMap {
  current: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
```

## Usage

```tsx
function Layout() {
  const { md, current } = useBreakpoint();

  return (
    <>
      {md ? <Sidebar /> : <BottomSheet />}
      <Text size="sm">Current breakpoint: {current}</Text>
    </>
  );
}
```

### Conditional rendering

**Responsive layout**

## Breakpoint values

| Name | Query                 |
| ---- | --------------------- |
| `xs` | always `true`         |
| `sm` | `(min-width: 576px)`  |
| `md` | `(min-width: 768px)`  |
| `lg` | `(min-width: 992px)`  |
| `xl` | `(min-width: 1200px)` |

These are the same values exposed by `breakpoints` from `entangle-ui/palettes` and consumed by responsive component props (`Stack`, `Grid`, etc).

## Return value

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `xs` | `boolean` | — | Always `true` — base mobile breakpoint with no minimum width. |
| `sm` | `boolean` | — | Matches `(min-width: 576px)`. |
| `md` | `boolean` | — | Matches `(min-width: 768px)`. |
| `lg` | `boolean` | — | Matches `(min-width: 992px)`. |
| `xl` | `boolean` | — | Matches `(min-width: 1200px)`. |
| `current` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | — | Name of the largest matching breakpoint. |

## Common pitfalls

- **Prefer CSS where possible.** Layout decisions that can be expressed with CSS media queries or with the responsive props on `Stack` / `Grid` should stay in CSS — they avoid a JS-driven re-render on every viewport change.
- **Server rendering:** the hook resolves to `xs` on the server (no `matchMedia`). For SSR layouts that must match the client on first paint, gate the markup behind an `isClient` flag or render the mobile branch by default.
- **Mobile-first booleans:** every flag below the active breakpoint is `true` as well, mirroring the `min-width` cascade. Use `current` when you need exactly one branch.
