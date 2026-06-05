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
  valueTextStyle,
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
  sm: 22,
  md: 28,
  lg: 36,
};

// Rim handle diameter per size (px). The handle is centered on the rim, so it
// straddles the dial border.
const HANDLE_SIZE: Record<AngleInputSize, number> = {
  sm: 6,
  md: 8,
  lg: 10,
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

function isLeadingPlacement(placement: AngleInputPlacement): boolean {
  return placement === 'top' || placement === 'left';
}

/**
 * A circular dial for choosing an angle, with an optional compact numeric input
 * (or a read-only value readout) beside it.
 *
 * The dial follows the CSS gradient convention: 0° points up and the angle
 * increases clockwise (90° = right), so the value maps straight onto
 * `linear-gradient(<angle>, …)`. Drag the dial, focus it and use the arrow
 * keys, or type into the numeric input. With `discrete` the value snaps to
 * `snap` increments on every interaction; otherwise holding <kbd>Shift</kbd>
 * while dragging snaps.
 *
 * `onChange` fires continuously; `onChangeComplete` fires on commit boundaries
 * (drag end, input blur, focus leaving the dial) for undo integration.
 *
 * @example
 * ```tsx
 * <AngleInput value={angle} onChange={setAngle} />
 *
 * // Discrete 15° dial with a read-only readout below, no editable input
 * <AngleInput
 *   value={angle}
 *   onChange={setAngle}
 *   discrete
 *   snap={15}
 *   showInput={false}
 *   showValue
 *   placement="bottom"
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
  showValue = false,
  placement = 'right',
  step = 1,
  largeStep = 15,
  snap = 15,
  discrete = false,
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
    discrete,
    disabled,
    readOnly,
  });

  // Resolve a value into range, optionally snapping to the `snap` grid, push it
  // to state, and return the resolved value (used to commit on drag end).
  const setAngle = useCallback(
    (next: number, shouldSnap = false): number => {
      const { min: lo, max: hi, snap: inc } = cfgRef.current;
      let resolved = clampOrWrap(next, lo, hi);
      if (shouldSnap && inc > 0) {
        resolved = clampOrWrap(snapAngle(resolved, inc), lo, hi);
      }
      setStateRef.current(resolved);
      return resolved;
    },
    [setStateRef, cfgRef]
  );

  const commit = useCallback(
    (explicit?: number) => {
      onChangeCompleteRef.current?.(explicit ?? angleRef.current);
    },
    [onChangeCompleteRef, angleRef]
  );

  // Geometry only — the caller decides whether to snap.
  const angleAtPointer = useCallback(
    (clientX: number, clientY: number): number | null => {
      const el = dialRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return angleFromPointer(clientX - centerX, clientY - centerY);
    },
    []
  );

  // Discrete snaps a drag unless Shift (fine); continuous snaps only on Shift.
  const dragShouldSnap = useCallback(
    (shiftKey: boolean): boolean => {
      const { discrete: isDiscrete, snap: inc } = cfgRef.current;
      if (inc <= 0) return false;
      return isDiscrete ? !shiftKey : shiftKey;
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
      const next = angleAtPointer(event.clientX, event.clientY);
      if (next !== null) setAngle(next, dragShouldSnap(event.shiftKey));
    },
    [cfgRef, angleAtPointer, setAngle, dragShouldSnap]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      const next = angleAtPointer(event.clientX, event.clientY);
      if (next !== null) setAngle(next, dragShouldSnap(event.shiftKey));
    },
    [angleAtPointer, setAngle, dragShouldSnap]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      const next = angleAtPointer(event.clientX, event.clientY);
      if (next !== null) {
        const resolved = setAngle(next, dragShouldSnap(event.shiftKey));
        commit(resolved);
      } else {
        commit();
      }
    },
    [angleAtPointer, setAngle, dragShouldSnap, commit]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const {
        disabled: isDisabled,
        readOnly: isReadOnly,
        step: s,
        largeStep: ls,
        snap: inc,
        discrete: isDiscrete,
        min: lo,
        max: hi,
      } = cfgRef.current;
      if (isDisabled || isReadOnly) return;
      const current = angleRef.current;
      // In discrete mode a plain arrow advances one snap increment.
      const stepUnit = isDiscrete ? inc : s;
      let next: number;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = current + (event.shiftKey ? ls : stepUnit);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          next = current - (event.shiftKey ? ls : stepUnit);
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
      setAngle(next, isDiscrete);
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
  const inputWidth = INPUT_WIDTH[size];

  const verticalLayout = isVerticalPlacement(placement);
  const leading = isLeadingPlacement(placement);

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
        <div className={needleStyle} />
        <div
          className={handleStyle}
          style={{ width: handleSize, height: handleSize }}
        />
      </div>
      <div className={centerStyle} />
    </div>
  );

  // The companion next to the dial is the editable input, or — when the input
  // is hidden — an optional read-only value readout.
  let companion: React.ReactNode = null;
  if (showInput) {
    companion = (
      <div className={inputWrapperStyle} style={{ width: inputWidth }}>
        <NumberInput
          value={angle}
          onChange={next => {
            setAngle(next, discrete);
          }}
          onBlur={() => {
            commit();
          }}
          min={min}
          max={max}
          step={discrete ? snap : step}
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
    );
  } else if (showValue) {
    companion = (
      <span
        className={valueTextStyle}
        aria-hidden="true"
        data-testid={testId ? `${testId}-value` : undefined}
      >
        {labels.valueText(angle)}
      </span>
    );
  }

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
        {leading ? companion : null}
        {dialNode}
        {leading ? null : companion}
      </div>
    </div>
  );
};

AngleInput.displayName = 'AngleInput';
