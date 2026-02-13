---
'entangle-ui': patch
---

Move @vanilla-extract/dynamic and @vanilla-extract/recipes from dependencies to peerDependencies. Mark them as external in Rollup to avoid bundling duplicate runtime code.
