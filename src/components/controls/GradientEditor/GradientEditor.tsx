'use client';

import React, { useCallback, useMemo, useState } from 'react';

import { ColorPicker } from '@/components/controls/ColorPicker/ColorPicker';
import { NumberInput } from '@/components/controls/NumberInput/NumberInput';
import { CopyIcon } from '@/components/Icons/CopyIcon';
import { TrashIcon } from '@/components/Icons/TrashIcon';
import { SegmentedControl } from '@/components/navigation/SegmentedControl/SegmentedControl';
import { SegmentedControlItem } from '@/components/navigation/SegmentedControl/SegmentedControlItem';
import { IconButton } from '@/components/primitives/IconButton/IconButton';
import { Popover } from '@/components/primitives/Popover/Popover';
import { PopoverContent } from '@/components/primitives/Popover/PopoverContent';
import { PopoverTrigger } from '@/components/primitives/Popover/PopoverTrigger';
import { useClipboard, useControlledState, useLatest } from '@/hooks';
import { cx } from '@/utils/cx';

import {
  rootStyle,
  rootDisabledStyle,
  previewStyle,
  previewFillStyle,
  controlsRowStyle,
  angleFieldStyle,
  angleLabelStyle,
  stopActionsRowStyle,
  cssOutputRowStyle,
  cssOutputCodeStyle,
  inlineColorEditorStyle,
} from './GradientEditor.css';
import { GradientStops } from './GradientStops';
import {
  addStopAt,
  createDefaultGradient,
  formatGradientCSS,
  normalizeGradient,
  sortStops,
} from './gradientUtils';

import type {
  GradientData,
  GradientEditorProps,
  GradientType,
} from './GradientEditor.types';

const TYPE_LABELS: Record<GradientType, string> = {
  linear: 'Linear',
  radial: 'Radial',
  conic: 'Conic',
};

export const GradientEditor = ({
  value,
  defaultValue,
  width = 280,
  types = ['linear', 'radial', 'conic'],
  colorEditor = 'popover',
  showAlpha = true,
  showAngle = true,
  showCssOutput = true,
  maxStops = 16,
  minStops = 2,
  size = 'md',
  disabled = false,
  onChange,
  onChangeComplete,
  onSelectionChange,
  className,
  style,
  testId,
  ...rest
}: GradientEditorProps): React.ReactElement => {
  const [gradient, setGradient] = useControlledState<GradientData>({
    value: value ? normalizeGradient(value) : undefined,
    defaultValue: defaultValue ? normalizeGradient(defaultValue) : undefined,
    onChange,
    fallback: useMemo(() => createDefaultGradient(), []),
  });

  const [selectedId, setSelectedId] = useState<string | null>(
    () => gradient.stops[0]?.id ?? null
  );

  const onChangeCompleteRef = useLatest(onChangeComplete);
  const onSelectionChangeRef = useLatest(onSelectionChange);
  const { copy, status: copyStatus } = useClipboard();

  // Selected stop, falling back to the first stop if the selection is stale.
  const selectedStop =
    gradient.stops.find(stop => stop.id === selectedId) ?? gradient.stops[0];

  const commit = useCallback(
    (next: GradientData) => {
      onChangeCompleteRef.current?.(next);
    },
    [onChangeCompleteRef]
  );

  const selectStop = useCallback(
    (id: string) => {
      setSelectedId(id);
      onSelectionChangeRef.current?.(id);
    },
    [onSelectionChangeRef]
  );

  const handleMoveStop = useCallback(
    (id: string, position: number) => {
      setGradient(prev =>
        normalizeGradient({
          ...prev,
          stops: prev.stops.map(stop =>
            stop.id === id ? { ...stop, position } : stop
          ),
        })
      );
    },
    [setGradient]
  );

  const handleColorChange = useCallback(
    (id: string, color: string) => {
      setGradient(prev => ({
        ...prev,
        stops: prev.stops.map(stop =>
          stop.id === id ? { ...stop, color } : stop
        ),
      }));
    },
    [setGradient]
  );

  const handleAddStop = useCallback(
    (position: number) => {
      if (gradient.stops.length >= maxStops) return;
      const { data, id } = addStopAt(gradient, position);
      setGradient(data);
      selectStop(id);
      commit(data);
    },
    [gradient, maxStops, setGradient, selectStop, commit]
  );

  const handleDeleteStop = useCallback(
    (id: string) => {
      if (gradient.stops.length <= minStops) return;
      const next = normalizeGradient({
        ...gradient,
        stops: gradient.stops.filter(stop => stop.id !== id),
      });
      setGradient(next);
      if (selectedId === id) {
        const fallback = next.stops[0]?.id ?? null;
        setSelectedId(fallback);
        onSelectionChangeRef.current?.(fallback);
      }
      commit(next);
    },
    [gradient, minStops, selectedId, setGradient, commit, onSelectionChangeRef]
  );

  const handleCommitCurrent = useCallback(() => {
    commit(gradient);
  }, [commit, gradient]);

  const handleTypeChange = useCallback(
    (nextType: string) => {
      const next: GradientData = {
        ...gradient,
        type: nextType as GradientType,
      };
      setGradient(next);
      commit(next);
    },
    [gradient, setGradient, commit]
  );

  const handleAngleChange = useCallback(
    (angle: number) => {
      setGradient(prev => ({ ...prev, angle }));
    },
    [setGradient]
  );

  const cssString = useMemo(() => formatGradientCSS(gradient), [gradient]);

  const angleEnabled = gradient.type === 'linear' || gradient.type === 'conic';

  const colorPicker = selectedStop ? (
    <ColorPicker
      inline
      value={selectedStop.color}
      format="rgba"
      showAlpha={showAlpha}
      disabled={disabled}
      pickerWidth={width - 24}
      onChange={color => {
        handleColorChange(selectedStop.id, color);
      }}
      onChangeComplete={handleCommitCurrent}
      testId={testId ? `${testId}-color-picker` : undefined}
    />
  ) : null;

  return (
    <div
      className={cx(rootStyle, disabled && rootDisabledStyle, className)}
      style={{ width, ...style }}
      data-testid={testId}
      {...rest}
    >
      {/* Live preview */}
      <div className={previewStyle}>
        <div
          className={previewFillStyle}
          style={{ background: cssString }}
          data-testid={testId ? `${testId}-preview` : undefined}
        />
      </div>

      {/* Stops track */}
      <GradientStops
        stops={gradient.stops}
        selectedId={selectedStop?.id ?? null}
        disabled={disabled}
        canAdd={gradient.stops.length < maxStops}
        canDelete={gradient.stops.length > minStops}
        onMoveStop={handleMoveStop}
        onAddStop={handleAddStop}
        onDeleteStop={handleDeleteStop}
        onSelectStop={selectStop}
        onCommit={handleCommitCurrent}
      />

      {/* Type + angle controls */}
      <div className={controlsRowStyle}>
        {types.length > 1 && (
          <SegmentedControl
            size={size}
            value={gradient.type}
            onChange={handleTypeChange}
            disabled={disabled}
            aria-label="Gradient type"
          >
            {types.map(type => (
              <SegmentedControlItem key={type} value={type}>
                {TYPE_LABELS[type]}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        )}

        {showAngle && angleEnabled && (
          <div className={angleFieldStyle}>
            <span className={angleLabelStyle}>Angle</span>
            <NumberInput
              value={gradient.angle}
              onChange={handleAngleChange}
              onBlur={handleCommitCurrent}
              min={0}
              max={360}
              step={1}
              precision={0}
              unit="°"
              size={size}
              disabled={disabled}
              testId={testId ? `${testId}-angle` : undefined}
            />
          </div>
        )}
      </div>

      {/* Selected-stop color editing */}
      {colorEditor === 'inline' ? (
        <div className={inlineColorEditorStyle}>{colorPicker}</div>
      ) : (
        selectedStop && (
          <div className={stopActionsRowStyle}>
            <Popover>
              <PopoverTrigger>
                <IconButton
                  size={size}
                  variant="default"
                  aria-label="Edit stop color"
                  disabled={disabled}
                  testId={testId ? `${testId}-edit-color` : undefined}
                >
                  <span
                    style={{
                      display: 'block',
                      width: '60%',
                      height: '60%',
                      borderRadius: 2,
                      backgroundColor: selectedStop.color,
                    }}
                  />
                </IconButton>
              </PopoverTrigger>
              <PopoverContent width={width} padding="md">
                {colorPicker}
              </PopoverContent>
            </Popover>
            <IconButton
              size={size}
              variant="ghost"
              aria-label="Delete stop"
              disabled={disabled || gradient.stops.length <= minStops}
              onClick={() => {
                handleDeleteStop(selectedStop.id);
              }}
              testId={testId ? `${testId}-delete` : undefined}
            >
              <TrashIcon />
            </IconButton>
          </div>
        )
      )}

      {/* CSS output */}
      {showCssOutput && (
        <div className={cssOutputRowStyle}>
          <code
            className={cssOutputCodeStyle}
            title={cssString}
            data-testid={testId ? `${testId}-css` : undefined}
          >
            {cssString}
          </code>
          <IconButton
            size={size}
            variant="ghost"
            aria-label={copyStatus === 'copied' ? 'Copied' : 'Copy CSS'}
            disabled={disabled}
            onClick={() => void copy(cssString)}
            testId={testId ? `${testId}-copy` : undefined}
          >
            <CopyIcon />
          </IconButton>
        </div>
      )}
    </div>
  );
};

GradientEditor.displayName = 'GradientEditor';

// Re-exported as a stable reference so consumers can build their own stops.
export { sortStops };
