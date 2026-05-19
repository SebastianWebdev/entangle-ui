---
'entangle-ui': minor
---

Drop Storybook from the repository. The Astro Starlight site under
`docs-site/` is now the single source of documentation, demos, and
visual-review surface. Removed `.storybook/`, all 74 `*.stories.tsx` files,
the `@storybook/*` and `eslint-plugin-storybook` dev dependencies, the
`storybook` and `build-storybook` npm scripts, and the
Storybook-specific exclusions from the ESLint, Vitest, and TypeScript
build configs.

The library-internal theme token namespace was also renamed from
`storybook.*` (legacy name from when only stories consumed it) to
`demo.*`, matching its actual usage in the docs-site editor demo. The
namespace is still excluded from the public token export
(`tokens.json` / `tokens.dark.css` / `tokens.light.css`), so external
consumers were never able to reach `--etui-storybook-*` through the
documented surface; nothing publicly documented changes. The matching
CSS custom properties (`--etui-storybook-gradient-*`) are now
`--etui-demo-gradient-*`.

The root `npm run dev` script now proxies to the docs-site Astro dev
server instead of Storybook.
