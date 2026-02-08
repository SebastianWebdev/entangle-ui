import React, { useState, useCallback, useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import type { Theme } from '@/theme';
import type {
  CurveEditorProps,
  CurveData,
  CurveViewport,
  TangentMode,
} from './CurveEditor.types';
import { ensureKeyframeIds } from './curveUtils';
import { CURVE_PRESETS } from './curvePresets';
import { CurveCanvas } from './CurveCanvas';
import { CurveToolbar } from './CurveToolbar';
import { useCurveInteraction } from './useCurveInteraction';

const StyledCurveEditor = styled.div<{
  $disabled: boolean;
  $width: number;
  $responsive: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: ${p => (p.$responsive ? '100%' : `${p.$width}px`)};
  border: 1px solid ${p => p.theme.colors.border.default};
  border-radius: ${p => p.theme.borderRadius.md}px;
  overflow: hidden;
  background: ${p => p.theme.colors.background.secondary};
  opacity: ${p => (p.$disabled ? 0.6 : 1)};
`;

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
  onChange,
  onChangeComplete,
  onSelectionChange,
  className,
  testId,
  id,
  style,
  ...rest
}) => {
  const theme = useTheme() as Theme;
  const effectiveCurveColor = curveColor ?? theme.colors.accent.primary;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Controlled / uncontrolled — defaults to ease-in-out
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

  // Viewport — always matches domain with padding for labels (no user zoom/pan)
  const viewport = useMemo((): CurveViewport => {
    const padding = 0.08;
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
  }, [curve.domainX, curve.domainY]);

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
    <StyledCurveEditor
      className={className}
      $disabled={disabled}
      $width={width}
      $responsive={responsive}
      data-testid={testId}
      id={id}
      style={style}
      {...rest}
    >
      {showToolbar && (
        <CurveToolbar
          selectedTangentMode={selectedTangentMode}
          onTangentModeChange={interaction.setTangentMode}
          onPresetSelect={handlePresetSelect}
          presets={allPresets}
          disabled={disabled}
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
        height={height}
        responsive={responsive}
        disabled={disabled}
        size={size}
        handlers={interaction.handlers}
        testId={testId}
      />
    </StyledCurveEditor>
  );
};

CurveEditor.displayName = 'CurveEditor';
