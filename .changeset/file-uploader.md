---
'entangle-ui': minor
---

Add `FileUploader` component (`@/components/controls/FileUploader`). Drag-and-drop file uploader with click-to-browse fallback, MIME type and extension matching via `accept`, `maxSize`/`minSize`/`maxFiles` enforcement with reasoned rejections through `onReject`, custom synchronous `validate`, controlled and uncontrolled item lists, optional single-file mode, and a per-row UI showing file name, size, status badge (`pending` / `uploading` / `done` / `error`), and an animated progress bar. The component is presentational around the file list — the consumer drives the actual upload via `onFilesAdd` and reflects progress back through `value`.
