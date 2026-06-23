---
'entangle-ui': patch
---

Fix the install and getting-started documentation across every surface so a new consumer can install and run the package.

The README (shipped on npm), the `docs/` quickstart and theming guides, the docs-site getting-started and theming pages, and the bundled skill all carried a stale install story:

- **Install tag.** `npm install entangle-ui@alpha` resolved to an ancient `0.1.0-alpha.0`; the documented command is now `npm install entangle-ui`.
- **React floor.** The `react`/`react-dom` peer requirement is `>=19.2.0`, not the documented `>=19.1.0`.
- **Peer dependencies.** The docs omitted `@tanstack/react-virtual` and `@vanilla-extract/css`; all peers are now listed with their real version ranges.
- **Theme import.** The documented `entangle-ui/darkTheme.css` and side-effect `entangle-ui/theme` imports did not register the `--etui-*` variables. Everything now uses the canonical `import 'entangle-ui/styles.css'`, and the default-theme examples no longer imply a `ThemeProvider` wrapper is required.

Documentation only — no runtime or API change.
