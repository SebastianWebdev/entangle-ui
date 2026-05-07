import type React from 'react';
import type { BaseComponent, Size } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type FileUploaderSize = Size;

export type FileUploaderItemStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface FileUploaderItem {
  /** Stable identifier — generated for new items, preserved across renders */
  id: string;
  /** Underlying File object */
  file: File;
  /** Current status of the upload pipeline */
  status: FileUploaderItemStatus;
  /** Upload progress, 0-100. Optional in `pending` / `done` states. */
  progress?: number;
  /** Error message displayed when `status === 'error'` */
  errorMessage?: string;
}

export type FileUploaderRejectReason =
  | 'too-large'
  | 'too-small'
  | 'wrong-type'
  | 'max-files'
  | 'invalid'
  // Custom reason returned from the `validate` callback.
  | (string & {});

export interface FileUploaderRenderItemState {
  item: FileUploaderItem;
  index: number;
  remove: () => void;
  disabled: boolean;
}

export interface FileUploaderBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'onChange' | 'children' | 'defaultValue'
> {
  /** Controlled list of items */
  value?: FileUploaderItem[];

  /** Default list (uncontrolled) */
  defaultValue?: FileUploaderItem[];

  /** Called whenever the items list changes */
  onChange?: (items: FileUploaderItem[]) => void;

  /**
   * Called with the raw `File` objects that were just accepted (after type/size
   * validation, before they appear in the list as `pending`). The consumer
   * should kick off the upload here and update `value` as progress changes.
   */
  onFilesAdd?: (files: File[]) => void;

  /** Called when a single item is removed */
  onFileRemove?: (item: FileUploaderItem) => void;

  /** Called for files rejected by validation */
  onReject?: (file: File, reason: FileUploaderRejectReason) => void;

  /**
   * Comma-separated list of accepted MIME types and/or extensions, e.g.
   * `'image/*,.pdf'`. When omitted, every file type is accepted.
   */
  accept?: string;

  /**
   * Allow selecting more than one file at a time.
   * @default true
   */
  multiple?: boolean;

  /**
   * Maximum number of files the uploader will hold. Additional files are
   * rejected with reason `'max-files'`.
   */
  maxFiles?: number;

  /** Maximum file size in bytes. Files above are rejected as `'too-large'`. */
  maxSize?: number;

  /** Minimum file size in bytes. Files below are rejected as `'too-small'`. */
  minSize?: number;

  /**
   * Synchronous validator. Return `false` (or a string with a reason) to
   * reject. Called after type/size checks pass.
   */
  validate?: (file: File) => boolean | string;

  /**
   * Custom renderer for a file row. When omitted the built-in row is used.
   */
  renderItem?: (state: FileUploaderRenderItemState) => React.ReactNode;

  /** Component size */
  size?: FileUploaderSize;

  /** Label rendered above the dropzone */
  label?: string;

  /** Helper text rendered below */
  helperText?: string;

  /** Error state */
  error?: boolean;

  /** Error message — overrides `helperText` when `error` is true */
  errorMessage?: string;

  /** Disable interaction with the uploader */
  disabled?: boolean;

  /** Mark the field as required */
  required?: boolean;

  /** Primary text shown inside the dropzone */
  dropZoneText?: React.ReactNode;

  /** Secondary text shown inside the dropzone */
  dropZoneHint?: React.ReactNode;

  /** Hidden form-input name attribute (for native form submission) */
  name?: string;
}

export type FileUploaderProps = Prettify<FileUploaderBaseProps>;
