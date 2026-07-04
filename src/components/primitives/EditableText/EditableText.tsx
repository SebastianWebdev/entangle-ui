'use client';

import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Text } from '@/components/primitives/Text';
import { textRecipe } from '@/components/primitives/Text/Text.css';
import { useControlledState, useLatest, useMergedRef } from '@/hooks';
import { cx } from '@/utils/cx';

import {
  displayStyle,
  displayReadOnlyStyle,
  displayDisabledStyle,
  editWrapStyle,
  sizerStyle,
  inputStyle,
} from './EditableText.css';
import { resolveEditableTextLabels } from './editableTextLabels';

import type {
  EditableTextEndReason,
  EditableTextHandle,
  EditableTextProps,
} from './EditableText.types';

/**
 * Text that looks like `<Text>` but turns into an inline editor when the user
 * activates it — the editor-UI pattern for renaming layers, nodes, assets, and
 * scene objects in place.
 *
 * The idle state renders a real `<Text>` (so it inherits every typography prop),
 * and the editing state renders a chrome-less `<input>` that shares the exact
 * same typography recipe, so the swap is visually seamless. The edit field
 * auto-sizes to its content via a hidden sizer — no measurement effects.
 *
 * Editing commits on `Enter` (and on blur when `submitOnBlur`), cancels on
 * `Escape`. `onChange` fires on commit only, with the new value.
 *
 * @example
 * ```tsx
 * // Uncontrolled — click the text to rename in place
 * <EditableText defaultValue="Untitled Layer" onChange={setName} />
 *
 * // Controlled, heading-styled, double-click to edit (rename convention)
 * <EditableText
 *   variant="heading"
 *   value={name}
 *   onChange={setName}
 *   activationMode="double"
 *   placeholder="Name this node"
 * />
 * ```
 */
export const EditableText = ({
  value,
  defaultValue,
  onChange,
  placeholder,
  as = 'span',
  variant = 'body',
  size,
  weight,
  color = 'primary',
  lineHeight,
  align,
  truncate = false,
  mono = false,
  activationMode = 'single',
  disabled = false,
  readOnly = false,
  selectOnEdit = true,
  submitOnBlur = true,
  maxLength,
  labels: labelsProp,
  'aria-label': ariaLabel,
  onEditStart,
  onEditEnd,
  onKeyDown,
  className,
  style,
  testId,
  ref,
}: EditableTextProps): React.ReactElement => {
  const [currentValue, setValue] = useControlledState({
    value,
    defaultValue,
    onChange,
    fallback: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const displayRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // When an edit ends via keyboard we return focus to the display; a blur-driven
  // end must NOT steal focus back (the user just clicked somewhere else).
  const refocusDisplayRef = useRef(false);
  // Guards the input's blur handler from firing a second end after Enter/Escape
  // already tore the input down.
  const endingRef = useRef(false);

  const currentValueRef = useLatest(currentValue);
  const draftRef = useLatest(draft);
  const submitOnBlurRef = useLatest(submitOnBlur);
  const selectOnEditRef = useLatest(selectOnEdit);
  const onEditStartRef = useLatest(onEditStart);
  const onEditEndRef = useLatest(onEditEnd);
  const onKeyDownRef = useLatest(onKeyDown);

  const labels = useMemo(
    () => resolveEditableTextLabels(labelsProp),
    [labelsProp]
  );

  const startEditing = useCallback(() => {
    if (disabled || readOnly) return;
    endingRef.current = false;
    setDraft(currentValueRef.current);
    setIsEditing(true);
    onEditStartRef.current?.();
  }, [disabled, readOnly, currentValueRef, onEditStartRef]);

  const endEditing = useCallback(
    (reason: EditableTextEndReason, refocus: boolean) => {
      endingRef.current = true;
      refocusDisplayRef.current = refocus;
      setIsEditing(false);
      onEditEndRef.current?.(reason);
    },
    [onEditEndRef]
  );

  const commit = useCallback(
    (refocus: boolean) => {
      if (endingRef.current) return;
      const next = draftRef.current;
      if (next !== currentValueRef.current) {
        setValue(next);
      }
      endEditing('commit', refocus);
    },
    [draftRef, currentValueRef, setValue, endEditing]
  );

  const cancel = useCallback(
    (refocus: boolean) => {
      if (endingRef.current) return;
      endEditing('cancel', refocus);
    },
    [endEditing]
  );

  useImperativeHandle(
    ref,
    (): EditableTextHandle => ({
      edit: startEditing,
      commit: () => {
        commit(false);
      },
      cancel: () => {
        cancel(false);
      },
      focus: () => {
        (inputRef.current ?? displayRef.current)?.focus();
      },
      isEditing: () => isEditing,
      getElement: () => inputRef.current ?? displayRef.current,
    }),
    [startEditing, commit, cancel, isEditing]
  );

  // Focus (and optionally select) the input the moment it mounts, without an
  // effect. Stable identity, so it fires once per edit session, not per render.
  const focusInput = useCallback(
    (node: HTMLInputElement | null) => {
      if (node) {
        node.focus();
        if (selectOnEditRef.current) node.select();
      }
    },
    [selectOnEditRef]
  );
  const mergedInputRef = useMergedRef(inputRef, focusInput);

  // Return focus to the display element after a keyboard-driven edit end.
  const refocusDisplay = useCallback((node: HTMLElement | null) => {
    if (node && refocusDisplayRef.current) {
      node.focus();
      refocusDisplayRef.current = false;
    }
  }, []);
  const mergedDisplayRef = useMergedRef(displayRef, refocusDisplay);

  const handleDisplayKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === 'F2') {
        event.preventDefault();
        startEditing();
      }
    },
    [startEditing]
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commit(true);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancel(true);
      }
      onKeyDownRef.current?.(event);
    },
    [commit, cancel, onKeyDownRef]
  );

  const handleInputBlur = useCallback(() => {
    if (submitOnBlurRef.current) {
      commit(false);
    } else {
      cancel(false);
    }
  }, [commit, cancel, submitOnBlurRef]);

  // Recipe args mirror Text's own gating so the input matches the display
  // typography exactly.
  const isInherit = variant === 'inherit';
  const sizeVariant = size && !isInherit ? size : undefined;
  const weightVariant = weight && !isInherit ? weight : undefined;
  const lineHeightVariant = lineHeight && !isInherit ? lineHeight : undefined;
  const useMono = mono || variant === 'code' ? true : undefined;

  if (isEditing) {
    const editTextClass = textRecipe({
      variant,
      color,
      size: sizeVariant,
      weight: weightVariant,
      lineHeight: lineHeightVariant,
      align,
      mono: useMono,
    });

    return (
      // The wrapper only groups the sizer + input; the input owns all
      // interactivity, so the wrapper needs no role or key handler.
      <span
        className={cx(editWrapStyle, className)}
        style={style}
        data-editing="true"
      >
        <span aria-hidden="true" className={cx(editTextClass, sizerStyle)}>
          {`${draft.length > 0 ? draft : (placeholder ?? '')} `}
        </span>
        <input
          ref={mergedInputRef}
          type="text"
          className={cx(editTextClass, inputStyle)}
          value={draft}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-label={ariaLabel ?? labels.editLabel}
          onChange={event => {
            setDraft(event.target.value);
          }}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          onClick={event => {
            // Don't let the click bubble to a parent row/select handler.
            event.stopPropagation();
          }}
          data-testid={testId}
        />
      </span>
    );
  }

  const hasValue = currentValue.length > 0;
  const showingPlaceholder =
    !hasValue && placeholder != null && placeholder.length > 0;
  const displayContent = hasValue
    ? currentValue
    : showingPlaceholder
      ? placeholder
      : // Keep a clickable line box when there is nothing to show.
        ' ';

  const displayColor = disabled
    ? 'disabled'
    : showingPlaceholder
      ? 'muted'
      : color;

  const interactive = !disabled && !readOnly;

  // When the value is empty there is no meaningful text content to name the
  // control, so fall back to the placeholder or the edit label.
  const resolvedAriaLabel =
    ariaLabel ?? (hasValue ? undefined : (placeholder ?? labels.editLabel));

  return (
    <Text
      as={as}
      variant={variant}
      size={size}
      weight={weight}
      color={displayColor}
      lineHeight={lineHeight}
      align={align}
      truncate={truncate}
      mono={mono}
      ref={mergedDisplayRef}
      className={cx(
        displayStyle,
        !interactive &&
          (disabled ? displayDisabledStyle : displayReadOnlyStyle),
        className
      )}
      style={style}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={resolvedAriaLabel}
      aria-disabled={disabled || undefined}
      onClick={
        interactive && activationMode === 'single' ? startEditing : undefined
      }
      onDoubleClick={
        interactive && activationMode === 'double' ? startEditing : undefined
      }
      onKeyDown={interactive ? handleDisplayKeyDown : undefined}
      testId={testId}
    >
      {displayContent}
    </Text>
  );
};

EditableText.displayName = 'EditableText';
