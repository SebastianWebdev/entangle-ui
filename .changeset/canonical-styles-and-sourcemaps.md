---
'entangle-ui': minor
---

Add a canonical stylesheet entry and fix published sourcemaps.

**`entangle-ui/styles.css` (new, canonical theme import).** The documented CSS imports (`entangle-ui/styles.css`, `entangle-ui/darkTheme.css`) did not resolve, and the dark theme `:root` variables (`--etui-*`) were not reachable from a normal component import — so a fresh app rendered unstyled. There is now a single canonical entry:

```ts
// once, at your app root
import 'entangle-ui/styles.css';
```

It registers every `--etui-*` token on `:root` (default dark theme) plus the opt-in global-scrollbar rules, so components render correctly **without** a `ThemeProvider` wrapper. Component CSS still ships per component, so the entry stays tiny. A packaging test asserts the `:root` tokens are present.

**Package-relative sourcemaps.** Published `.js.map` files pointed `sources` at an unshipped `node_modules/entangle-ui/src/...` and shipped no `sourcesContent`, producing "source file outside its package" warnings in consumers. Sourcemaps now use package-relative `src/...` paths with embedded `sourcesContent` (`inlineSources` in `tsconfig.build.json` + a `sourcemapPathTransform` in `rollup.config.js`). A regression guard (`scripts/check-sourcemaps.ts`, wired into `prepublishOnly` via `npm run check:sourcemaps`) fails the publish if a sourcemap escapes the package or drops its source content.
