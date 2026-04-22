'use client';

import React, { useCallback, useEffect, useId, useRef } from 'react';
import { cx } from '@/utils/cx';
import { FormHelperText } from '@/components/form/FormHelperText';
import { FormLabel } from '@/components/form/FormLabel';
import type { TextAreaProps } from './TextArea.types';
import {
  textAreaContainerStyle,
  textAreaFooterStyle,
  textAreaRecipe,
  textAreaWrapperRecipe,
} from './TextArea.css';

/**
 * Multi-line text input with optional auto-resize.
 *
 * Visual parity with `Input` — uses the same border, focus ring, and error
 * states. Auto-resize activates when `minRows` or `maxRows` is set and
 * disables the native resize handle.
 *
 * @example
 * ```tsx
 * <TextArea
 *   label="Description"
 *   minRows={3}
 *   maxRows={8}
 *   value={value}
 *   onChange={setValue}
 *   showCount
 *   maxLength={500}
 * />
 * ```
 */
export const TextArea: React.FC<TextAreaProps> = ({
  value,
  defaultValue,
  placeholder,
  size = 'md',
  disabled = false,
  error = false,
  required = false,
  readOnly = false,
  label,
  helperText,
  errorMessage,
  resize = 'vertical',
  rows = 3,
  minRows,
  maxRows,
  monospace = false,
  maxLength,
  showCount = false,
  className,
  style,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  testId,
  ref,
  id,
  name,
  ...rest
}) => {
  const [focused, setFocused] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const autoId = useId();
  const inputId = id ?? autoId;

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const autoSizeEnabled = minRows !== undefined || maxRows !== undefined;
  const effectiveResize = autoSizeEnabled ? 'none' : resize;

  const setRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          node;
    },
    [ref]
  );

  const autoResize = useCallback(() => {
    if (!autoSizeEnabled) return;
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto';

    const measuredLineHeight = parseFloat(getComputedStyle(el).lineHeight);
    const lineHeight = Number.isFinite(measuredLineHeight)
      ? measuredLineHeight
      : 18;
    const minHeight = (minRows ?? 1) * lineHeight;
    const maxHeight = maxRows ? maxRows * lineHeight : Infinity;

    const next = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [autoSizeEnabled, minRows, maxRows]);

  useEffect(() => {
    autoResize();
  }, [currentValue, autoResize]);

  const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(true);
    onFocus?.(event);
  };
  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(false);
    onBlur?.(event);
  };
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const effectiveHelper = error && errorMessage ? errorMessage : helperText;
  const count = currentValue?.length ?? 0;

  return (
    <div className={cx(textAreaContainerStyle, className)} style={style}>
      {label && (
        <FormLabel htmlFor={inputId} disabled={disabled} required={required}>
          {label}
        </FormLabel>
      )}

      <div
        className={textAreaWrapperRecipe({ size, error, disabled, focused })}
      >
        <textarea
          ref={setRef}
          id={inputId}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          value={isControlled ? value : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          rows={autoSizeEnabled ? (minRows ?? rows) : rows}
          maxLength={maxLength}
          className={textAreaRecipe({
            size,
            monospace: monospace || undefined,
          })}
          style={{ resize: effectiveResize }}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          data-testid={testId}
          aria-invalid={error || undefined}
          {...rest}
        />
      </div>

      {(effectiveHelper !== undefined && effectiveHelper !== '') ||
      showCount ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          {effectiveHelper !== undefined && effectiveHelper !== '' ? (
            <FormHelperText error={error}>{effectiveHelper}</FormHelperText>
          ) : (
            <span />
          )}
          {showCount && (
            <div className={textAreaFooterStyle}>
              {maxLength !== undefined ? `${count}/${maxLength}` : count}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

TextArea.displayName = 'TextArea';
