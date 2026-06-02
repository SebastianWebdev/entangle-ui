---
'entangle-ui': patch
---

LogView: align the message text into a fixed gutter. The timestamp, level
icon, and source tag render as fixed-width columns so the message starts at the
same x on every row instead of shifting with the source-tag width — it reads
like a table / terminal log.

A column is only reserved when its field is actually present in the data: if
nothing has a timestamp or source there is no column at all (the message sits
right after the icon, as before), but once at least one entry uses the field
every row reserves it — including rows that omit it — so they stay aligned. The
timestamp and source column widths default to `88px` and `52px` and are
overridable via the `--etui-logview-timestamp-col-width` /
`--etui-logview-source-col-width` CSS custom properties on the root.
