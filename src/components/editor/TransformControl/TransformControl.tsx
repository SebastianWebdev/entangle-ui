'use client';

import React, { useCallback, useMemo } from 'react';
import { cx } from '@/utils/cx';
import { useControlledState } from '@/hooks/useControlledState';
import { VectorInput } from '@/components/controls/VectorInput';
import { Select } from '@/components/controls/Select';
import { LockIcon } from '@/components/Icons/LockIcon';
import { UnlockIcon } from '@/components/Icons/UnlockIcon';
import { PropertyRow } from '../PropertyInspector/PropertyRow';
import type {
  CoordinateSpace,
  CoordinateSpaceOption,
  TransformControlProps,
  TransformValue,
  Vec3,
} from './TransformControl.types';
import {
  lockButtonRecipe,
  scaleRowInner,
  scaleVectorWrapper,
  transformRoot,
} from './TransformControl.css';

// --- Defaults ---

const DEFAULT_TRANSFORM: TransformValue = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};

const DEFAULT_COORDINATE_SPACE_OPTIONS: CoordinateSpaceOption[] = [
  { value: 'local', label: 'Local' },
  { value: 'world', label: 'World' },
  { value: 'parent', label: 'Parent' },
];

const DEFAULT_LABELS = {
  position: 'Position',
  rotation: 'Rotation',
  scale: 'Scale',
  coordinateSpace: 'Space',
} as const;

const DEFAULT_PRECISION = { position: 3, rotation: 1, scale: 3 } as const;
const DEFAULT_STEP = { position: 0.1, rotation: 1, scale: 0.01 } as const;
const DEFAULT_UNITS = { position: 'm', rotation: '°', scale: '' } as const;

// --- Helpers ---

const vecToArray = (v: Vec3): number[] => [v.x, v.y, v.z];

const arrayToVec = (arr: number[]): Vec3 => ({
  x: arr[0] ?? 0,
  y: arr[1] ?? 0,
  z: arr[2] ?? 0,
});

// --- Component ---

/**
 * The canonical position / rotation / scale property control for 3D
 * editor interfaces. Composes `VectorInput` (per row) with `Select`
 * (coordinate space) and `PropertyRow` (layout) into one high-level
 * component, mirroring the transform widget found in Blender, Unity and
 * Unreal.
 *
 * Three independent atoms — `value`, `coordinateSpace`, `linkedScale` —
 * each support controlled and uncontrolled usage.
 *
 * Changing the coordinate-space dropdown does NOT transform the numeric
 * values. The component is purely a UI surface; the consumer's editor
 * logic is responsible for re-projecting values when the space changes.
 *
 * The component intentionally renders no `PropertySection` wrapper — slot
 * it inside an existing section in your panel.
 *
 * @example
 * ```tsx
 * <PropertySection title="Transform">
 *   <TransformControl
 *     value={transform}
 *     onChange={setTransform}
 *     showReset
 *   />
 * </PropertySection>
 * ```
 */
export const TransformControl: React.FC<TransformControlProps> = ({
  value: valueProp,
  defaultValue,
  onChange,
  coordinateSpace: coordinateSpaceProp,
  defaultCoordinateSpace,
  onCoordinateSpaceChange,
  coordinateSpaceOptions,
  linkedScale: linkedScaleProp,
  defaultLinkedScale,
  onLinkedScaleChange,
  show,
  labels,
  precision,
  step,
  units,
  size = 'sm',
  disabled = false,
  showReset = false,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const [value, setValue] = useControlledState<TransformValue>({
    value: valueProp,
    defaultValue,
    onChange,
    fallback: DEFAULT_TRANSFORM,
  });

  const [coordinateSpace, setCoordinateSpace] =
    useControlledState<CoordinateSpace>({
      value: coordinateSpaceProp,
      defaultValue: defaultCoordinateSpace,
      onChange: onCoordinateSpaceChange,
      fallback: 'local',
    });

  const [linkedScale, setLinkedScale] = useControlledState<boolean>({
    value: linkedScaleProp,
    defaultValue: defaultLinkedScale,
    onChange: onLinkedScaleChange,
    fallback: true,
  });

  const showPosition = show?.position !== false;
  const showRotation = show?.rotation !== false;
  const showScale = show?.scale !== false;
  const showCoordinateSpace = showPosition || showRotation;

  const resolvedLabels = {
    position: labels?.position ?? DEFAULT_LABELS.position,
    rotation: labels?.rotation ?? DEFAULT_LABELS.rotation,
    scale: labels?.scale ?? DEFAULT_LABELS.scale,
    coordinateSpace: labels?.coordinateSpace ?? DEFAULT_LABELS.coordinateSpace,
  };

  const resolvedPrecision = {
    position: precision?.position ?? DEFAULT_PRECISION.position,
    rotation: precision?.rotation ?? DEFAULT_PRECISION.rotation,
    scale: precision?.scale ?? DEFAULT_PRECISION.scale,
  };

  const resolvedStep = {
    position: step?.position ?? DEFAULT_STEP.position,
    rotation: step?.rotation ?? DEFAULT_STEP.rotation,
    scale: step?.scale ?? DEFAULT_STEP.scale,
  };

  const resolvedUnits = {
    position: units?.position ?? DEFAULT_UNITS.position,
    rotation: units?.rotation ?? DEFAULT_UNITS.rotation,
    scale: units?.scale ?? DEFAULT_UNITS.scale,
  };

  const resolvedSpaceOptions = useMemo(
    () => coordinateSpaceOptions ?? DEFAULT_COORDINATE_SPACE_OPTIONS,
    [coordinateSpaceOptions]
  );

  // --- Per-row change handlers ---

  const handlePositionChange = useCallback(
    (next: number[]) => {
      setValue(prev => ({ ...prev, position: arrayToVec(next) }));
    },
    [setValue]
  );

  const handleRotationChange = useCallback(
    (next: number[]) => {
      setValue(prev => ({ ...prev, rotation: arrayToVec(next) }));
    },
    [setValue]
  );

  const handleScaleChange = useCallback(
    (next: number[], axisIndex: number) => {
      const nextScale = arrayToVec(next);
      if (linkedScale) {
        const v = next[axisIndex] ?? 0;
        setValue(prev => ({ ...prev, scale: { x: v, y: v, z: v } }));
      } else {
        setValue(prev => ({ ...prev, scale: nextScale }));
      }
    },
    [linkedScale, setValue]
  );

  const handleLockToggle = useCallback(() => {
    setLinkedScale(prev => !prev);
  }, [setLinkedScale]);

  const handleSpaceChange = useCallback(
    (next: string | null) => {
      if (next == null) return;
      setCoordinateSpace(next);
    },
    [setCoordinateSpace]
  );

  // --- Reset handlers ---

  const handlePositionReset = useCallback(() => {
    setValue(prev => ({ ...prev, position: { x: 0, y: 0, z: 0 } }));
  }, [setValue]);

  const handleRotationReset = useCallback(() => {
    setValue(prev => ({ ...prev, rotation: { x: 0, y: 0, z: 0 } }));
  }, [setValue]);

  const handleScaleReset = useCallback(() => {
    setValue(prev => ({ ...prev, scale: { x: 1, y: 1, z: 1 } }));
  }, [setValue]);

  // --- Render ---

  return (
    <div
      ref={ref}
      className={cx(transformRoot, className)}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {showCoordinateSpace && (
        <PropertyRow
          label={resolvedLabels.coordinateSpace}
          size={size}
          disabled={disabled}
        >
          <Select
            value={coordinateSpace}
            options={resolvedSpaceOptions}
            onChange={handleSpaceChange}
            size={size}
            disabled={disabled}
            aria-label={resolvedLabels.coordinateSpace}
          />
        </PropertyRow>
      )}

      {showPosition && (
        <PropertyRow
          label={resolvedLabels.position}
          size={size}
          disabled={disabled}
          onReset={showReset ? handlePositionReset : undefined}
        >
          <VectorInput
            value={vecToArray(value.position)}
            onChange={handlePositionChange}
            dimension={3}
            labelPreset="xyz"
            colorPreset="spatial"
            precision={resolvedPrecision.position}
            step={resolvedStep.position}
            unit={resolvedUnits.position}
            size={size}
            disabled={disabled}
            aria-label={resolvedLabels.position}
          />
        </PropertyRow>
      )}

      {showRotation && (
        <PropertyRow
          label={resolvedLabels.rotation}
          size={size}
          disabled={disabled}
          onReset={showReset ? handleRotationReset : undefined}
        >
          <VectorInput
            value={vecToArray(value.rotation)}
            onChange={handleRotationChange}
            dimension={3}
            labelPreset="xyz"
            colorPreset="spatial"
            precision={resolvedPrecision.rotation}
            step={resolvedStep.rotation}
            unit={resolvedUnits.rotation}
            size={size}
            disabled={disabled}
            aria-label={resolvedLabels.rotation}
          />
        </PropertyRow>
      )}

      {showScale && (
        <PropertyRow
          label={resolvedLabels.scale}
          size={size}
          disabled={disabled}
          onReset={showReset ? handleScaleReset : undefined}
        >
          <div className={scaleRowInner}>
            <button
              type="button"
              className={lockButtonRecipe({ active: linkedScale, size })}
              onClick={handleLockToggle}
              disabled={disabled}
              aria-pressed={linkedScale}
              aria-label={linkedScale ? 'Unlink scale axes' : 'Link scale axes'}
              title={linkedScale ? 'Linked scale' : 'Unlinked scale'}
              data-testid="transform-scale-lock"
            >
              {linkedScale ? (
                <LockIcon size={size} decorative />
              ) : (
                <UnlockIcon size={size} decorative />
              )}
            </button>
            <div className={scaleVectorWrapper}>
              <VectorInput
                value={vecToArray(value.scale)}
                onChange={handleScaleChange}
                dimension={3}
                labelPreset="xyz"
                colorPreset="spatial"
                precision={resolvedPrecision.scale}
                step={resolvedStep.scale}
                unit={resolvedUnits.scale}
                size={size}
                disabled={disabled}
                aria-label={resolvedLabels.scale}
              />
            </div>
          </div>
        </PropertyRow>
      )}
    </div>
  );
};

TransformControl.displayName = 'TransformControl';
