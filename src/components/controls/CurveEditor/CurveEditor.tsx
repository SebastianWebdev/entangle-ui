import React, { useState, useCallback, useMemo, useRef } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { vars } from '@/theme/contract.css';
import { cx } from '@/utils/cx';
import type {
  CurveEditorProps,
  CurveData,
  CurveViewport,
  TangentMode,
} from './CurveEditor.types';
import { ensureKeyframeIds, evaluateCurve } from './curveUtils';
import { CURVE_PRESETS } from './curvePresets';
import { CurveCanvas } from './CurveCanvas';
import { CurveToolbar } from './CurveToolbar';
import { useCurveInteraction } from './useCurveInteraction';
import {
  curveEditorRecipe,
  editorWidthVar,
  bottomBarStyle,
} from './CurveEditor.css';

export const CurveEditor: React.FC<CurveEditorProps> = ({
  value,
  defaultValue,
  width = 320,
  height = 200,
  responsive = false,
  showToolbar = true,
  showGrid = true,
  gridSubdivisions = 4,
  showAxisLabels = true,
  allowAdd = true,
  allowDelete = true,
  maxKeyframes = Infinity,
  lockEndpoints = true,
  minKeyframeDistance = 0.001,
  clampY = true,
  snapToGrid = false,
  precision = 3,
  labelX,
  labelY,
  presets: userPresets,
  size = 'md',
  disabled = false,
  readOnly = false,
  curveColor,
  curveWidth = 2,
  renderBackground,
  renderBottomBar,
  lockTangents = false,
  onChange,
  onChangeComplete,
  onSelectionChange,
  className,
  testId,
  id,
  style,
  ...rest
}) => {
  // For curveColor fallback, use the CSS variable reference directly.
  // At runtime, getComputedStyle on the canvas element will resolve it.
  // We pass the raw CSS var reference string which will be resolved by the canvas renderer.
  const effectiveCurveColor = curveColor ?? vars.colors.accent.primary;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Controlled / uncontrolled -- defaults to ease-in-out
  const [internalValue, setInternalValue] = useState<CurveData>(() => {
    const easeInOut = CURVE_PRESETS.find(p => p.id === 'ease-in-out');
    const initial = defaultValue ??
      easeInOut?.curve ??
      CURVE_PRESETS[0]?.curve ?? {
        keyframes: [],
        domainX: [0, 1] as [number, number],
        domainY: [0, 1] as [number, number],
      };
    return { ...initial, keyframes: ensureKeyframeIds(initial.keyframes) };
  });

  const isControlled = value !== undefined;
  const curve = useMemo(() => {
    const c = isControlled ? value : internalValue;
    return { ...c, keyframes: ensureKeyframeIds(c.keyframes) };
  }, [isControlled, value, internalValue]);

  const handleChange = useCallback(
    (newCurve: CurveData) => {
      if (!isControlled) {
        setInternalValue(newCurve);
      }
      onChange?.(newCurve);
    },
    [isControlled, onChange]
  );

  const handleChangeComplete = useCallback(
    (newCurve: CurveData) => {
      onChangeComplete?.(newCurve);
    },
    [onChangeComplete]
  );

  // Viewport -- always matches domain with padding for labels (no user zoom/pan)
  const viewport = useMemo((): CurveViewport => {
    const axisName = labelX ?? labelY;
    const hasAxisNames = Boolean(axisName);
    const padding = hasAxisNames && showAxisLabels ? 0.12 : 0.08;
    const [dxMin, dxMax] = curve.domainX;
    const [dyMin, dyMax] = curve.domainY;
    const xPad = (dxMax - dxMin) * padding;
    const yPad = (dyMax - dyMin) * padding;
    return {
      viewX: [dxMin - xPad, dxMax + xPad] as [number, number],
      viewY: [dyMin - yPad, dyMax + yPad] as [number, number],
      zoom: 1,
      panX: 0,
      panY: 0,
    };
  }, [curve.domainX, curve.domainY, labelX, labelY, showAxisLabels]);

  // Merge presets
  const allPresets = useMemo(
    () => (userPresets ? [...CURVE_PRESETS, ...userPresets] : CURVE_PRESETS),
    [userPresets]
  );

  // Interaction hook
  const interaction = useCurveInteraction({
    curve,
    viewport,
    canvasRef,
    disabled,
    readOnly,
    allowAdd,
    allowDelete,
    maxKeyframes,
    lockEndpoints,
    lockTangents,
    clampY,
    snapToGrid,
    gridSubdivisions,
    minKeyframeDistance,
    precision,
    onChange: handleChange,
    onChangeComplete: handleChangeComplete,
    onSelectionChange,
  });

  // Compute tangent mode for selected keyframes (null if mixed or none selected)
  const selectedTangentMode = useMemo((): TangentMode | null => {
    if (interaction.selectedIds.size === 0) return null;

    let mode: TangentMode | null = null;
    for (const kf of curve.keyframes) {
      if (kf.id && interaction.selectedIds.has(kf.id)) {
        if (mode === null) {
          mode = kf.tangentMode;
        } else if (mode !== kf.tangentMode) {
          return null; // Mixed modes
        }
      }
    }
    return mode;
  }, [curve.keyframes, interaction.selectedIds]);

  const handlePresetSelect = useCallback(
    (preset: { curve: CurveData }) => {
      const newCurve = {
        ...preset.curve,
        keyframes: ensureKeyframeIds(preset.curve.keyframes),
      };
      handleChange(newCurve);
      handleChangeComplete(newCurve);
    },
    [handleChange, handleChangeComplete]
  );

  return (
    <div
      className={cx(curveEditorRecipe({ disabled, responsive }), className)}
      style={{
        ...style,
        ...(!responsive
          ? assignInlineVars({ [editorWidthVar]: `${width}px` })
          : {}),
      }}
      data-testid={testId}
      id={id}
      {...rest}
    >
      {showToolbar && (
        <CurveToolbar
          selectedTangentMode={selectedTangentMode}
          onTangentModeChange={interaction.setTangentMode}
          onPresetSelect={handlePresetSelect}
          presets={allPresets}
          disabled={disabled}
          lockTangents={lockTangents}
          size={size}
          testId={testId}
        />
      )}
      <CurveCanvas
        canvasRef={canvasRef}
        curve={curve}
        viewport={viewport}
        showGrid={showGrid}
        gridSubdivisions={gridSubdivisions}
        showAxisLabels={showAxisLabels}
        labelX={labelX}
        labelY={labelY}
        curveColor={effectiveCurveColor}
        curveWidth={curveWidth}
        renderBackground={renderBackground}
        selectedIds={interaction.selectedIds}
        hoveredElement={interaction.hoveredElement}
        selectionBox={interaction.selectionBox}
        isDragging={interaction.isDragging}
        lockTangents={lockTangents}
        height={height}
        responsive={responsive}
        disabled={disabled}
        size={size}
        handlers={interaction.handlers}
        testId={testId}
      />
      {renderBottomBar && (
        <div
          className={bottomBarStyle}
          data-testid={testId ? `${testId}-bottom-bar` : undefined}
        >
          {renderBottomBar({
            curve,
            selectedIds: Array.from(interaction.selectedIds),
            selectedKeyframes: curve.keyframes.filter(
              kf => kf.id && interaction.selectedIds.has(kf.id)
            ),
            evaluate: (x: number) => evaluateCurve(curve, x),
            disabled,
            readOnly,
          })}
        </div>
      )}
    </div>
  );
};

CurveEditor.displayName = 'CurveEditor';
