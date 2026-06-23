---
'entangle-ui': patch
---

Fix `entangle-ui/styles.css` being tree-shaken out of production builds.

The `./styles.css` export resolved to `dist/esm/styles.js` — a JS shim whose
only job is to `import` the dark-theme tokens + global-scrollbar stylesheets for
their side effects. But the package's `sideEffects` allowlist only matches
`*.css`, `*.css.ts`, and `*.css.js`, so a plain `styles.js` (which exports
nothing) was flagged side-effect-free and dropped by production bundlers. The
canonical `import 'entangle-ui/styles.css'` setup then shipped **zero** `--etui-*`
token definitions: no colours, no fonts, and menu/tooltip popups with no
background or stacking. Dev was unaffected because dev servers don't tree-shake,
so the failure only surfaced in `build`/`preview`.

The stylesheet entry is now emitted as `dist/esm/styles.css.js`, which matches
the existing `*.css.js` side-effect glob (the same bucket as every component's
compiled style module), so the import survives production tree-shaking and the
dark theme lands on `:root` in dev and prod alike. No source or API change is
required in consumer apps.
