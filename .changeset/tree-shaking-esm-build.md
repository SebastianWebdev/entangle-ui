---
'entangle-ui': minor
---

Switch to fully tree-shakeable ESM build with preserveModules

- Replace monolithic bundle with per-module ESM output (`dist/esm/`)
- Drop CJS output — ESM-only package
- Add `sideEffects: false` and `exports` field to package.json
- Fix externals: add @emotion/react, @emotion/styled, @floating-ui/react, react/jsx-runtime
- Fix wrong external name: @base-ui/react → @base-ui-components/react
- Remove @emotion/react and @emotion/styled from dependencies (keep in peerDependencies only)
- Add `/*#__PURE__*/` annotations for tree-shaking (Object.assign, createContext, React.memo, forwardRef)
- Add `entangle-ui/palettes` deep import entry point
- Add size-limit bundle size guards
- Create tsconfig.build.json (excludes tests/stories from build)
