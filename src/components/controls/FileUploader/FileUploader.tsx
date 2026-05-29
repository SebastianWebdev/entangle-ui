'use client';

import React, { useCallback, useId, useMemo, useRef, useState } from 'react';

import { FormHelperText } from '@/components/form/FormHelperText';
import { FormLabel } from '@/components/form/FormLabel';
import { CloudUploadIcon } from '@/components/Icons/CloudUploadIcon';
import { TrashIcon } from '@/components/Icons/TrashIcon';
import { useControlledState } from '@/hooks/useControlledState';
import { useMergedRef } from '@/hooks/useMergedRef';
import { cx } from '@/utils/cx';

import {
  containerStyle,
  dropZoneHintStyle,
  dropZonePrimaryStyle,
  dropZoneRecipe,
  fileListStyle,
  fileMetaStyle,
  fileNameStyle,
  fileRowRecipe,
  fileSubStyle,
  hiddenInputStyle,
  progressBarStyle,
  progressFillRecipe,
  removeButtonStyle,
  statusBadgeRecipe,
} from './FileUploader.css';

import type {
  FileUploaderItem,
  FileUploaderProps,
  FileUploaderRejectReason,
} from './FileUploader.types';

let __fileUploaderIdCounter = 0;
function nextFileId(): string {
  __fileUploaderIdCounter += 1;
  return `eui-file-${String(Date.now())}-${String(__fileUploaderIdCounter)}`;
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes === 0) return '0 B';
  const exponent = Math.min(
    SIZE_UNITS.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  const value = bytes / Math.pow(1024, exponent);
  const formatted =
    value >= 100 || exponent === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted} ${SIZE_UNITS[exponent] ?? ''}`;
}

function fileMatchesAccept(file: File, accept: string): boolean {
  const tokens = accept
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  for (const token of tokens) {
    if (token.startsWith('.')) {
      if (name.endsWith(token)) return true;
    } else if (token.endsWith('/*')) {
      const prefix = token.slice(0, -2);
      if (type.startsWith(`${prefix}/`)) return true;
    } else if (token === type) {
      return true;
    }
  }
  return false;
}

/**
 * Drag-and-drop file uploader with click-to-browse fallback. Renders a list
 * of uploaded items with per-file status (`pending` / `uploading` / `done` /
 * `error`) and an animated progress bar.
 *
 * The component itself is purely presentational around the file list — it
 * does not perform the actual upload. The consumer is expected to:
 *   1. Listen to `onFilesAdd` (or `onChange`) to know which files were
 *      accepted by the uploader.
 *   2. Drive the upload (fetch / XHR / SDK) externally.
 *   3. Reflect progress back into the component by passing a controlled
 *      `value` and updating the `status` / `progress` of each item.
 *
 * @example
 * ```tsx
 * const [items, setItems] = useState<FileUploaderItem[]>([]);
 * <FileUploader
 *   value={items}
 *   onChange={setItems}
 *   accept="image/*,.pdf"
 *   maxSize={5 * 1024 * 1024}
 *   onFilesAdd={files => uploadAll(files, setItems)}
 * />
 * ```
 */
export function FileUploader({
  value,
  defaultValue,
  onChange,
  onFilesAdd,
  onFileRemove,
  onReject,
  accept,
  multiple = true,
  maxFiles,
  maxSize,
  minSize,
  validate,
  renderItem,
  size = 'md',
  label,
  helperText,
  error = false,
  errorMessage,
  disabled = false,
  required = false,
  dropZoneText = 'Drag files here or click to browse',
  dropZoneHint,
  name,
  className,
  style,
  testId,
  id: idProp,
  ref,
  ...rest
}: FileUploaderProps) {
  const autoId = useId();
  const fieldId = idProp ?? autoId;
  const labelId = `${fieldId}-label`;
  const helperId = `${fieldId}-helper`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const setContainerRef = useMergedRef(containerRef, ref);

  const [items, setItems] = useControlledState<FileUploaderItem[]>({
    value,
    defaultValue,
    onChange,
    fallback: [],
  });

  const [dragging, setDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const validateFile = useCallback(
    (file: File, currentCount: number): FileUploaderRejectReason | null => {
      if (typeof maxFiles === 'number' && currentCount >= maxFiles) {
        return 'max-files';
      }
      if (accept && !fileMatchesAccept(file, accept)) {
        return 'wrong-type';
      }
      if (typeof maxSize === 'number' && file.size > maxSize) {
        return 'too-large';
      }
      if (typeof minSize === 'number' && file.size < minSize) {
        return 'too-small';
      }
      if (validate) {
        const result = validate(file);
        if (result === false) return 'invalid';
        if (typeof result === 'string') return result;
      }
      return null;
    },
    [accept, maxFiles, maxSize, minSize, validate]
  );

  const acceptFiles = useCallback(
    (incoming: File[]) => {
      if (incoming.length === 0) return;
      const accepted: File[] = [];
      const newItems: FileUploaderItem[] = [];
      let count = items.length;

      const list = multiple ? incoming : incoming.slice(0, 1);

      for (const file of list) {
        const rejection = validateFile(file, count);
        if (rejection) {
          onReject?.(file, rejection);
          continue;
        }
        accepted.push(file);
        newItems.push({
          id: nextFileId(),
          file,
          status: 'pending',
        });
        count += 1;
      }

      if (newItems.length === 0) return;

      // In single mode, replace any existing item.
      const next = multiple ? [...items, ...newItems] : newItems;
      setItems(next);
      onFilesAdd?.(accepted);
    },
    [items, multiple, onFilesAdd, onReject, setItems, validateFile]
  );

  const removeAt = useCallback(
    (index: number) => {
      if (index < 0 || index >= items.length) return;
      const removed = items[index];
      const next = items.slice(0, index).concat(items.slice(index + 1));
      setItems(next);
      if (removed) onFileRemove?.(removed);
    },
    [items, onFileRemove, setItems]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const list = event.target.files;
      if (!list) return;
      acceptFiles(Array.from(list));
      // Reset so selecting the same file again still fires onChange.
      event.target.value = '';
    },
    [acceptFiles]
  );

  const openPicker = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleZoneKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPicker();
      }
    },
    [disabled, openPicker]
  );

  const handleDragEnter = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      dragCounterRef.current += 1;
      if (dragCounterRef.current === 1) setDragging(true);
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) setDragging(false);
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      dragCounterRef.current = 0;
      setDragging(false);
      const dt = event.dataTransfer;
      if (!dt) return;
      const dropped: File[] = [];
      if (dt.files.length > 0) {
        dropped.push(...Array.from(dt.files));
      } else if (dt.items.length > 0) {
        for (const item of Array.from(dt.items)) {
          if (item.kind === 'file') {
            const f = item.getAsFile();
            if (f) dropped.push(f);
          }
        }
      }
      acceptFiles(dropped);
    },
    [acceptFiles, disabled]
  );

  const showHelperText = error && errorMessage ? errorMessage : helperText;

  const renderRow = (item: FileUploaderItem, index: number) => {
    if (renderItem) {
      return (
        <React.Fragment key={item.id}>
          {renderItem({
            item,
            index,
            disabled,
            remove: () => {
              removeAt(index);
            },
          })}
        </React.Fragment>
      );
    }

    const progress = Math.max(0, Math.min(100, item.progress ?? 0));
    const sub = item.errorMessage ?? formatBytes(item.file.size);

    return (
      <div
        key={item.id}
        className={fileRowRecipe({ status: item.status })}
        data-testid={testId ? `${testId}-item-${item.id}` : undefined}
      >
        <div className={fileMetaStyle}>
          <span className={fileNameStyle} title={item.file.name}>
            {item.file.name}
          </span>
          <span className={fileSubStyle}>
            <span className={statusBadgeRecipe({ status: item.status })}>
              {item.status}
            </span>
            <span>{sub}</span>
          </span>
          {(item.status === 'uploading' ||
            (item.status === 'pending' && progress > 0)) && (
            <div className={progressBarStyle} aria-hidden="true">
              <div
                className={progressFillRecipe({ status: item.status })}
                style={{ width: `${String(progress)}%` }}
              />
            </div>
          )}
        </div>
        <button
          type="button"
          className={removeButtonStyle}
          aria-label={`Remove ${item.file.name}`}
          disabled={disabled}
          onClick={() => {
            removeAt(index);
          }}
        >
          <TrashIcon size="sm" decorative />
        </button>
      </div>
    );
  };

  const acceptHint = useMemo(() => {
    if (dropZoneHint !== undefined) return dropZoneHint;
    const parts: string[] = [];
    if (accept) parts.push(accept);
    if (typeof maxSize === 'number')
      parts.push(`up to ${formatBytes(maxSize)}`);
    if (typeof maxFiles === 'number')
      parts.push(`max ${String(maxFiles)} files`);
    return parts.length > 0 ? parts.join(' • ') : null;
  }, [accept, dropZoneHint, maxFiles, maxSize]);

  return (
    <div
      ref={setContainerRef}
      className={cx(containerStyle, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {label && (
        <FormLabel
          id={labelId}
          htmlFor={fieldId}
          required={required}
          disabled={disabled}
        >
          {label}
        </FormLabel>
      )}

      <div
        ref={dropZoneRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={showHelperText ? helperId : undefined}
        className={dropZoneRecipe({
          size,
          dragging,
          disabled,
          error,
        })}
        onClick={openPicker}
        onKeyDown={handleZoneKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid={testId ? `${testId}-dropzone` : undefined}
      >
        <CloudUploadIcon
          size={size === 'lg' ? 32 : size === 'sm' ? 18 : 24}
          decorative
        />
        <span className={dropZonePrimaryStyle}>{dropZoneText}</span>
        {acceptHint && <span className={dropZoneHintStyle}>{acceptHint}</span>}

        <input
          ref={inputRef}
          id={fieldId}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          required={required}
          disabled={disabled}
          onChange={handleInputChange}
          className={hiddenInputStyle}
          aria-hidden="true"
          tabIndex={-1}
          data-testid={testId ? `${testId}-input` : undefined}
        />
      </div>

      {items.length > 0 && (
        <div className={fileListStyle}>
          {items.map((item, idx) => renderRow(item, idx))}
        </div>
      )}

      {showHelperText && (
        <FormHelperText id={helperId} error={error}>
          {showHelperText}
        </FormHelperText>
      )}
    </div>
  );
}

FileUploader.displayName = 'FileUploader';
