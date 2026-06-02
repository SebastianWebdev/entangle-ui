---
'entangle-ui': patch
---

LogView: align the message text into a fixed gutter. The timestamp, level
icon, and source tag now render as fixed-width columns (reserved even on rows
that omit a timestamp or source), so the message starts at the same x on every
row instead of shifting with the source-tag width — it reads like a table /
terminal log. The timestamp and source column widths default to `88px` and
`80px` and are overridable via the `--etui-logview-timestamp-col-width` /
`--etui-logview-source-col-width` CSS custom properties on the root.
