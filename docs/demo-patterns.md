# Demo Patterns

Rules for writing docs-site demos in `docs-site/src/components/demos/`.
These are not suggestions — they are how every demo in this repo must
be written. Existing code that violates them is a bug.

Demos are not "marketing pages." They serve three jobs at once:

1. **Live examples** for the docs site.
2. **Integration tests** — they're where component composition friction
   surfaces. If a demo needs to reinvent something the library already
   provides, the library has a missing export or a wrong default. The
   demo is the canary, not the patch site.
3. **API friction reports for pre-1.0** — if a demo can't be written
   cleanly with the public API, raise a PR on the library, not on the
   demo. Versions before 1.0 may break APIs to keep demos honest.

The pattern this document exists to stop:

> Agent opens a demo file, sees a complex UI to build, writes 200 lines
> of inline `<div style={{...}}>` chrome — and the entire thing was
> already exported as `<Component.Subpart>` from the library.

If you only read one section, read §1 and §2.

---

## 1. Reach for library compounds before writing JSX

Before you write a `<div style={{...}}>` in a demo, scan the
component's `index.ts` for compound parts. Most editor-grade primitives
(NodeGraph, Viewport, Minimap, etc.) ship a family of subcomponents
that already solve layout, theming, and event wiring.

### Anti-example (real regression we shipped)

A node body inside `renderNode` was written like this:

```tsx
// ❌ Reinvents the library's NodeBody / NodeHeader / PinList from scratch.
function BlueprintNodeBody({ node, ctx }) {
  return (
    <div
      style={{
        width: 220,
        background: 'linear-gradient(...)',
        border: ctx.selected ? '2px solid ...' : '1px solid ...',
        boxShadow: ctx.selected ? '...' : '...',
        // ...60 more lines of hand-rolled chrome
      }}
    >
      <div style={{ height: 28, background: gradient, ... }}>
        {/* hand-rolled header */}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', ... }}>
        {/* hand-rolled pin grid */}
      </div>
    </div>
  );
}
```

Every chunk above already exists as a library compound:

```tsx
// ✅ Same UI, library-provided chrome + auto-themed selection state.
function BlueprintNodeBody({ node }) {
  return (
    <NodeGraph.NodeBody accent={theme.accent} style={{ width: 220 }}>
      <NodeGraph.NodeHeader
        background={theme.gradient}
        icon={theme.icon}
        title={blueprint.title}
        subtitle={blueprint.subtitle}
      />
      <NodeGraph.PinList columnGap={16}>
        {pins.map(pin => (
          <PinRow key={pin.id} pin={pin} />
        ))}
      </NodeGraph.PinList>
    </NodeGraph.NodeBody>
  );
}
```

`NodeGraph.NodeBody` reads selection / hover from the store internally
— the demo doesn't need to thread state through `ctx`.

### Checklist before writing demo JSX

1. Open `src/components/<category>/<Component>/index.ts`. Note every
   named export — compound parts, hooks, types.
2. Open the compound-export block at the bottom of `<Component>.tsx`
   (e.g. `NodeGraphWithSlots.NodeBody = NodeGraphNodeBody`). That's
   the list of slots consumers should use.
3. For auxiliary UI inside the demo — menus, popovers, tooltips,
   buttons, inputs — check `src/components/navigation/`,
   `src/components/feedback/`, `src/components/primitives/`,
   `src/components/controls/` before hand-rolling.

If you can't find a compound for something the demo needs, that's a
library gap — surface it, don't paper over it with inline CSS.

---

## 2. Use library primitives for auxiliary UI

Demos often need menus, popovers, inputs, buttons, color pickers.
**Never** roll these from scratch. Every common pattern has a
primitive:

| Need             | Use                                                  | Don't write                                           |
| ---------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Right-click menu | `<ContextMenu config={resolver}>`                    | `<div onContextMenu>` + handcrafted floating popup    |
| Dropdown menu    | `<Menu config={...}><Trigger /></Menu>`              | `<button>` + `useState<boolean>` + positioned `<div>` |
| Popover          | `<Popover>` + `PopoverTrigger` + `PopoverContent`    | Hand-rolled portal + floating-ui call                 |
| Tooltip          | `<Tooltip>`                                          | `title` attribute + ad-hoc positioned div             |
| Click outside    | `useClickOutside(ref, cb, { event: 'pointerdown' })` | Document-level listener inline in component           |
| Color picker     | `<ColorPicker>`                                      | HTML `<input type="color">` or custom hex picker      |
| Command palette  | `<CommandPalette>`                                   | Search input + `useState<string>` + filter loop       |
| Button           | `<Button variant="..." size="...">`                  | `<button style={{ ... }}>`                            |
| Input            | `<Input size="...">`                                 | `<input style={{ ... }}>`                             |

### Anti-example: hand-rolled context menu

```tsx
// ❌ ~120 lines of MenuShell / MenuButton / positioning / click-outside,
//   plus inline-styled hover states and broken token names that render
//   the panel transparent in some themes.
function NodeContextMenu({ point, target, onClose }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);
  return (
    <div ref={ref} style={{ position: 'absolute', left: point.x, ... }}>
      {/* hand-rolled buttons, hand-rolled hover, hand-rolled gradient... */}
    </div>
  );
}
```

### Correct

```tsx
// ✅ Library handles positioning, focus, Esc, dismissal, submenus.
<ContextMenu config={buildMenuConfig}>
  <NodeGraph ...>...</NodeGraph>
</ContextMenu>
```

`buildMenuConfig` returns a `MenuConfig` — a data structure, not JSX.
Focus management, keyboard nav, click-outside, submenu hover triggers,
themed chrome — all owned by the library.

**Reference:** `docs-site/src/components/demos/editor/NodeGraphDemo.tsx`.

---

## 3. Use theme tokens by their **real** names

CSS custom-property names live in `src/theme/themeContractData.ts` and
are part of the **public API** — but they don't always mirror the JS
object path you'd expect:

| Object path                       | CSS variable                  |
| --------------------------------- | ----------------------------- |
| `vars.colors.background.elevated` | `--etui-color-bg-elevated`    |
| `vars.colors.background.tertiary` | `--etui-color-bg-tertiary`    |
| `vars.colors.text.primary`        | `--etui-color-text-primary`   |
| `vars.colors.accent.primary`      | `--etui-color-accent-primary` |
| `vars.colors.surface.hover`       | `--etui-color-surface-hover`  |

Note: `background.elevated` → `bg-elevated`, **not**
`background-elevated`. When in doubt, grep `themeContractData.ts` for
the path you want.

A "transparent component" in a demo almost always means a wrong token
name — the CSS var resolves to nothing, `background` falls back to
`initial`, and you get an invisible panel that breaks click-outside
because its rectangle is still there.

Demos should also include a literal-colour fallback so the visual
holds up outside a themed provider:

```tsx
// ✅ Falls back to a visible solid when no theme is applied.
background: 'var(--etui-color-bg-elevated, #20222a)';
```

---

## 4. Demos drive pre-1.0 API decisions

If a demo lands and you find yourself doing any of these, **stop and
fix the library first**:

- Importing from a deep path like
  `@/components/.../internal-file` — the library has a missing public
  export. Add it to `index.ts`.
- Hand-rolling a Symbol-marker / compound slot that the library should
  ship — file a PR to add the compound.
- Doing DOM walking inside `renderNode` to compute coordinates that the
  library should expose — add a hook / context value.
- Adding an event-handler prop the library should accept — extend the
  props type.
- Patching a CSS-var-name mismatch with inline styles — fix the
  contract entry, not the consumer.

Until 1.0, the library API is mutable. Demos are the consumer that
drives it. Surface friction at PR time; don't bake workarounds into
demos.

---

## 5. Demo file structure

```
docs-site/src/components/demos/<category>/<Demo>.tsx     ← the demo
docs-site/src/content/docs/components/<category>/<n>.mdx ← MDX page
```

The MDX page imports the demo and embeds it via `<DemoWrapper>`. The
demo file:

- Uses `import { ... } from '@/components/...'` (alias to the library
  source, not the published package — so demos always exercise the
  current branch's API).
- Renders one or more compositions that exercise the **public** API
  surface — every demo should use multiple compound parts so it
  doubles as an integration test for component composition.
- Has a counter / status footer (`{nodes.length} nodes · ...`) when
  state size is interesting — surfaces regressions during manual
  testing.
- Documents keyboard / mouse shortcuts in a help row below the demo
  so the reader can drive the demo without reading the source.

---

## 6. Review checklist for a new or edited demo

Before opening a PR:

- [ ] Every chunk of UI inside the demo uses a library compound where
      one exists. No `<div>` recreates a primitive the library ships.
- [ ] All `var(--etui-...)` names match `themeContractData.ts`. Each
      var has a sensible literal fallback for unthemed contexts.
- [ ] Auxiliary menus / popovers / tooltips use `<ContextMenu>` /
      `<Menu>` / `<Popover>` / `<Tooltip>` — not hand-rolled.
- [ ] Buttons and inputs are `<Button>` / `<Input>` — not raw
      `<button>` / `<input>` with inline styles.
- [ ] Demo runs in the docs-site dev server without console errors.
- [ ] `npm run type-check` passes for `docs-site` too (run `cd
docs-site && npx tsc --noEmit`).
- [ ] If the demo dropped a library compound to look right, you also
      filed a library PR for the missing affordance — don't ship a
      workaround.

---

## Reference files (the "look at this" list)

| Pattern                                        | File                                                      |
| ---------------------------------------------- | --------------------------------------------------------- |
| Library-compound usage inside `renderNode`     | `docs-site/src/components/demos/editor/NodeGraphDemo.tsx` |
| `<ContextMenu>` + config resolver in a demo    | `docs-site/src/components/demos/editor/NodeGraphDemo.tsx` |
| Compound-export pattern (slot symbols + parts) | `src/components/editor/NodeGraph/NodeGraph.tsx` (footer)  |
| Theme contract token names                     | `src/theme/themeContractData.ts`                          |
| Architectural rules for components themselves  | `docs/component-patterns.md`                              |
