---
---

ci(docs): version the documentation site. Each release now publishes the latest
docs at the site root and an immutable snapshot under /vMAJOR.MINOR/, accumulated
on a `docs-versions` branch, with a runtime version switcher in the header.

Infrastructure-only change — no effect on the published `entangle-ui` package.
