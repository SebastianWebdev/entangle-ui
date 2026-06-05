'use client';

import React, { useCallback, useMemo, useRef } from 'react';

import { NumberInput } from '@/components/controls/NumberInput';
import { useControlledState, useLatest } from '@/hooks';
import { cx } from '@/utils/cx';

import {
  rootStyle,
  rootDisabledStyle,
  labelStyle,
  controlStyle,
  dialStyle,
  dialReadOnlyStyle,
  rotorStyle,
  needleStyle,
  handleStyle,
  centerStyle,
  inputWrapperStyle,
} from './AngleInput.css';
import { DEFAULT_ANGLE_INPUT_LABELS } from './angleInputLabels';
import { angleFromPointer, clampOrWrap, snapAngle } from './angleMath';

import type {
  AngleInputPlacement,
  AngleInputProps,
  AngleInputSize,
} from './AngleInput.types';

// Dial diameter per size preset (px). Overridable via the `diameter` prop.
const DIAL_DIAMETER: Record<AngleInputSize, number> = {
  sm: 36,
  md: 44,
  lg: 56,
};

// Rim handle diameter per size (px).
const HANDLE_SIZE: Record<AngleInputSize, number> = {
  sm: 8,
  md: 10,
  lg: 12,
};

// Width of the companion numeric input per size (px) — wide enough for "360°".
const INPUT_WIDTH: Record<AngleInputSize, number> = {
  sm: 56,
  md: 64,
  lg: 76,
};

function isVerticalPlacement(placement: AngleInputPlacement): boolean {
  return placement === 'top' || placement === 'bottom';
}

function isInputFirst(placement: AngleInputPlacement): boolean {
  return placement === 'top' || placement === 'left';
}

/**
 * A circular dial for choosing an angle, with an optional compact numeric
 * input beside it.
 *
 * The dial follows the CSS gradient convention: 0° points up and the angle
 * increases clockwise (90° = right), so the value maps straight onto
 * `linear-gradient(<angle>, …)`. Drag the dial, focus it and use the arrow keys
 * (<kbd>Shift</kbd> for larger steps, hold <kbd>Shift</kbd> while dragging to
 * snap), or type into the numeric input.
 *
 * `onChange` fires continuously; `onChangeComplete` fires on commit boundaries
 * (drag end, input blur, focus leaving the dial) for undo integration.
 *
 * @example
 * ```tsx
 * <AngleInput value={angle} onChange={setAngle} />
 *
 * // Dial only, numeric input below, large control
 * <AngleInput
 *   value={angle}
 *   onChange={setAngle}
 *   size="lg"
 *   inputPlacement="bottom"
 * />
 * ```
 */
export const AngleInput = ({
  value,
  defaultValue,
  onChange,
  onChangeComplete,
  size = 'md',
  diameter,
  disabled = false,
  readOnly = false,
  showInput = true,
  inputPlacement = 'right',
  step = 1,
  largeStep = 15,
  snap = 15,
  min = 0,
  max = 360,
  label,
  labels: labelsProp,
  className,
  style,
  testId,
  id,
  ref,
  'aria-label': ariaLabel,
  ...rest
}: AngleInputProps): React.ReactElement => {
  const labels = useMemo(
    () => ({ ...DEFAULT_ANGLE_INPUT_LABELS, ...labelsProp }),
    [labelsProp]
  );

  const [rawAngle, setAngleState] = useControlledState<number>({
    value,
    defaultValue,
    onChange,
    fallback: 0,
  });

  const angle = clampOrWrap(rawAngle, min, max);

  const dialRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  // Stable refs for the hot path — handlers never re-create during a drag.
  const angleRef = useLatest(angle);
  const setStateRef = useLatest(setAngleState);
  const onChangeCompleteRef = useLatest(onChangeComplete);
  const cfgRef = useLatest({
    min,
    max,
    step,
    largeStep,
    snap,
    disabled,
    readOnly,
  });

  const setAngle = useCallback(
    (next: number) => {
      const { min: lo, max: hi } = cfgRef.current;
      setStateRef.current(clampOrWrap(next, lo, hi));
    },
    [setStateRef, cfgRef]
  );

  const commit = useCallback(
    (explicit?: number) => {
      onChangeCompleteRef.current?.(explicit ?? angleRef.current);
    },
    [onChangeCompleteRef, angleRef]
  );

  const angleAtPointer = useCallback(
    (clientX: number, clientY: number, shiftKey: boolean): number | null => {
      const el = dialRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let next = angleFromPointer(clientX - centerX, clientY - centerY);
      const { snap: snapInc } = cfgRef.current;
      if (shiftKey && snapInc > 0) {
        next = snapAngle(next, snapInc);
      }
      return next;
    },
    [cfgRef]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const { disabled: isDisabled, readOnly: isReadOnly } = cfgRef.current;
      if (isDisabled || isReadOnly || event.button !== 0) return;
      event.preventDefault();
      dialRef.current?.focus();
      event.currentTarget.setPointerCapture(event.pointerId);
      draggingRef.current = true;
      const next = angleAtPointer(event.clientX, event.clientY, event.shiftKey);
      if (next !== null) setAngle(next);
    },
    [cfgRef, angleAtPointer, setAngle]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      const next = angleAtPointer(event.clientX, event.clientY, event.shiftKey);
      if (next !== null) setAngle(next);
    },
    [angleAtPointer, setAngle]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      const next = angleAtPointer(event.clientX, event.clientY, event.shiftKey);
      if (next !== null) {
        setAngle(next);
        commit(next);
      } else {
        commit();
      }
    },
    [angleAtPointer, setAngle, commit]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const {
        disabled: isDisabled,
        readOnly: isReadOnly,
        step: s,
        largeStep: ls,
        min: lo,
        max: hi,
      } = cfgRef.current;
      if (isDisabled || isReadOnly) return;
      const current = angleRef.current;
      const delta = event.shiftKey ? ls : s;
      let next: number;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = current + delta;
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          next = current - delta;
          break;
        case 'PageUp':
          next = current + ls;
          break;
        case 'PageDown':
          next = current - ls;
          break;
        case 'Home':
          next = lo;
          break;
        case 'End':
          next = hi;
          break;
        default:
          return;
      }
      event.preventDefault();
      setAngle(next);
    },
    [cfgRef, angleRef, setAngle]
  );

  // Commit the keyboard-edited value once focus leaves the dial — one undo
  // boundary per burst of arrow presses (matches NumberInput's blur commit).
  const handleDialBlur = useCallback(() => {
    commit();
  }, [commit]);

  const dialDiameter = diameter ?? DIAL_DIAMETER[size];
  const handleSize = HANDLE_SIZE[size];
  const rimInset = handleSize / 2 + 2;
  const inputWidth = INPUT_WIDTH[size];

  const verticalLayout = isVerticalPlacement(inputPlacement);
  const inputFirst = isInputFirst(inputPlacement);

  const dialNode = (
    <div
      ref={dialRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(angle)}
      aria-valuetext={labels.valueText(angle)}
      aria-label={ariaLabel ?? labels.dialAriaLabel}
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      className={cx(dialStyle, readOnly && dialReadOnlyStyle)}
      style={{ width: dialDiameter, height: dialDiameter }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      onBlur={handleDialBlur}
      data-testid={testId ? `${testId}-dial` : undefined}
    >
      <div className={rotorStyle} style={{ transform: `rotate(${angle}deg)` }}>
        <div className={needleStyle} style={{ top: rimInset }} />
        <div
          className={handleStyle}
          style={{ top: rimInset, width: handleSize, height: handleSize }}
        />
      </div>
      <div className={centerStyle} />
    </div>
  );

  const inputNode = showInput ? (
    <div className={inputWrapperStyle} style={{ width: inputWidth }}>
      <NumberInput
        value={angle}
        onChange={setAngle}
        onBlur={() => {
          commit();
        }}
        min={min}
        max={max}
        step={step}
        precision={0}
        unit="°"
        size={size}
        disabled={disabled}
        readOnly={readOnly}
        showStepButtons={false}
        aria-label={ariaLabel ? `${ariaLabel} value` : labels.inputAriaLabel}
        testId={testId ? `${testId}-input` : undefined}
      />
    </div>
  ) : null;

  return (
    <div
      ref={ref}
      id={id}
      className={cx(rootStyle, disabled && rootDisabledStyle, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {label ? <span className={labelStyle}>{label}</span> : null}
      <div
        className={controlStyle}
        style={{ flexDirection: verticalLayout ? 'column' : 'row' }}
      >
        {inputFirst ? inputNode : null}
        {dialNode}
        {inputFirst ? null : inputNode}
      </div>
    </div>
  );
};

AngleInput.displayName = 'AngleInput';
