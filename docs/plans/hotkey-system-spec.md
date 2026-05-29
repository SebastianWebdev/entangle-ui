# Hotkey & Scope System — Planning Doc

> Sign-off artifact for the library-wide hotkey/scope architecture. This is
> a cross-cutting concern: it replaces / wraps the current `useHotkey`,
> feeds `MenuBar` and `Menu.Item` shortcut display, integrates with
> `CommandPalette`, and changes how Timeline and other editor components
> declare their keyboard surface. The implementation is a single
> long-running PR touching multiple component folders — this doc is the
> source of truth for the API and the v1 scope agreed in the planning
> session. Where reality diverges from this doc during the build, update
> the doc in the same commit.
>
> Status: **planning — no implementation yet.** The decisions log below
> is empty pending sign-off.

## Decisions log (planning session)

| #   | Decision                                       | Choice |
| --- | ---------------------------------------------- | ------ |
| 1   | Architecture (A / B / C / D)                   | TBD    |
| 2   | What "view" means in target apps               | TBD    |
| 3   | Hover-based scope (Blender-style) opt-in?      | TBD    |
| 4   | App-level shortcut override mechanism          | TBD    |
| 5   | Browser-reserved combos — warn or silently OK? | TBD    |
| 6   | User rebind persistence — in lib or out?       | TBD    |
| 7   | Sequence shortcuts (`gg`, `Ctrl+K Ctrl+S`)     | TBD    |
| 8   | v1 scope: which primitives ship now            | TBD    |

## Why now

The library has `useHotkey` (single combo → callback) and ad-hoc keyboard
handling in editor components (Timeline scrub keys, Menu radio nav, etc.).
That works for individual components but does not compose: a host app with
a CommandPalette open over a Timeline cannot say "the palette eats Escape,
but Space still plays in the timeline behind it" without each component
inventing its own focus check. Real editor apps (3D, node, animation)
need this composition pattern as a baseline.

This planning doc captures the analysis of how shipped editors solve the
"who hears the key" problem, the four candidate architectures we
considered, and the open questions that must be answered before
implementation can start.

## How real editors solve "who hears the key"

Seven representative models mapped across the target use-case spectrum:

1. **VSCode** — single global registry (`keybindings.json`), each binding
   has a `when` clause (boolean expression over context flags). Focus
   controls the flags. Last-registered wins. Expression engine under
   the hood.
2. **Blender** — hover-based, per-editor. Key goes to the editor under
   the cursor, not the focused element. Workspace + mode + editor +
   tool + selection compose the lookup key. Hyper-efficient for power
   users; not a web convention.
3. **Premiere Pro** — panel focus, visually indicated. Most shortcuts
   are panel-scoped. Transport (J/K/L, Space) and saves are global.
   Workspace switching changes layout, not keymap.
4. **After Effects** — like Premiere, plus tool-aware mouse behavior.
5. **Photoshop** — tool-based: active tool (Brush, Lasso) interprets
   modifiers and bracket keys. No "focused panel" model.
6. **Figma / web editors** — DOM focus for most, tool for spatial
   actions, modals suspend underlying.
7. **Houdini / Substance Designer** — per-network scopes, pinning to
   freeze a network's scope, context-sensitive menus (`Tab`).

## Mental model — the 3-4 primitives

Every shipped editor composes the same four primitives:

| Primitive            | What it is                      | Example                                       |
| -------------------- | ------------------------------- | --------------------------------------------- |
| **Workspace / View** | Top-level mode of the whole app | Blender workspace, Premiere layout, app route |
| **Panel / Editor**   | Region within a view            | Timeline, Viewport, Outliner                  |
| **Tool / Mode**      | Active sub-mode within a panel  | Edit/Object mode, Razor tool                  |
| **Modal / Overlay**  | Suspends everything beneath it  | Command palette, dialog, brush settings popup |

The **active scope** at any moment is a chain through these primitives:
`(workspace) → (panel) → (tool?) ± (modal if open)`. On keydown, the
event walks the chain from most-specific to least-specific until something
matches. This is the abstract pattern the library has to model — the
question is what API surface to expose.

## Required primitives (must-have in any approach)

Independent of which architecture wins, these capabilities are
non-negotiable:

1. **Registry** of hotkey definitions: `[{ id, keys, scope, run, enabled, label, category }]`.
2. **Scope tree** with parent/child relations; scopes can be active or inactive.
3. **Activation rule** per scope: focus-within / hover / explicit prop / always.
4. **Single keydown listener** at the root (window or provider element) that matches against the active chain.
5. **Disambiguation**: when two scopes in the active chain bind the same combo, **innermost wins**.
6. **Modal / exclusive override**: a scope can block ancestors from receiving anything.
7. **Editable-element guard**: by default, do not fire inside `<input>` / `<textarea>` / `[contenteditable]`. Opt-in to override.
8. **Discoverability API**: `useRegisteredHotkeys()` returning the active chain's bindings (with `label`, `category`, `keys`) for cheatsheet, CommandPalette integration, `Menu.Item shortcut={}` auto-display, and `aria-keyshortcuts`.
9. **Cross-platform Mod**: abstraction over `Cmd` on macOS, `Ctrl` elsewhere.

Anything below is **how** to package these, not **whether** to have them.

## Candidate architectures

Four candidates considered. All four satisfy the required primitives.
They differ in mental model presented to the consumer.

### Option A — Hook + named scopes (programmatic)

```tsx
<HotkeysProvider>
  <AppShell>
    <AnimationView />
  </AppShell>
</HotkeysProvider>;

function Timeline() {
  const scopeRef = useHotkeyScope('panel:timeline'); // returns ref
  useHotkey({
    id: 'timeline.play',
    keys: 'Space',
    scope: 'panel:timeline',
    run: togglePlay,
  });
  return <div ref={scopeRef}>...</div>;
}
```

- `useHotkeyScope(name)` returns a ref that, when attached, makes its
  element a scope anchor (writes `data-hotkey-scope` and `tabindex=-1`,
  listens to `focusin` / `focusout`).
- `useHotkey({...})` registers a binding under a named scope.
- The provider tracks `document.activeElement` and walks up to determine
  the active scope chain by reading `data-hotkey-scope` attributes.

**Pros.** Minimal boilerplate. Scope names are plain strings — refactor
with a rename. Idiomatic React. No JSX clutter.

**Cons.** The scope is invisible in the JSX tree (only a `ref={...}`
gives it away). Easy to forget the ref and silently break activation.
Scope names live as strings — typo-prone unless an enum is enforced.

### Option B — Wrapper components + implicit tree (declarative)

```tsx
<HotkeysProvider>
  <AppShell>
    <HotkeyScope name="view:animation">
      <HotkeyScope name="panel:timeline">
        <Hotkey keys="Space" run={togglePlay} label="Play / pause" />
        <Hotkey keys="ArrowLeft" run={() => seek(-1)} />
        <TimelineCanvas />
      </HotkeyScope>
    </HotkeyScope>
  </AppShell>
</HotkeysProvider>
```

- `<HotkeyScope>` renders a `<div tabindex=-1 data-hotkey-scope>`
  (configurable via `as={Fragment}` if no DOM node is wanted, with
  scope ID carried via context only).
- `<Hotkey>` is a null component — registers via `useEffect`, renders
  nothing.
- JSX nesting maps 1:1 to scope hierarchy.

**Pros.** The scope tree is visually readable in the source — git diffs
in PRs become readable, DevTools tree shows everything. No refs to
forget.

**Cons.** Many wrapper components for a busy panel (`<Hotkey>` × N is
verbose). Conditional shortcuts use `<Hotkey enabled={...}>` instead
of a clean `if`. Adds DOM nodes unless the consumer opts into the
fragment form (which then needs a parent ref via the next descendant).

### Option C — Hybrid: Provider + Views (workspace-centric)

```tsx
<HotkeysProvider>
  <AppShell>
    <HotkeyView id="animation">
      <Timeline />
      <Viewport />
    </HotkeyView>
    <HotkeyView id="modeling">
      <Outliner />
      <PropertyEditor />
    </HotkeyView>
  </AppShell>
</HotkeysProvider>;

function Timeline() {
  useHotkey({ id: 'timeline.play', keys: 'Space', run: togglePlay });
  // registers to the nearest HotkeyView, not to the global provider
}
```

- `<HotkeysProvider>` is the root, owns the global registry and
  cross-view shortcuts (`Mod+S`).
- `<HotkeyView id>` is a boundary that owns its own sub-registry.
- **Exactly one `HotkeyView` is active at a time**, determined by the
  app (router, tabs, focus).
- Sub-scopes can nest inside a view (panel level) using either A- or
  B-style primitives.

**Pros.** Very clean mental model — "what I'm showing is what's
listening". Ideal for apps with workspace/mode switching (Blender,
Premiere layouts). Per-view serialization of keymaps falls out for
free.

**Cons.** Two abstraction layers (provider + view) — overkill for an
app with a single view. The semantics of "active" must be defined
clearly (route? focus? explicit prop?). Doesn't natively model the
stack case (modal on top of a view).

### Option D — Scope Router (React-Router-flavor)

```tsx
<ScopeRouter>
  <Scope id="app">
    <Hotkey keys="Mod+S" run={save} />
    <Hotkey keys="Mod+Z" run={undo} />

    <Scope id="view:animation" activeWhen="focus-within">
      <Scope id="panel:timeline">
        <Hotkey keys="Space" run={togglePlay} label="Play / pause" />
        <Hotkey keys="K" run={addKeyframe} label="Add keyframe" />
        <TimelineCanvas />
      </Scope>
      <Scope id="panel:viewport">
        <Hotkey keys="F" run={frameAll} />
        <Viewport />
      </Scope>
    </Scope>
  </Scope>

  {paletteOpen && (
    <OverlayScope id="modal:palette" passthrough={false}>
      <Hotkey keys="Escape" run={closePalette} />
      <CommandPalette />
    </OverlayScope>
  )}
</ScopeRouter>
```

D is **B plus two additions**:

1. **Stack semantics, not just chain.** Beyond the focus chain, the
   router maintains an **overlay stack**. `<OverlayScope>` pushes a
   layer that has dispatch priority. `passthrough={true}` lets
   unmatched events fall through to the chain below. This natively
   models the "command palette over a timeline" case.
2. **Optional data-style API**, mirroring RR's
   `createBrowserRouter([...])`:

```tsx
const router = createScopeRouter([
  {
    id: 'app',
    hotkeys: { 'Mod+S': 'save', 'Mod+Z': 'undo' },
    children: [
      {
        id: 'view:animation',
        children: [
          { id: 'panel:timeline', hotkeys: { Space: 'play', K: 'addKey' } },
          { id: 'panel:viewport', hotkeys: { F: 'frameAll' } },
        ],
      },
    ],
  },
]);

<ScopeRouter
  router={router}
  handlers={{ save, undo, play, addKey, frameAll }}
/>;
```

This second form is what unlocks user-rebind out of the box: the
router is JSON-serializable, can be diffed against user overrides,
and reloaded.

Optional: a **location-source adapter** (default: focus-within; opt-in:
React Router, TanStack Router, Next router) so route changes drive the
scope chain for apps that want deep-linkable keyboard contexts.

**Pros.** Models the stack case cleanly (modal palette). Data API
gives user rebind for free. Scales from 0 to ~100 hotkeys without
restructuring. URL adapter is a power feature for SPAs.

**Cons.** Largest surface area to document, test, maintain. The
stack model needs disciplined push/pop (like `useEffect` cleanup) —
forget to unmount and a ghost scope sticks. Adds a "stack" concept
that not every consumer needs but every consumer's docs have to
explain.

## Trade-off matrix

| Aspect                                   | A                 | B                    | C                   | D                        |
| ---------------------------------------- | ----------------- | -------------------- | ------------------- | ------------------------ |
| Scope visible in JSX tree                | ❌ (ref only)     | ✅                   | ✅ (view level)     | ✅                       |
| Overlay / modal as first-class           | ❌                | ❌ (exclusive)       | ❌ (exclusive)      | ✅ (`<OverlayScope>`)    |
| Stack semantics (layers above the chain) | ❌                | ❌                   | ❌ (single active)  | ✅                       |
| Multi-active siblings (timeline + props) | ✅ (via focus)    | ✅ (via focus)       | ❌ (single view)    | ✅                       |
| Data-style alternative API               | ❌                | ❌                   | ❌                  | ✅                       |
| URL deep-linkable scope chain            | ❌                | ❌                   | partial             | ✅ (opt-in adapter)      |
| Programmatic enter/exit (vim modes)      | ❌ (workaround)   | ❌                   | via routing         | ✅                       |
| Boilerplate per consumer panel           | ~5 LOC            | ~15 LOC              | ~5 LOC              | ~10 LOC                  |
| Boilerplate at app root                  | 1 provider        | provider + nest      | provider + view     | router + scope           |
| Cross-view shortcut (Save)               | `scope: 'global'` | global wrapper       | provider-level      | top scope                |
| View switching                           | manual            | manual               | automatic           | depends on adapter       |
| Discoverability (cheatsheet)             | single registry   | single registry      | per-view registry   | router state             |
| Single keydown listener                  | ✅                | ✅                   | ✅                  | ✅                       |
| Performance footprint                    | O(N) per key      | O(N) per key         | O(N/view) per key   | O(stack + chain) per key |
| Internal complexity                      | medium            | low                  | higher              | highest                  |
| DX for a newcomer                        | "ref where?"      | "everything visible" | "what's a view?"    | "stack + chain"          |
| DX for a power app                       | OK                | OK                   | best for workspaces | best overall             |
| SSR-safe                                 | ✅                | ✅                   | ✅                  | ✅                       |
| TS-discoverable scope IDs                | needs enum        | needs enum           | per-view enum       | per-router type          |

## Observations

Three things crystallized while writing the comparison.

### "Manager per view" is C, but the meaning of _view_ is ambiguous

"View" can mean three different things in our target apps:

1. **Route-level page** (`/animation` vs `/modeling`).
2. **Workspace tab** inside the same app shell.
3. **Docked panel** in the same layout.

C maps cleanly to (1) and (2). For (3), per-panel scoping (A or B
primitives) is the right level. The library cannot pick one for the
consumer — but the API has to make the consumer's choice cheap. This
is the single biggest open question (see #2 below).

### A vs B is mostly a DX trade-off, not a functional one

A and B are semantically equivalent — both implement the same chain
dispatch. The difference is **where the consumer's typo lives**:

- In A, the failure mode is "I forgot the ref → no shortcut fires".
- In B, the failure mode is "the `<Hotkey>` is too deeply nested → I
  can't find it in code review".

Library choice between A and B is taste / convention, not capability.

### `useRegisteredHotkeys()` is the highest-leverage cross-cutting feature

Independent of A/B/C/D, exposing the registry as a queryable list
unlocks:

- `<HotkeysCheatSheet>` (auto-help overlay).
- `<Menu.Item shortcut={...}>` auto-fill from registry (no hardcoded
  strings).
- `CommandPalette` integration: list + run by id.
- `aria-keyshortcuts` on scope-owning elements.
- DevTools / debugging panel.

This is a **must-have** and has the same implementation regardless of
which architecture wins. It should be planned in v1.

## Open questions to resolve (sign-off prerequisites)

These six must be answered before architecture sign-off. Each maps to
a row in the decisions log.

1. **What is "view" in our target consumer apps?** Without a concrete
   reference app (or two), choosing C vs A/B/D is a guess. Proposed
   test: write the keyboard surface of `AnimationEditorDemo` (in
   `docs-site/`) as pseudocode under each of A/B/C/D and compare
   ergonomics from the consumer's perspective.
2. **Hover-based scope (Blender-style)** — opt-in for power-user apps,
   or rejected because "the web doesn't do that"? If opt-in, it's a
   one-line policy on `<Scope activeWhen="hover">` and ships in v1.
3. **App-level override.** Does the consumer need to disable
   `timeline.play` without knowing its ID? Choices:
   (a) per-component prop `<Timeline shortcuts={{ play: false }}>`;
   (b) registry call `disableHotkey('timeline.play')`;
   (c) full rebind via data API. They are not mutually exclusive.
4. **Native browser conflicts.** Should the library emit a dev-warning
   when a consumer binds `Cmd+R`, `Cmd+T`, `Cmd+W`, `F5`, etc.? A
   "browser-reserved" list is small and platform-keyed.
5. **User-rebind persistence.** Is this in scope for v1 of the
   hotkey system, or does the consumer handle storage entirely? D
   makes this trivial (data API → JSON). A/B/C require an extra
   serialization layer to support it.
6. **Sequence shortcuts** (`gg`, `Ctrl+K Ctrl+S`). In v1 scope or
   deferred? D models them naturally as transient pushed scopes; A/B/C
   need a separate sequence buffer.

## Cross-library impact

This is **not** a single-component PR. The hotkey system touches:

| Area                               | What changes                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `hooks/useHotkey`                  | Reimplemented on top of the new registry. Existing call sites keep working.   |
| `MenuBar` / `Menu.Item`            | `shortcut` prop can pull from registry by ID (in addition to literal string). |
| `CommandPalette`                   | Source items from registry (label + keys + run) when given a scope filter.    |
| `Kbd` primitive                    | Optional `hotkey` prop for direct binding to a registry entry.                |
| `Tooltip`                          | If a target has a registered hotkey, display its combo in the tooltip.        |
| Timeline                           | Replace local keydown handlers with registry-backed scope.                    |
| `CurveEditor`, NumberInput, Slider | Same — declare their keyboard surface in the scope tree.                      |
| `AnimationEditorDemo`              | Reference consumer — first to migrate, validates DX.                          |
| `docs-site/`                       | New MDX page: `guides/hotkey-system.mdx` + per-component shortcut docs.       |

Migration is **additive**: the new registry coexists with the current
`useHotkey` until consumers (internal and external) port over.

## Suggested process

1. **Reference-app test.** Pseudocode the `AnimationEditorDemo`
   keyboard surface under each of A/B/C/D. Decide architecture from
   the cheapest test we have. Output: A/B/C/D selected, recorded in
   decisions log row 1.
2. **Resolve the 6 open questions** above and fill the decisions log.
3. **Define v1 scope.** Which of: sequence shortcuts, hover scope,
   rebind persistence, URL adapter (if D wins) ship in v1 vs v1.1.
4. **Implementation PR.** Single long-running PR against `main`,
   broken into review-friendly commits:
   - (a) core registry + provider + scope primitives,
   - (b) `useHotkey` reimplemented on top, all existing call sites pass,
   - (c) Menu / CommandPalette / Kbd / Tooltip integration,
   - (d) Timeline migration,
   - (e) docs page + per-component docs updates,
   - (f) changeset (minor — new public API, no removals).

## Out of scope

The following are explicitly out of scope for the v1 hotkey system,
parked for later:

- IME composition handling beyond the default `isComposing` guard.
- Mouse gesture / chord recognition (drag patterns).
- Recording / playback of keyboard macros.
- Conflict resolution UI in the library (Settings → Keyboard panel) —
  consumer concern; library only exposes the registry.
- Localization of combo display strings beyond Cmd ↔ Ctrl.

## Appendix — reference editors at a glance

| Editor        | Model                | Disambiguation key        | Modal handling        |
| ------------- | -------------------- | ------------------------- | --------------------- |
| VSCode        | Focus + when-clauses | `when` expression         | Quick Pick suspends   |
| Blender       | Hover + mode + tool  | (workspace, mode, editor) | Operator popup        |
| Premiere      | Panel focus          | Active panel              | Modal blocks panels   |
| After Effects | Panel focus + tool   | Active panel + tool       | Modal blocks panels   |
| Photoshop     | Tool-based           | Active tool               | Modal blocks tool     |
| Figma         | Focus + tool + modal | DOM focus chain           | Modal scope exclusive |
| Houdini       | Per-network          | Network under cursor      | Pinning freezes scope |
