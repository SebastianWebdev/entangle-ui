'use client';

import React, { useCallback, useMemo, useState } from 'react';

import { AngleInput } from '@/components/controls/AngleInput/AngleInput';
import { ColorPicker } from '@/components/controls/ColorPicker/ColorPicker';
import { CopyIcon } from '@/components/Icons/CopyIcon';
import { SegmentedControl } from '@/components/navigation/SegmentedControl/SegmentedControl';
import { SegmentedControlItem } from '@/components/navigation/SegmentedControl/SegmentedControlItem';
import { IconButton } from '@/components/primitives/IconButton/IconButton';
import { useClipboard, useControlledState, useLatest } from '@/hooks';
import { cx } from '@/utils/cx';

import {
  rootStyle,
  rootDisabledStyle,
  previewStyle,
  previewFillStyle,
  stopsRowStyle,
  stopsFillStyle,
  cssOutputRowStyle,
  cssOutputCodeStyle,
  inlineColorEditorStyle,
} from './GradientEditor.css';
import { GradientStopGrid } from './GradientStopGrid';
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
  GradientStop,
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
  swatchFormat = 'hex',
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

  // Builds a ColorPicker bound to a specific stop — reused by the inline editor
  // (selected stop) and by each card's popover in the stops grid.
  const renderColorPickerFor = useCallback(
    (stop: GradientStop) => (
      <ColorPicker
        inline
        value={stop.color}
        format="rgba"
        showAlpha={showAlpha}
        disabled={disabled}
        pickerWidth={width - 24}
        onChange={color => {
          handleColorChange(stop.id, color);
        }}
        onChangeComplete={handleCommitCurrent}
        testId={testId ? `${testId}-color-picker` : undefined}
      />
    ),
    [showAlpha, disabled, width, handleColorChange, handleCommitCurrent, testId]
  );

  return (
    <div
      className={cx(rootStyle, disabled && rootDisabledStyle, className)}
      style={{ width, ...style }}
      data-testid={testId}
      {...rest}
    >
      {/* Type toggle — top of the editor, above the preview */}
      {types.length > 1 && (
        <SegmentedControl
          size={size}
          value={gradient.type}
          onChange={handleTypeChange}
          disabled={disabled}
          fullWidth
          aria-label="Gradient type"
        >
          {types.map(type => (
            <SegmentedControlItem key={type} value={type}>
              {TYPE_LABELS[type]}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      )}

      {/* Live preview */}
      <div className={previewStyle}>
        <div
          className={previewFillStyle}
          style={{ background: cssString }}
          data-testid={testId ? `${testId}-preview` : undefined}
        />
      </div>

      {/* Stops ramp + angle dial — one row, angle on the right */}
      <div className={stopsRowStyle}>
        <div className={stopsFillStyle}>
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
        </div>

        {/* Angle (linear / conic only) */}
        {showAngle && angleEnabled && (
          <AngleInput
            value={gradient.angle}
            onChange={handleAngleChange}
            onChangeComplete={handleCommitCurrent}
            size={size}
            disabled={disabled}
            showInput={false}
            showValue
            aria-label="Gradient angle"
            testId={testId ? `${testId}-angle` : undefined}
          />
        )}
      </div>

      {/* All stops as a grid of color cards (swatch + value + position + delete) */}
      <GradientStopGrid
        stops={gradient.stops}
        selectedId={selectedStop?.id ?? null}
        colorEditor={colorEditor}
        swatchFormat={swatchFormat}
        disabled={disabled}
        canDelete={gradient.stops.length > minStops}
        width={width}
        renderColorEditor={renderColorPickerFor}
        onDeleteStop={handleDeleteStop}
        onSelectStop={selectStop}
        testId={testId}
      />

      {/* Shared inline color editor for the selected stop */}
      {colorEditor === 'inline' && selectedStop && (
        <div className={inlineColorEditorStyle}>
          {renderColorPickerFor(selectedStop)}
        </div>
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
