# FileUploader
> Drag-and-drop file uploader with type and size validation, per-row status, and an animated progress bar.

A drag-and-drop dropzone with a click-to-browse fallback. Enforces MIME / extension matching, file size bounds, and per-file count caps, surfaces a list of files with `pending` / `uploading` / `done` / `error` status and an animated progress bar. The component itself is presentational — the consumer drives the actual upload (fetch, XHR, SDK) and reflects progress back through controlled `value`.

**Live Preview**

## How it works

1. The user drops or selects files. `FileUploader` validates each one against `accept`, `maxSize`, `minSize`, `maxFiles`, and the optional `validate` callback.
2. Accepted files are appended to the items list with `status: 'pending'` and `onFilesAdd` fires with the raw `File` objects.
3. The consumer kicks off the upload externally and updates each item's `status` / `progress` by passing a controlled `value`.
4. Rejected files are reported via `onReject` along with a reason — never silently dropped.

## Import

```tsx
import { FileUploader } from 'entangle-ui';
import type { FileUploaderItem } from 'entangle-ui';
```

## Usage

The simplest usage takes no value at all — the component manages the list internally. Useful for forms where you only need the final list at submit time.

```tsx
<FileUploader
  label="Attachments"
  accept="image/*,.pdf"
  maxSize={5 * 1024 * 1024}
/>
```

For real uploads, control the list:

```tsx
const [items, setItems] = useState<FileUploaderItem[]>([]);

<FileUploader
  value={items}
  onChange={setItems}
  onFilesAdd={files => uploadAll(files, setItems)}
  accept="image/*,.pdf"
  maxSize={5 * 1024 * 1024}
/>;
```

## Single file mode

`multiple={false}` switches to single-file mode — selecting a new file replaces the previous one.

**Single file**

```tsx
<FileUploader
  label="Avatar"
  accept="image/*"
  multiple={false}
  maxSize={2 * 1024 * 1024}
/>
```

## Sizes

**Sizes**

```tsx
<FileUploader size="sm" />
<FileUploader size="md" />
<FileUploader size="lg" />
```

## With simulated upload

A realistic end-to-end demo: drop a file, watch its row progress to `done`. Rejections surface below the dropzone.

**Simulated upload**

```tsx
const [items, setItems] = useState<FileUploaderItem[]>([]);

<FileUploader
  accept=".pdf,.docx,image/*"
  maxFiles={5}
  maxSize={10 * 1024 * 1024}
  value={items}
  onChange={setItems}
  onReject={(file, reason) => toast.error(`${file.name}: ${reason}`)}
  onFilesAdd={files => {
    // Kick off the upload for each just-added file
    files.forEach(file => startUpload(file, setItems));
  }}
/>;
```

The per-row UI shows the file name, formatted size, status badge, and animated progress bar — all driven from the `FileUploaderItem` shape:

```ts
interface FileUploaderItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress?: number; // 0–100
  errorMessage?: string;
}
```

## Validation

Built-in checks for type, size, and count are available via the matching props. For anything beyond that, pass a synchronous `validate` callback — return `false` to reject silently, or a string to use as the rejection reason.

**Validation**

```tsx
<FileUploader
  accept="image/*"
  maxSize={1 * 1024 * 1024}
  validate={file => {
    if (file.name.startsWith('.')) return 'no-dotfiles';
    return true;
  }}
  onReject={(file, reason) => console.warn(file.name, reason)}
/>
```

| Reason         | When                                                               |
| -------------- | ------------------------------------------------------------------ |
| `'wrong-type'` | File MIME or extension does not match `accept`.                    |
| `'too-large'`  | `file.size > maxSize`.                                             |
| `'too-small'`  | `file.size < minSize`.                                             |
| `'max-files'`  | The list already holds `maxFiles` items.                           |
| `'invalid'`    | The `validate` callback returned `false`.                          |
| _custom_       | The string returned from a `validate` callback is forwarded as-is. |

## Error state

When you need to surface a form-level error (e.g. the server rejected the batch), use the `error` / `errorMessage` props.

**Error**

```tsx
<FileUploader
  label="Upload"
  error
  errorMessage="Could not upload — please try again."
/>
```

## Disabled

**Disabled**

```tsx
<FileUploader label="Locked" disabled />
```

## Accessibility

- Dropzone is keyboard-reachable as `role="button"` with `tabIndex={0}`; **Enter** and **Space** open the native file picker.
- Drag-over state is reflected visually and via `aria-busy="true"`.
- `aria-invalid` is set in the error state; `aria-required` when `required` is set.
- `aria-describedby` links to the helper / error text.
- Remove buttons on each row have a labelled `aria-label="Remove <filename>"`.
- The hidden `<input type="file">` carries the `name` attribute when supplied, so native form submission still works for simple use cases.

## API Reference

### `<FileUploader>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `FileUploaderItem[]` | — | Controlled list of items. |
| `defaultValue` | `FileUploaderItem[]` | — | Default list (uncontrolled). |
| `onChange` | `(items: FileUploaderItem[]) => void` | — | Called whenever the items list changes. |
| `onFilesAdd` | `(files: File[]) => void` | — | Called with the raw `File` objects that were just accepted (after validation, before they appear as `pending`). Kick off the upload here. |
| `onFileRemove` | `(item: FileUploaderItem) => void` | — | Called when a single item is removed. |
| `onReject` | `(file: File, reason: FileUploaderRejectReason) => void` | — | Called for files rejected by validation. |
| `accept` | `string` | — | Comma-separated list of accepted MIME types and/or extensions (e.g. `image/*,.pdf`). All types when omitted. |
| `multiple` | `boolean` | `true` | Allow selecting more than one file at a time. |
| `maxFiles` | `number` | — | Maximum number of files the uploader will hold. Extra files are rejected as `max-files`. |
| `maxSize` | `number` | — | Maximum file size in bytes. Files above are rejected as `too-large`. |
| `minSize` | `number` | — | Minimum file size in bytes. Files below are rejected as `too-small`. |
| `validate` | `(file: File) => boolean \| string` | — | Synchronous validator. `false` rejects as `invalid`, a string is forwarded as the rejection reason. |
| `renderItem` | `(state: FileUploaderRenderItemState) => ReactNode` | — | Custom row renderer. When omitted the built-in row is used. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size. |
| `label` | `string` | — | Label rendered above the dropzone. |
| `helperText` | `string` | — | Helper text rendered below. |
| `error` | `boolean` | `false` | Error state. |
| `errorMessage` | `string` | — | Error message — overrides `helperText` when `error` is true. |
| `disabled` | `boolean` | `false` | Disable interaction with the uploader. |
| `required` | `boolean` | `false` | Mark the field as required. |
| `dropZoneText` | `ReactNode` | `'Drag files here or click to browse'` | Primary text shown inside the dropzone. |
| `dropZoneHint` | `ReactNode` | — | Secondary text shown inside the dropzone. |
| `name` | `string` | — | Hidden form-input name attribute (for native form submission). |
| `className` | `string` | — | Additional CSS class names. |
| `style` | `CSSProperties` | — | Inline styles. |
| `testId` | `string` | — | Test identifier for automated testing. |
| `ref` | `Ref` | — | Ref to the root element. |

### `FileUploaderItem`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` *(required)* | `string` | — | Stable identifier — generated for new items, preserved across renders. |
| `file` *(required)* | `File` | — | Underlying `File` object. |
| `status` *(required)* | `'pending' \| 'uploading' \| 'done' \| 'error'` | — | Current status of the upload pipeline. |
| `progress` | `number` | — | Upload progress, 0–100. Optional in `pending` / `done`. |
| `errorMessage` | `string` | — | Error message displayed when `status === 'error'`. |

### `FileUploaderRejectReason`

`'too-large' | 'too-small' | 'wrong-type' | 'max-files' | 'invalid' | string`

Built-in reasons plus any string returned from a `validate` callback.
