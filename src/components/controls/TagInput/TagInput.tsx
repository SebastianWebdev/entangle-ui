'use client';

import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import { FormHelperText } from '@/components/form/FormHelperText';
import { FormLabel } from '@/components/form/FormLabel';
import { useControlledState } from '@/hooks/useControlledState';
import { useMergedRef } from '@/hooks/useMergedRef';
import { cx } from '@/utils/cx';
import {
  containerStyle,
  inputStyle,
  tagLabelStyle,
  tagRecipe,
  tagRemoveStyle,
  wrapperRecipe,
} from './TagInput.css';
import type {
  TagInputProps,
  TagInputRenderTagState,
  TagInputSeparator,
} from './TagInput.types';

const SEPARATOR_KEY: Record<TagInputSeparator, string> = {
  Enter: 'Enter',
  Comma: ',',
  Space: ' ',
  Tab: 'Tab',
};

const DEFAULT_SEPARATORS: TagInputSeparator[] = ['Enter', 'Comma'];

function defaultNormalize(value: string): string {
  return value.trim();
}

/**
 * Multi-value input that captures a list of strings ("tags") rendered as
 * removable chips. Supports controlled and uncontrolled modes, validation,
 * configurable commit keys, and custom chip rendering.
 *
 * @example
 * ```tsx
 * <TagInput
 *   label="Keywords"
 *   placeholder="Add a keyword..."
 *   defaultValue={['react', 'typescript']}
 *   onChange={setTags}
 * />
 * ```
 */
export function TagInput({
  value,
  defaultValue,
  onChange,
  placeholder,
  separators = DEFAULT_SEPARATORS,
  addOnBlur = false,
  allowDuplicates = false,
  max,
  validate,
  normalize = defaultNormalize,
  onValidate,
  renderTag,
  size = 'md',
  variant = 'default',
  label,
  helperText,
  error = false,
  errorMessage,
  disabled = false,
  required = false,
  readOnly = false,
  name,
  inputAriaLabel,
  inputRef: inputRefProp,
  className,
  style,
  testId,
  id: idProp,
  ref,
  ...rest
}: TagInputProps) {
  const autoId = useId();
  const fieldId = idProp ?? autoId;
  const labelId = `${fieldId}-label`;
  const helperId = `${fieldId}-helper`;

  const [tags, setTags] = useControlledState<string[]>({
    value,
    defaultValue,
    onChange,
    fallback: [],
  });

  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);

  const innerInputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const setInputRef = useMergedRef(innerInputRef, inputRefProp);
  const setWrapperRef = useMergedRef(wrapperRef, ref);

  const atMax = typeof max === 'number' && tags.length >= max;
  const inputDisabled = disabled || readOnly || atMax;

  const separatorKeys = useMemo(
    () => new Set(separators.map(s => SEPARATOR_KEY[s])),
    [separators]
  );

  const tryAppend = useCallback(
    (current: string[], raw: string): string[] | null => {
      const normalized = normalize(raw);
      if (normalized.length === 0) {
        if (raw.length > 0) onValidate?.(raw, 'empty');
        return null;
      }
      if (typeof max === 'number' && current.length >= max) {
        onValidate?.(raw, 'max');
        return null;
      }
      if (!allowDuplicates && current.includes(normalized)) {
        onValidate?.(raw, 'duplicate');
        return null;
      }
      if (validate) {
        const result = validate(normalized, current);
        if (result === false) {
          onValidate?.(raw, 'invalid');
          return null;
        }
        if (typeof result === 'string') {
          onValidate?.(raw, result);
          return null;
        }
      }
      return [...current, normalized];
    },
    [allowDuplicates, max, normalize, onValidate, validate]
  );

  const commitTag = useCallback(
    (raw: string): boolean => {
      const next = tryAppend(tags, raw);
      if (!next) return false;
      setTags(next);
      return true;
    },
    [setTags, tags, tryAppend]
  );

  const removeTagAt = useCallback(
    (index: number) => {
      if (index < 0 || index >= tags.length) return;
      const next = tags.slice(0, index).concat(tags.slice(index + 1));
      setTags(next);
    },
    [setTags, tags]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (inputDisabled) return;

      if (separatorKeys.has(event.key)) {
        // Tab as separator: only commit when there's a draft, otherwise let
        // the focus move out naturally.
        if (event.key === 'Tab' && draft.length === 0) return;
        if (draft.length > 0) {
          event.preventDefault();
          if (commitTag(draft)) setDraft('');
        } else if (event.key === 'Enter') {
          // Prevent submitting an enclosing form on empty Enter.
          event.preventDefault();
        }
        return;
      }

      if (event.key === 'Backspace' && draft.length === 0 && tags.length > 0) {
        event.preventDefault();
        removeTagAt(tags.length - 1);
      }
    },
    [commitTag, draft, inputDisabled, removeTagAt, separatorKeys, tags.length]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      // If the user typed/pasted a separator character (e.g. comma), commit
      // each piece. Newlines are split too so multi-line paste still works.
      const splitChars = Array.from(separatorKeys).filter(
        k => k !== 'Enter' && k !== 'Tab'
      );
      if (splitChars.length === 0 || !splitChars.some(c => next.includes(c))) {
        setDraft(next);
        return;
      }

      const pattern = new RegExp(`[${splitChars.map(c => `\\${c}`).join('')}]`);
      const parts = next.split(pattern);
      const trailing = parts.pop() ?? '';
      let working = tags;
      for (const part of parts) {
        if (part.length === 0) continue;
        const appended = tryAppend(working, part);
        if (appended) working = appended;
      }
      if (working !== tags) setTags(working);
      setDraft(trailing);
    },
    [separatorKeys, setTags, tags, tryAppend]
  );

  const handleBlur = useCallback(() => {
    setFocused(false);
    if (addOnBlur && draft.length > 0) {
      if (commitTag(draft)) setDraft('');
    }
  }, [addOnBlur, commitTag, draft]);

  const handleWrapperMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // Forward clicks on empty padding to the input, but do not steal focus
      // from chip remove buttons.
      if (event.target === wrapperRef.current) {
        event.preventDefault();
        innerInputRef.current?.focus();
      }
    },
    []
  );

  const renderChip = (tag: string, index: number) => {
    const remove = () => removeTagAt(index);
    if (renderTag) {
      const state: TagInputRenderTagState = {
        tag,
        index,
        disabled,
        remove,
      };
      return (
        <React.Fragment key={`${tag}-${String(index)}`}>
          {renderTag(state)}
        </React.Fragment>
      );
    }

    return (
      <span
        key={`${tag}-${String(index)}`}
        className={tagRecipe({ size })}
        data-testid={testId ? `${testId}-tag-${String(index)}` : undefined}
      >
        <span className={tagLabelStyle}>{tag}</span>
        {!readOnly && (
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label={`Remove ${tag}`}
            className={tagRemoveStyle}
            onClick={remove}
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1L7 7M7 1L1 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </span>
    );
  };

  const showHelperText = error && errorMessage ? errorMessage : helperText;
  const formValue = tags.join(',');

  return (
    <div className={cx(containerStyle, className)} style={style}>
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
        ref={setWrapperRef}
        className={wrapperRecipe({
          size,
          variant,
          focused,
          error,
          disabled,
        })}
        onMouseDown={handleWrapperMouseDown}
        data-testid={testId}
        {...rest}
      >
        {tags.map((tag, index) => renderChip(tag, index))}

        {!readOnly && (
          <input
            ref={setInputRef}
            id={fieldId}
            type="text"
            value={draft}
            placeholder={tags.length === 0 ? placeholder : undefined}
            disabled={inputDisabled}
            required={required && tags.length === 0}
            aria-label={inputAriaLabel}
            aria-labelledby={!inputAriaLabel && label ? labelId : undefined}
            aria-describedby={showHelperText ? helperId : undefined}
            aria-invalid={error || undefined}
            className={inputStyle}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setFocused(true);
            }}
            onBlur={handleBlur}
          />
        )}
      </div>

      {name && <input type="hidden" name={name} value={formValue} />}

      {showHelperText && (
        <FormHelperText id={helperId} error={error}>
          {showHelperText}
        </FormHelperText>
      )}
    </div>
  );
}

TagInput.displayName = 'TagInput';
