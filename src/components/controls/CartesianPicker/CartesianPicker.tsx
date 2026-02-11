import React, { useState, useCallback, useMemo, useRef } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { cx } from '@/utils/cx';
import { roundToPrecision } from '@/utils/mathUtils';
import type { Point2D, CanvasViewport } from '@/components/primitives/canvas';
import { CanvasContainer } from '@/components/primitives/canvas';
import type { CartesianPickerProps } from './CartesianPicker.types';
import { useCartesianInteraction } from './useCartesianInteraction';
import { useCartesianRenderer } from './useCartesianRenderer';
import {
  cartesianPickerRecipe,
  pickerWidthVar,
  bottomBarStyle,
} from './CartesianPicker.css';

export const CartesianPicker: React.FC<CartesianPickerProps> = ({
  value,
  defaultValue,
  domainX = [-1, 1],
  domainY = [-1, 1],
  showGrid = true,
  gridSubdivisions = 4,
  showAxisLabels = true,
  showOriginAxes = true,
  showCrosshair = true,
  crosshairStyle = 'dashed',
  labelX,
  labelY,
  markerRadius = 6,
  snapToGrid = false,
  step,
  clampToRange = true,
  precision = 2,
  width = 200,
  height = 200,
  responsive = false,
  disabled = false,
  readOnly = false,
  onChange,
  onChangeComplete,
  renderBackground,
  renderBottomBar,
  className,
  testId,
  id,
  style,
  ...rest
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Controlled / uncontrolled
  const [internalValue, setInternalValue] = useState<Point2D>(
    () => defaultValue ?? { x: 0, y: 0 }
  );

  const isControlled = value !== undefined;
  const currentPoint = useMemo(
    () => (isControlled ? value : internalValue),
    [isControlled, value, internalValue]
  );

  const handleChange = useCallback(
    (newPoint: Point2D) => {
      if (!isControlled) {
        setInternalValue(newPoint);
      }
      onChange?.(newPoint);
    },
    [isControlled, onChange]
  );

  const handleChangeComplete = useCallback(
    (newPoint: Point2D) => {
      onChangeComplete?.(newPoint);
    },
    [onChangeComplete]
  );

  // Viewport with padding
  const viewport = useMemo((): CanvasViewport => {
    const hasAxisNames = Boolean(labelX ?? labelY);
    const padding = hasAxisNames && showAxisLabels ? 0.12 : 0.08;
    const [dxMin, dxMax] = domainX;
    const [dyMin, dyMax] = domainY;
    const xPad = (dxMax - dxMin) * padding;
    const yPad = (dyMax - dyMin) * padding;
    return {
      viewX: [dxMin - xPad, dxMax + xPad],
      viewY: [dyMin - yPad, dyMax + yPad],
    };
  }, [domainX, domainY, labelX, labelY, showAxisLabels]);

  // Interaction hook
  const interaction = useCartesianInteraction({
    point: currentPoint,
    viewport,
    canvasRef,
    domainX,
    domainY,
    disabled,
    readOnly,
    clampToRange,
    snapToGrid,
    gridSubdivisions,
    step,
    precision,
    onChange: handleChange,
    onChangeComplete: handleChangeComplete,
  });

  // Renderer hook
  useCartesianRenderer({
    canvasRef,
    point: currentPoint,
    viewport,
    domainX,
    domainY,
    showGrid,
    gridSubdivisions,
    showAxisLabels,
    showOriginAxes,
    showCrosshair,
    crosshairStyle,
    labelX,
    labelY,
    markerRadius,
    disabled,
    isHovered: interaction.isHovered,
    isDragging: interaction.isDragging,
    renderBackground,
  });

  // ARIA description
  const ariaDescription = `2D point picker, current value X: ${roundToPrecision(currentPoint.x, precision)}, Y: ${roundToPrecision(currentPoint.y, precision)}`;

  // Live announcement
  const liveAnnouncement = `X: ${roundToPrecision(currentPoint.x, precision)}, Y: ${roundToPrecision(currentPoint.y, precision)}`;

  return (
    <div
      className={cx(
        cartesianPickerRecipe({ disabled, responsive }),
        className
      )}
      style={{
        ...style,
        ...(!responsive
          ? assignInlineVars({ [pickerWidthVar]: `${width}px` })
          : {}),
      }}
      data-testid={testId}
      id={id}
      {...rest}
    >
      <CanvasContainer
        canvasRef={canvasRef}
        height={height}
        responsive={responsive}
        disabled={disabled}
        ariaLabel="Cartesian point picker"
        ariaRoledescription={ariaDescription}
        liveAnnouncement={liveAnnouncement}
        handlers={interaction.handlers}
        testId={testId ? `${testId}-canvas` : undefined}
      />
      {renderBottomBar && (
        <div
          className={bottomBarStyle}
          data-testid={testId ? `${testId}-bottom-bar` : undefined}
        >
          {renderBottomBar({
            point: currentPoint,
            disabled,
            readOnly,
            isDragging: interaction.isDragging,
            domainX,
            domainY,
          })}
        </div>
      )}
    </div>
  );
};

CartesianPicker.displayName = 'CartesianPicker';
