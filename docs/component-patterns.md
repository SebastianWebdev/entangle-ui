# Component Patterns

Architectural rules for building components in `entangle-ui`. These are not
suggestions — they are the patterns the library is built on. New code must
follow them. Existing code that violates them is a bug.

Every rule below has a concrete reference implementation already in the
codebase. When in doubt, copy from the reference.

---

## 1. Reuse existing hooks — never reimplement

Before writing `new ResizeObserver`, `new IntersectionObserver`, `setTimeout`,
`matchMedia`, or any other browser API inside a `useEffect`, check
`src/hooks/index.ts`. If a hook exists for that primitive, use it.

### Catalog

| Need                                              | Use                                            | Don't write                                     |
| ------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| Observe element size                              | `useResizeObserver(ref, cb, { enabled })`      | `new ResizeObserver` in a `useEffect`           |
| Observe element visibility                        | `useIntersectionObserver`                      | `new IntersectionObserver` in a `useEffect`     |
| Match a media query                               | `useMediaQuery`                                | `window.matchMedia` + listener in a `useEffect` |
| Resolve current breakpoint                        | `useBreakpoint`                                | nested media query checks                       |
| Read latest prop/callback inside a stable handler | `useLatest(value)`                             | manual `ref.current = value` in a `useEffect`   |
| Merge multiple refs                               | `useMergedRef(a, b, c)`                        | hand-rolled callback ref                        |
| Debounce a value                                  | `useDebouncedValue`                            | `setTimeout` + state                            |
| Debounce/throttle a callback                      | `useDebouncedCallback`, `useThrottledCallback` | manual timers                                   |
| Detect outside clicks                             | `useClickOutside`                              | hand-rolled document listener                   |
| Trap focus inside a region                        | `useFocusTrap`                                 | manual focusable-element traversal              |
| Controlled-or-uncontrolled state                  | `useControlledState`                           | parallel `useState` + `useEffect` sync          |
| Disclosure (open/close/toggle)                    | `useDisclosure`                                | ad-hoc boolean `useState`                       |
| Keyboard navigation in a listbox                  | `useListboxNav`                                | hand-rolled arrow-key switch                    |
| Global hotkeys                                    | `useHotkey`                                    | document-level `keydown` listener               |
| Read theme tokens at runtime                      | `useTheme`                                     | manual `getComputedStyle`                       |
| Copy to clipboard                                 | `useClipboard`                                 | direct `navigator.clipboard` calls              |

If a hook is missing for something we use in 2+ places, **add** it to
`src/hooks/` rather than inlining the logic. Hooks are first-class API
surface — they get tests, docs, and exports just like components.

### Anti-example (from `ViewportMinimap` v1)

```tsx
// ❌ Reimplements useResizeObserver
useEffect(() => {
  if (!responsive) return;
  const wrapper = wrapperRef.current;
  if (!wrapper || typeof ResizeObserver === 'undefined') return;
  const observer = new ResizeObserver(entries => {
    const entry = entries[0];
    if (entry) setMeasuredWidth(entry.contentRect.width);
  });
  observer.observe(wrapper);
  return () => observer.disconnect();
}, [responsive]);
```

### Correct

```tsx
// ✅ One line, SSR-safe, picks up node remounts, no callback memoization needed
useResizeObserver(
  wrapperRef,
  entry => setMeasuredWidth(entry.contentRect.width),
  { enabled: responsive }
);
```

**Reference:** `src/components/primitives/viewport/Viewport.tsx:171`.

---

## 2. `useEffect` is the last resort, not the first

A `useEffect` is correct only for synchronizing with an **external system**
(DOM API, browser, network, third-party store). It is **wrong** for:

- Deriving state from props or other state → use `useMemo` or compute inline.
- Caching a value computed from a DOM element → compute it inside the
  consumer (e.g. inside the draw function for canvas).
- Mirroring a prop into local state → just read the prop.
- Running an effect on mount to "initialize" something that could be a
  `useRef` initializer or a module-level constant.

### Anti-example: theme color cache (from `Minimap` v1)

```tsx
// ❌ State + effect to cache values resolved from a DOM element.
// Three bugs in one:
//   1. Extra render cycle (setState → render → draw effect).
//   2. Cached values go stale on theme switch.
//   3. The effect lists color props as deps but not "theme changed".
const [resolvedColors, setResolvedColors] = useState({
  /* fallbacks */
});
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  setResolvedColors({
    background:
      backgroundColor ??
      resolveVarValue(canvas, vars.colors.background.secondary),
    // ...
  });
}, [backgroundColor, defaultItemColor, viewportRectStroke, outsideOverlay]);
```

### Correct

```tsx
// ✅ Resolve at the point of use. No state. No staleness.
const draw = useCallback(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const colors = {
    background:
      backgroundColor ??
      resolveVarValue(canvas, vars.colors.background.secondary),
    // ...
  };
  drawMinimap({ ctx, colors /* ... */ });
}, [backgroundColor /* ... */]);
```

**Reference patterns:**

- `src/components/primitives/viewport/ViewportLayer.tsx:55-86` — resolve
  theme inside `performDraw`, never in a `useState`.
- `src/components/controls/CurveEditor/useCurveRenderer.ts` — same pattern.

### When `useEffect` is correct

- Attaching a `window`/`document` listener (matchMedia, scroll, online/offline).
- Synchronizing an imperative library (canvas, WebGL, third-party widget).
- Mirroring React state into an external store (only the bridge, not
  derivations).

For canvas drawing specifically, prefer `useLayoutEffect` for the first
frame to avoid a blank-canvas flash before the browser paints.

---

## 3. Callback / prop identity stability via `useLatest`

Inline callbacks and inline objects from consumers are the norm, not the
exception. A hook or effect that lists them in dependencies will fire on
every parent render. The fix is `useLatest` — read the value from a ref
inside the handler, keep the handler identity stable.

### Anti-example

```ts
// ❌ Re-creates every handler on every onNavigate identity change.
//   Consumer passing inline `onNavigate={info => ...}` re-attaches all
//   listeners on every render.
const emit = useCallback(
  (info: NavigateInfo) => onNavigate?.(info),
  [onNavigate]
);
const handlePointerDown = useCallback(
  e => {
    /* uses emit */
  },
  [emit, transform, viewportSize]
);
```

### Correct

```ts
// ✅ All handlers stable for component lifetime.
const onNavigateRef = useLatest(onNavigate);
const transformRef = useLatest(transform);
const viewportSizeRef = useLatest(viewportSize);

const handlePointerDown = useCallback(e => {
  const t = transformRef.current;
  // ...
  onNavigateRef.current?.(info);
}, []); // ← empty deps; refs are stable
```

The same pattern applies to `useEffect` that subscribes to anything:

```ts
// ✅ Subscription attaches once, callback reads latest props through ref.
const drawRef = useLatest(draw);
useEffect(() => {
  return store.subscribe(() => drawRef.current(/* ... */));
}, [store, drawRef]);
```

**Reference:**

- `src/components/primitives/viewport/useViewportGestures.ts` — `callbacksRef`,
  `setTransformRef`, `limitsRef`, `zoomSpeedRef` all via `useLatest`.
- `src/components/primitives/viewport/ViewportLayer.tsx:52-53` — `drawRef`,
  `pausedRef` via `useLatest`.

### Special case: function props that gate draw schedules

If a function prop (e.g. `renderOverlay`, `draw`) lives in the dependency
array of a draw `useEffect`, **wrap it in `useLatest`** so consumer
inline-functions don't invalidate the schedule.

```ts
// ❌
useEffect(() => {
  drawMinimap({ renderOverlay });
}, [renderOverlay /* ... */]);

// ✅
const renderOverlayRef = useLatest(renderOverlay);
useEffect(
  () => {
    drawMinimap({ renderOverlay: renderOverlayRef.current });
  },
  [
    /* no renderOverlay here */
  ]
);
```

---

## 4. State architecture: context value vs. external store

`useState` + `useContext` is fine for low-frequency, low-fanout state.
For everything else, use a class-based store + `useSyncExternalStore`.

### When to use a store

You need a store when **any** of these is true:

- State updates fire faster than the component tree can re-render
  (mouse-move, drag, animation frame).
- Multiple subscribers need different slices and shouldn't re-render when
  unrelated slices change.
- You need imperative access from outside React (e.g. an `useImperativeHandle`).

### When `useState` + `useContext` is enough

- The value changes on user actions (clicks), not continuous input.
- All consumers use the whole value anyway.
- There are < 5 consumers in the tree.

### Anti-example (from `Minimap` v1)

```tsx
// ❌ Single context value rebuilt on every pointermove.
//   Re-renders every consumer of useMinimapContext() at ~60Hz during hover.
const contextValue = useMemo<MinimapContextValue>(
  () => ({
    worldBounds,
    minimapSize,
    transform,
    viewportSize,
    hoverWorldPoint,
    hoverMinimapPoint,
    hoveredItemId,
    isDragging,
  }),
  [
    worldBounds,
    minimapSize,
    transform,
    viewportSize,
    hoverWorldPoint,
    hoverMinimapPoint,
    hoveredItemId,
    isDragging,
  ]
);
```

### Correct (store pattern)

```ts
// ✅ MinimapStore.ts — class with per-slice subscribe/get.
export class MinimapStore {
  #geometry: GeometryState = INITIAL;
  #hover: HoverState = INITIAL_HOVER;
  #geometryListeners = new Set<() => void>();
  #hoverListeners = new Set<() => void>();

  subscribeGeometry = (l: () => void) => {
    this.#geometryListeners.add(l);
    return () => this.#geometryListeners.delete(l);
  };
  getGeometry = (): GeometryState => this.#geometry;

  setHover = (next: HoverState): void => {
    if (shallowEqual(this.#hover, next)) return; // no-op when unchanged
    this.#hover = next;
    this.#hoverListeners.forEach(l => l());
  };
  // ...
}
```

```tsx
// ✅ Each slice has its own subscribe hook.
export function useMinimapHover(): HoverState {
  const store = useMinimapStore();
  return useSyncExternalStore(store.subscribeHover, store.getHover);
}
```

**Reference implementation:**

- `src/components/primitives/viewport/ViewportStore.ts` — full store with
  geometry / panning / marquee / per-layer-invalidation slices.
- `src/components/primitives/viewport/ViewportContext.ts` — context wraps
  store instance; `useViewportContext` returns the full snapshot,
  `useViewportStore` is the slice-subscribe escape hatch.
- `src/components/primitives/viewport/Viewport.tsx:128` — store created
  per-instance via `useMemo`, mirrored from React state via `useLayoutEffect`.

### Rule of thumb

If a piece of state is going to be written from a pointer-move, animation
frame, or any non-React event handler — it lives in a store, not in
`useState`. React state is for things that should cause re-renders.

---

## 5. Refs in React 19: `ref` as a prop + `useImperativeHandle`

React 19 lets you pass `ref` as a regular prop without `forwardRef`. Use it.
Never write `React.FC<Props>` if the component needs ref support — the type
doesn't carry it. Use an explicit function signature.

### When ref points to a DOM element

For low-level, single-element primitives (Button, Input, Card-root), the
`ref` should land on the actual DOM element via `useMergedRef`.

```tsx
// ✅
export const Card = ({ ref, ...rest }: CardProps): React.ReactElement => {
  return <div ref={ref} {...rest} />;
};
```

**Reference:** `src/components/layout/Card/Card.tsx:65,83`.

### When ref exposes an imperative handle

For higher-level components with internal state (Viewport, Minimap,
SplitPane), the `ref` exposes a typed handle, not the DOM. Use
`useImperativeHandle`.

```tsx
// ✅ Type-safe imperative API.
export interface MinimapHandle {
  focus(): void;
  getElement(): HTMLDivElement | null;
  worldToMinimap(p: Point2D): Point2D;
}

export const Minimap = ({ ref, ...rest }: MinimapProps): React.ReactElement => {
  const bodyRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    focus: () => bodyRef.current?.focus(),
    getElement: () => bodyRef.current,
    worldToMinimap: p => /* ... */,
  }), [/* deps */]);
  return <div ref={bodyRef} {...rest} />;
};
```

**Reference:** `src/components/primitives/viewport/Viewport.tsx:97,122,187`.

### Anti-example

```tsx
// ❌ React.FC doesn't carry ref; if the props type happens to include `ref`,
//   it silently lands in `...rest` and is spread onto whatever element
//   comes first. Result: ref points to the wrong node (or fails silently).
export const Minimap: React.FC<MinimapProps> = ({ ...rest }) => (
  <div {...rest}>...</div>
);
```

### Props type contract

If you extend `BaseComponent<T>`, **`Omit` `ref`** from the inherited type
when you're exposing a handle:

```ts
export interface MinimapBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'ref' | 'onChange'
> {
  ref?: React.Ref<MinimapHandle>;
  // ...
}
```

Otherwise TypeScript will accept `ref={divRef}` even though you're handing
back a `MinimapHandle`.

---

## 6. Compound components: Symbol slot markers, not `displayName`

Compound APIs (`<Card.Header>`, `<Minimap.Title>`) often need the parent
to pick a specific child out of `children`. **Do not** match on
`displayName` — it's a string, can collide, and is stripped by minifiers,
`React.memo`, and most HOC wrappers.

### Anti-example

```ts
// ❌ Fragile string match on a debug-only field.
function getSlotKind(el: React.ReactElement): SlotKind | null {
  const name = (el.type as { displayName?: string })?.displayName;
  if (name === 'Minimap.Title') return 'title';
  if (name === 'Minimap.Footer') return 'footer';
  return null;
}
```

### Correct

```ts
// ✅ Unique Symbol attached to the component identity.
export const MINIMAP_SLOT: unique symbol = Symbol.for('etui.minimap.slot');
export type MinimapSlotKind = 'title' | 'footer' | 'corner';

interface SlotMarker {
  [MINIMAP_SLOT]: MinimapSlotKind;
}

export const MinimapTitle = (_: MinimapTitleProps): null => null;
(MinimapTitle as unknown as SlotMarker)[MINIMAP_SLOT] = 'title';

function getSlotKind(el: React.ReactElement): MinimapSlotKind | null {
  return (el.type as Partial<SlotMarker>)[MINIMAP_SLOT] ?? null;
}
```

The Symbol survives `React.memo`, function wrapping (as long as the marker
is copied), and minification. It also fails loudly in dev when missing —
add a `console.warn` when an element looks like a slot (e.g. `displayName`
starts with `'Minimap.'`) but lacks the marker.

### When to use slots vs. explicit props

Use slot children when:

- The compound API is the public design (Card, Drawer, Accordion).
- Order between slots in the tree doesn't matter.

Use explicit props (`title=`, `footer=`, `corners={{...}}`) when:

- There are < 4 slots total.
- TypeScript-level slot validation matters more than ergonomics.

---

## 7. Canvas drawing: a single template

All canvas-based components in this library follow one template. New ones
must follow it. Departures cause bugs (theme staleness, flicker, redraw
storms).

### Template

```tsx
// ✅ The full pattern. Adapt names; do not change the structure.
const canvasRef = useRef<HTMLCanvasElement>(null);
const rafRef = useRef<number>(0);

// 1. Function props as refs — consumer inline functions don't invalidate.
const drawRef = useLatest(draw);
const pausedRef = useLatest(paused);

// 2. Single scheduleDraw function, stable identity.
const scheduleDraw = useCallback(() => {
  cancelAnimationFrame(rafRef.current);
  rafRef.current = requestAnimationFrame(() => {
    const canvas = canvasRef.current;
    if (!canvas || pausedRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 3. DPR scaling at the top of every draw.
    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const targetW = Math.max(1, Math.round(size.width * dpr));
    const targetH = Math.max(1, Math.round(size.height * dpr));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 4. Resolve theme colors INSIDE the frame — never cache in useState.
    const theme = resolveCanvasTheme(canvas);

    // 5. Hand off to a pure drawing function.
    drawRef.current(ctx, { size, theme /* ... */ });
  });
}, [size, drawRef, pausedRef]);

// 6. useLayoutEffect for first paint + every dependency change.
useLayoutEffect(() => {
  scheduleDraw();
  return () => cancelAnimationFrame(rafRef.current);
}, [scheduleDraw]);

// 7. Listen for DPR changes (window dragged to a different display).
useEffect(() => {
  if (typeof window === 'undefined') return;
  const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
  const handler = (): void => scheduleDraw();
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}, [scheduleDraw]);
```

**Reference implementations:**

- `src/components/primitives/viewport/ViewportLayer.tsx` — the canonical
  template above came from here.
- `src/components/controls/CurveEditor/useCurveRenderer.ts`.
- `src/components/controls/CartesianPicker/useCartesianRenderer.ts`.

### Rules

- **Never** store resolved theme colors in `useState`. They go stale on
  theme switch and add a render cycle. Resolve them inside the draw frame
  via `resolveCanvasTheme(canvas)` / `resolveVarValue(canvas, varRef)`.
- **Never** call `drawX(...)` directly from a `useEffect` without RAF —
  multiple prop changes in the same render trigger multiple draws.
- **Always** use `useLayoutEffect` (not `useEffect`) for the draw-trigger
  effect, otherwise the first frame paints blank.
- **Always** clean up the RAF in the effect return.

---

## 8. `'use client'` discipline

The library is consumed by RSC-enabled frameworks (Next.js App Router,
Astro). The `'use client'` directive at the top of a file marks it as a
client boundary.

### Add `'use client'` when the file:

- Uses any React hook (`useState`, `useEffect`, `useRef`, `useContext`,
  `useSyncExternalStore`, custom hooks).
- Reads from browser-only globals (`window`, `document`, `navigator`).
- Attaches event handlers that need a browser runtime.

### Do **not** add `'use client'` when the file:

- Is a pure type module (`*.types.ts`).
- Exports only pure functions or constants (`utils.ts`, `*.css.ts`).
- Is a slot-marker component that returns `null` and holds no state.
- Is a pure drawing utility (e.g. `minimapDrawing.ts`, `viewportMath.ts`).

Slot-marker components are a common mistake: they look like components but
they're identity tokens that never render. They don't need `'use client'`.

```tsx
// ❌ 'use client' on a marker that returns null
'use client';
export const MinimapTitle = (_: MinimapTitleProps): null => null;

// ✅ Pure marker, no directive
export const MinimapTitle = (_: MinimapTitleProps): null => null;
(MinimapTitle as SlotMarker)[MINIMAP_SLOT] = 'title';
```

---

## 9. Avoid `React.FC` for new components

`React.FC` predates React 19 and doesn't carry `ref` in its prop type. Use
an explicit function signature with a typed return value.

```tsx
// ❌
export const Minimap: React.FC<MinimapProps> = ({ ... }) => { ... };

// ✅
export const Minimap = ({ ... }: MinimapProps): React.ReactElement => { ... };
Minimap.displayName = 'Minimap';
```

`displayName` is still useful for React DevTools — keep it. Just don't
rely on it for runtime logic (rule #6).

**Reference:** `src/components/primitives/viewport/Viewport.tsx:97`.

---

## 10. React 19 features — what to use

| Feature                                              | Use it for                                                         | Skip when                               |
| ---------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------- |
| `ref` as a prop                                      | All new components (rule #5).                                      | Never — always use.                     |
| `useImperativeHandle`                                | Higher-level primitives with handle APIs.                          | Single-element wrappers.                |
| `use(context)`                                       | Conditional context reads, reads inside server components.         | Top-level reads — `useContext` is fine. |
| `useTransition`                                      | Non-urgent state updates (hover, search filtering, tab switching). | Synchronous, user-driven actions.       |
| `useDeferredValue`                                   | Heavy derived computations that lag behind props.                  | Cheap derivations.                      |
| `useFormStatus` / `useActionState` / `useOptimistic` | Form components, mutations.                                        | UI primitives without form semantics.   |
| Server Components                                    | N/A — this is a client component library.                          | —                                       |

When a hover/animation state update would cascade into expensive renders,
wrap the setter in `startTransition`:

```ts
const [, startTransition] = useTransition();

const handlePointerMove = (e: PointerEvent) => {
  // ... compute next hover
  startTransition(() => {
    store.setHover({ hoverWorldPoint, hoveredItemId });
  });
};
```

---

## 11. Hooks own callback signatures, not their attachment

A custom hook that takes a callback must internalize the consumer's
inline-function reality. Wrap the callback in `useLatest` **inside** the
hook. Never put it in the consumer's dependency arrays.

```ts
// ✅ Consumer never has to memoize.
export function useMyObserver(
  target: RefObject<Element>,
  cb: (e: Entry) => void
) {
  const cbRef = useLatest(cb);
  useEffect(() => {
    const obs = new SomeObserver(entries =>
      entries.forEach(e => cbRef.current(e))
    );
    if (target.current) obs.observe(target.current);
    return () => obs.disconnect();
  }, [target, cbRef]);
}
```

```ts
// ❌ Forces every consumer to memoize, or the observer re-attaches.
export function useMyObserver(
  target: RefObject<Element>,
  cb: (e: Entry) => void
) {
  useEffect(() => {
    const obs = new SomeObserver(entries => entries.forEach(cb));
    if (target.current) obs.observe(target.current);
    return () => obs.disconnect();
  }, [target, cb]); // cb identity invalidates the observer
}
```

**Reference:** `src/hooks/useResizeObserver/useResizeObserver.ts:42-48` —
callback stored in a ref, observer never re-subscribes on callback change.

---

## 12. Performance traps to recognize on review

These are the bugs that have actually shipped to this codebase. Spot them:

- **Object literal in `setState` without comparison.**
  `setHover({ x, y })` every pointermove → `Object.is` returns false →
  re-render every frame. Compare with previous value or move the state to
  a store with `shallowEqual` no-op guards (rule #4).
- **Inline `items={[...]}` or `renderOverlay={fn}` as `useEffect` deps.**
  Parent re-renders → effect invalidates → full redraw. Move to `useLatest`
  or document a strict memoization requirement (rule #3).
- **Cached DOM-derived values in `useState`.**
  Goes stale on theme switch, resize, etc. Resolve at the point of use
  (rule #2).
- **Context value containing both stable and live state.**
  One updating field re-renders all subscribers of stable fields. Split or
  use a store (rule #4).
- **`useEffect(() => { setState(derive(props)) }, [props])`.**
  Two-pass render. Replace with `const x = useMemo(() => derive(props), [props])`.

---

## 13. Component review checklist

Before opening a PR for a new component (or major refactor), verify:

- [ ] No `useEffect` exists that could be replaced with an existing hook.
- [ ] No `new ResizeObserver` / `new IntersectionObserver` / `matchMedia`
      outside the hooks layer.
- [ ] No theme colors cached in `useState`.
- [ ] All function props that gate effects are wrapped in `useLatest`.
- [ ] Hot-path state (pointer-move, animation) lives in a store, not in
      `useState` + context.
- [ ] `ref` is either explicitly attached to a DOM element or routed
      through `useImperativeHandle` to a typed handle.
- [ ] Compound child detection uses a Symbol marker, not `displayName`.
- [ ] No `React.FC` in new code.
- [ ] `'use client'` only on files that need it (rule #8).
- [ ] All `useEffect` cleanups are paired with their setups.
- [ ] No object/array literal in `useEffect`/`useMemo` deps without a
      memoization upstream.

---

## 14. ESLint enforces these patterns

Most of the rules above are now enforced by `eslint.config.js` and fail CI, so
the review checklist is mechanically checked. The setup (src files):

- **`eslint-plugin-react-hooks` v7, full `recommended`** (the Compiler-aware
  rule set), all at `error`. The ones you will hit most:
  - **`react-hooks/refs`** — never read or write `ref.current` during render.
    A value you render must be **state**, not a ref. A value you only read
    inside an event handler / effect / timer should be a `useLatest` ref (which
    writes in an effect, never in render). The common smell this caught was a
    `ref + setForceUpdate(n => n + 1)` pair masquerading as state — replace it
    with real `useState`, keeping a ref only if a handler needs a synchronous
    read.
  - **`react-hooks/set-state-in-effect`** — prefer deriving during render, or
    the _adjust-state-during-render_ pattern (a guarded `if (x > max)
setX(max)` in the render body) over a layout/effect that calls `setState`.
    Reserve `setState`-in-effect for genuine external-system sync
    (`matchMedia`, `IntersectionObserver`, reading committed DOM, enter/exit
    animation timing) and annotate it with a one-line
    `// eslint-disable-next-line react-hooks/set-state-in-effect` reason.
  - **`react-hooks/exhaustive-deps`** (also `error`) — stable `useLatest` refs
    must still be listed in dep arrays. Intentional deep-compare keys
    (`JSON.stringify` deps) or memo-busting counters get a justified disable.
- **`typescript-eslint` `strict-type-checked`** — notably
  `no-unnecessary-condition` (delete dead guards, but check first that an
  "always true `x === x`" isn't a typo for a real comparison) and
  `no-deprecated`. `restrict-template-expressions` is tuned with
  `allowNumber: true` so `` `${size}px` `` style strings are fine; booleans,
  nullish, and `any` in templates still fail.
- **`eslint-plugin-import-x`** — `no-cycle` (keep the barrel exports
  acyclic), `order`, `no-duplicates`, `consistent-type-specifier-style`.
- **`@/` alias is enforced** — cross-directory relative imports (`../…`) are a
  lint error; always import via `@/…`.
- **`eslint-plugin-jsx-a11y`** — interactive elements (`onClick` on a
  `div`/`span`, custom `role`) need keyboard handlers, focusability
  (`tabIndex`), and valid ARIA. Mirror every `onClick` with an `onKeyDown`
  (Enter/Space) rather than suppressing the rule.

Test files keep the prior type-checked baseline (not `strict-type-checked`),
and the src-only rules above are not applied to them.

---

## Reference files (the "look at this" list)

When implementing a new pattern, open these first:

| Pattern                                                           | File                                                        |
| ----------------------------------------------------------------- | ----------------------------------------------------------- |
| Store + slice subscriptions                                       | `src/components/primitives/viewport/ViewportStore.ts`       |
| Store consumed via `useSyncExternalStore`                         | `src/components/primitives/viewport/ViewportContext.ts`     |
| Explicit function signature + ref-as-prop + `useImperativeHandle` | `src/components/primitives/viewport/Viewport.tsx`           |
| Canvas draw + RAF + theme resolution per-frame                    | `src/components/primitives/viewport/ViewportLayer.tsx`      |
| Gesture hook with `useLatest` for callbacks and live props        | `src/components/primitives/viewport/useViewportGestures.ts` |
| Resize observation via the hook                                   | `src/components/primitives/viewport/Viewport.tsx:171`       |
| Ref-to-DOM compound (lightweight)                                 | `src/components/layout/Card/Card.tsx`                       |
| Controlled/uncontrolled state bridge                              | `src/hooks/useControlledState/useControlledState.ts`        |

If the pattern you need isn't in this table, ask before inventing one.
