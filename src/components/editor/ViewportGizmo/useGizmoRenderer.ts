'use client';

import type React from 'react';
import { useCallback } from 'react';
import type { CanvasThemeColors } from '@/components/primitives/canvas/canvas.types';
import { resolveCanvasTheme } from '@/components/primitives/canvas/canvasTheme';
import { useCanvasRenderer } from '@/components/primitives/canvas/useCanvasRenderer';
import type {
  GizmoOrientation,
  GizmoUpAxis,
  GizmoHitRegion,
  ViewportGizmoSize,
} from './ViewportGizmo.types';
import { projectAxes } from './gizmoMath';

// ─── Size Presets ───

interface SizePreset {
  labelFontSize: number;
  fontWeight: number;
  armWidthPositive: number;
  armWidthNegative: number;
  tipRadius: number;
  tipHoverRadius: number;
  originRadius: number;
}

const SIZE_PRESETS: Record<ViewportGizmoSize, SizePreset> = {
  sm: {
    labelFontSize: 9,
    fontWeight: 600,
    armWidthPositive: 1.5,
    armWidthNegative: 0.75,
    tipRadius: 4,
    tipHoverRadius: 5,
    originRadius: 4,
  },
  md: {
    labelFontSize: 11,
    fontWeight: 600,
    armWidthPositive: 2.5,
    armWidthNegative: 1,
    tipRadius: 5,
    tipHoverRadius: 7,
    originRadius: 5,
  },
  lg: {
    labelFontSize: 13,
    fontWeight: 600,
    armWidthPositive: 3,
    armWidthNegative: 1.5,
    tipRadius: 6,
    tipHoverRadius: 8,
    originRadius: 6,
  },
};

// ─── Default Axis Colors ───

const AXIS_COLORS: Record<string, string> = {
  x: '#E63946',
  y: '#6AA84F',
  z: '#4A86C8',
};

interface UseGizmoRendererOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  orientation: GizmoOrientation;
  diameter: number;
  upAxis: GizmoUpAxis;
  size: ViewportGizmoSize;
  axisColors: Record<string, string>;
  axisLabels: Record<string, string>;
  axisVisible: Record<string, boolean>;
  showLabels: boolean;
  showNegativeAxes: boolean;
  showOrbitRing: boolean;
  showOriginHandle: boolean;
  background: 'transparent' | 'subtle' | 'solid';
  disabled: boolean;
  isDragging: boolean;
  hoveredRegion: GizmoHitRegion;
}

export { AXIS_COLORS };

export function useGizmoRenderer(options: UseGizmoRendererOptions): void {
  const {
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
    isDragging,
    hoveredRegion,
  } = options;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    } else {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const theme: CanvasThemeColors = resolveCanvasTheme(canvas);
    const preset = SIZE_PRESETS[size];
    const opacity = disabled ? 0.4 : 1;
    const center = { x: w / 2, y: h / 2 };
    const armLength = (diameter / 2) * 0.65;

    // 1. Clear / background
    ctx.clearRect(0, 0, w, h);

    if (background === 'subtle') {
      ctx.globalAlpha = opacity * 0.15;
      ctx.fillStyle = theme.backgroundSecondary;
      ctx.beginPath();
      ctx.arc(center.x, center.y, diameter / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (background === 'solid') {
      ctx.globalAlpha = opacity;
      ctx.fillStyle = theme.backgroundSecondary;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.globalAlpha = opacity;

    // 2. Orbit ring
    if (showOrbitRing) {
      ctx.strokeStyle = theme.borderDefault;
      ctx.lineWidth = 1;
      ctx.globalAlpha = opacity * 0.3;
      ctx.beginPath();
      ctx.arc(center.x, center.y, armLength * 1.1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = opacity;
    }

    // 3. Draw arms — depth sorted (furthest first = painter's algorithm)
    const arms = projectAxes(orientation, center, armLength, upAxis);

    for (const arm of arms) {
      if (!axisVisible[arm.axis]) continue;
      if (!arm.positive && !showNegativeAxes) continue;

      const color = axisColors[arm.axis] ?? AXIS_COLORS[arm.axis] ?? '#888';
      const isHovered =
        hoveredRegion.axis === arm.axis &&
        ((arm.positive && hoveredRegion.type === 'axis-positive') ||
          (!arm.positive && hoveredRegion.type === 'axis-negative'));

      const alpha = arm.positive ? 1.0 : 0.35;
      const lineWidth = arm.positive
        ? preset.armWidthPositive
        : preset.armWidthNegative;

      // Draw arm line
      ctx.globalAlpha = opacity * alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(arm.screenX, arm.screenY);
      ctx.stroke();

      // Draw tip handle (positive arms only)
      if (arm.positive) {
        const tipR = isHovered ? preset.tipHoverRadius : preset.tipRadius;
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(arm.screenX, arm.screenY, tipR, 0, Math.PI * 2);
        ctx.fill();

        // Draw label
        if (showLabels) {
          const label = axisLabels[arm.axis] ?? arm.axis.toUpperCase();
          const labelOffset = tipR + preset.labelFontSize * 0.6;

          // Position label outward from center
          const dx = arm.screenX - center.x;
          const dy = arm.screenY - center.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = dx / dist;
          const ny = dy / dist;
          const lx = arm.screenX + nx * labelOffset;
          const ly = arm.screenY + ny * labelOffset;

          ctx.globalAlpha = opacity;
          ctx.fillStyle = color;
          ctx.font = `${preset.fontWeight} ${preset.labelFontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, lx, ly);
        }
      }
    }

    // 4. Origin handle
    if (showOriginHandle) {
      const isOriginHovered = hoveredRegion.type === 'origin';
      const originR = isOriginHovered
        ? preset.originRadius + 1.5
        : preset.originRadius;

      ctx.globalAlpha = opacity * 0.6;
      ctx.fillStyle = theme.textSecondary;
      ctx.beginPath();
      ctx.arc(center.x, center.y, originR, 0, Math.PI * 2);
      ctx.fill();

      // Border ring
      ctx.globalAlpha = opacity * 0.3;
      ctx.strokeStyle = theme.textMuted;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }, [
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
    isDragging,
    hoveredRegion,
  ]);

  useCanvasRenderer({
    draw,
    deps: [draw],
    paused: false,
  });
}
