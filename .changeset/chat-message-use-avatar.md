---
'entangle-ui': patch
---

Internal refactor: `ChatMessage` now renders the new `Avatar` primitive
instead of inline JSX. The visual output (24px circle, initials fallback,
image when available) is unchanged from a consumer's perspective, but the
chat avatar now picks up Avatar's deterministic auto color, image-error
fallback chain, and standard accessible-name handling for free.
