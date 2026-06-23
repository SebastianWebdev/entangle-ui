---
'entangle-ui': minor
---

Fix browser white-screen caused by a Node build of `picocolors` being inlined into the shipped ESM.

`@vanilla-extract/css` was reachable from the runtime barrel (via `createCustomTheme`) but was **not** a Rollup external, so its entire runtime — including the Node build of `picocolors` (`let p = process || {}` at module init) and `lru-cache` — was inlined into `dist/esm`. Any `entangle-ui` import then crashed with `process is not defined` in the browser (most visibly in `vite dev`, where nothing is tree-shaken).

**What changed:**

- `@vanilla-extract/css` is now a Rollup external, so it is no longer inlined. The consumer's bundler resolves it and honours each dependency's `browser` field, so no Node-only globals reach the browser.
- A regression guard (`scripts/check-browser-safe.ts`, wired into `prepublishOnly` via `npm run check:browser-safe`) fails the publish if any `dist/esm/**/*.js` references a Node-only global (`process`, `require(`) outside the bundler-replaceable `process.env.NODE_ENV` guard.

**Action required (peer dependency):** `@vanilla-extract/css` (`^1.18.0`) is now declared as a `peerDependency`. It is already pulled in transitively by the existing required peers `@vanilla-extract/dynamic` and `@vanilla-extract/recipes`, so npm/yarn users are unaffected; pnpm users (strict resolution) should ensure it is installed.
