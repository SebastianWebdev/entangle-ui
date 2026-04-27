---
'entangle-ui': minor
---

Ship machine-readable token artifacts alongside the JS bundle. Each release
now publishes `entangle-ui/tokens.json` (a loosely DTCG-aligned export of
both themes), `entangle-ui/tokens.dark.css` (the dark `--etui-*` custom
properties scoped to `:root`), and `entangle-ui/tokens.light.css` (the light
preset scoped to the documented `etui-theme-light` class). Figma plugins,
Style Dictionary pipelines, and projects that don't use Vanilla Extract can
now consume the same values the components compile against. The tree-shaking
guarantees of the main entry point are unchanged — these files are only
loaded by consumers that explicitly import them.
