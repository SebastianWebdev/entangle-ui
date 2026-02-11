'use client';

import React, { useRef, useMemo } from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { cx } from '@/utils/cx';
import type { ViewportGizmoProps } from './ViewportGizmo.types';
import { useGizmoRenderer, AXIS_COLORS } from './useGizmoRenderer';
import { useGizmoInteraction } from './useGizmoInteraction';
import {
  gizmoWrapperRecipe,
  gizmoCanvasStyle,
  gizmoDiameterVar,
  ariaLiveRegionStyle,
} from './ViewportGizmo.css';

const DEFAULT_LABELS: Record<string, string> = { x: 'X', y: 'Y', z: 'Z' };
const DEFAULT_VISIBLE: Record<string, boolean> = { x: true, y: true, z: true };

export const ViewportGizmo: React.FC<ViewportGizmoProps> = ({
  orientation,
  upAxis = 'y-up',
  axisColorPreset = 'blender',
  axisConfig,
  showLabels = true,
  showNegativeAxes = true,
  showOrbitRing = true,
  showOriginHandle = true,
  background = 'subtle',
  interactionMode = 'full',
  orbitSpeed = 1,
  constrainPitch = true,
  onOrbit,
  onOrbitEnd,
  onSnapToView,
  onAxisClick,
  onOriginClick,
  diameter = 120,
  size = 'md',
  disabled = false,
  className,
  testId,
  id,
  style,
  ...rest
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resolve axis colors from preset or custom config
  const axisColors = useMemo((): Record<string, string> => {
    if (axisColorPreset === 'custom' && axisConfig) {
      return {
        x: axisConfig[0].color ?? '#E63946',
        y: axisConfig[1].color ?? '#6AA84F',
        z: axisConfig[2].color ?? '#4A86C8',
      };
    }
    return { ...AXIS_COLORS };
  }, [axisColorPreset, axisConfig]);

  const axisLabels = useMemo((): Record<string, string> => {
    if (axisConfig) {
      return {
        x: axisConfig[0].label ?? 'X',
        y: axisConfig[1].label ?? 'Y',
        z: axisConfig[2].label ?? 'Z',
      };
    }
    return DEFAULT_LABELS;
  }, [axisConfig]);

  const axisVisible = useMemo((): Record<string, boolean> => {
    if (axisConfig) {
      return {
        x: axisConfig[0].visible ?? true,
        y: axisConfig[1].visible ?? true,
        z: axisConfig[2].visible ?? true,
      };
    }
    return DEFAULT_VISIBLE;
  }, [axisConfig]);

  // Interaction
  const interaction = useGizmoInteraction({
    orientation,
    canvasRef,
    diameter,
    upAxis,
    interactionMode,
    orbitSpeed,
    constrainPitch,
    disabled,
    onOrbit,
    onOrbitEnd,
    onSnapToView,
    onAxisClick,
    onOriginClick,
  });

  // Renderer
  useGizmoRenderer({
    canvasRef,
    orientation,
    diameter,
    upAxis,
    size,
    axisColors,
    axisLabels,
    axisVisible,
    showLabels,
    showNegativeAxes,
    showOrbitRing,
    showOriginHandle,
    background,
    disabled,
    isDragging: interaction.isDragging,
    hoveredRegion: interaction.hoveredRegion,
  });

  // ARIA
  const ariaDescription = `3D orientation gizmo, yaw: ${Math.round(orientation.yaw)}deg, pitch: ${Math.round(orientation.pitch)}deg`;

  return (
    <div
      className={cx(gizmoWrapperRecipe({ background, disabled }), className)}
      style={{
        ...style,
        ...assignInlineVars({ [gizmoDiameterVar]: `${diameter}px` }),
      }}
      data-testid={testId}
      id={id}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        className={gizmoCanvasStyle({ disabled })}
        role="application"
        aria-label="Viewport orientation gizmo"
        aria-roledescription={ariaDescription}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={interaction.handlers.onPointerDown}
        onPointerMove={interaction.handlers.onPointerMove}
        onPointerUp={interaction.handlers.onPointerUp}
        onKeyDown={interaction.handlers.onKeyDown}
      />
      <div className={ariaLiveRegionStyle} aria-live="polite" role="status">
        {ariaDescription}
      </div>
    </div>
  );
};

ViewportGizmo.displayName = 'ViewportGizmo';
