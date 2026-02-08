import type { CurvePreset, CurveKeyframe } from './CurveEditor.types';
import { generateKeyframeId } from './curveUtils';

function kf(
  x: number,
  y: number,
  hInX: number,
  hInY: number,
  hOutX: number,
  hOutY: number,
  tangentMode: CurveKeyframe['tangentMode'] = 'free'
): CurveKeyframe {
  return {
    x,
    y,
    handleIn: { x: hInX, y: hInY },
    handleOut: { x: hOutX, y: hOutY },
    tangentMode,
    id: generateKeyframeId(),
  };
}

export const CURVE_PRESETS: CurvePreset[] = [
  // ─── Basic ───
  {
    id: 'linear',
    label: 'Linear',
    category: 'Basic',
    curve: {
      keyframes: [
        kf(0, 0, 0, 0, 0.333, 0.333, 'linear'),
        kf(1, 1, -0.333, -0.333, 0, 0, 'linear'),
      ],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },
  {
    id: 'constant',
    label: 'Constant',
    category: 'Basic',
    curve: {
      keyframes: [
        kf(0, 1, 0, 0, 0.333, 0, 'linear'),
        kf(1, 1, -0.333, 0, 0, 0, 'linear'),
      ],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },

  // ─── Ease ───
  {
    id: 'ease-in',
    label: 'Ease In',
    category: 'Ease',
    curve: {
      keyframes: [kf(0, 0, 0, 0, 0.42, 0), kf(1, 1, -0.333, -0.333, 0, 0)],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },
  {
    id: 'ease-out',
    label: 'Ease Out',
    category: 'Ease',
    curve: {
      keyframes: [kf(0, 0, 0, 0, 0.333, 0.333), kf(1, 1, -0.58, 0, 0, 0)],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },
  {
    id: 'ease-in-out',
    label: 'Ease In-Out',
    category: 'Ease',
    curve: {
      keyframes: [kf(0, 0, 0, 0, 0.42, 0), kf(1, 1, -0.58, 0, 0, 0)],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },

  // ─── Dramatic ───
  {
    id: 'ease-in-cubic',
    label: 'Ease In (Cubic)',
    category: 'Dramatic',
    curve: {
      keyframes: [kf(0, 0, 0, 0, 0.55, 0), kf(1, 1, -0.2, -0.333, 0, 0)],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },
  {
    id: 'ease-out-cubic',
    label: 'Ease Out (Cubic)',
    category: 'Dramatic',
    curve: {
      keyframes: [kf(0, 0, 0, 0, 0.2, 0.333), kf(1, 1, -0.55, 0, 0, 0)],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },
  {
    id: 'bounce',
    label: 'Bounce',
    category: 'Dramatic',
    curve: {
      keyframes: [
        kf(0, 0, 0, 0, 0.12, 0.33),
        kf(0.5, 1.15, -0.12, 0.05, 0.12, -0.05),
        kf(0.75, 0.9, -0.08, -0.05, 0.08, 0.05),
        kf(1, 1, -0.08, 0, 0, 0),
      ],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },
  {
    id: 'overshoot',
    label: 'Overshoot',
    category: 'Dramatic',
    curve: {
      keyframes: [
        kf(0, 0, 0, 0, 0.2, 0.5),
        kf(0.7, 1.2, -0.15, 0.1, 0.1, -0.05),
        kf(1, 1, -0.1, 0, 0, 0),
      ],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },

  // ─── Utility ───
  {
    id: 'step',
    label: 'Step',
    category: 'Utility',
    curve: {
      keyframes: [
        kf(0, 0, 0, 0, 0, 0, 'step'),
        kf(0.5, 1, 0, 0, 0, 0, 'step'),
        kf(1, 1, 0, 0, 0, 0, 'linear'),
      ],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },
  {
    id: 'inverse',
    label: 'Inverse',
    category: 'Utility',
    curve: {
      keyframes: [
        kf(0, 1, 0, 0, 0.333, -0.333, 'linear'),
        kf(1, 0, -0.333, 0.333, 0, 0, 'linear'),
      ],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },
  {
    id: 'bell',
    label: 'Bell Curve',
    category: 'Utility',
    curve: {
      keyframes: [
        kf(0, 0, 0, 0, 0.1, 0),
        kf(0.3, 0.8, -0.1, 0.1, 0.08, 0.08),
        kf(0.5, 1, -0.08, 0.02, 0.08, -0.02, 'mirrored'),
        kf(0.7, 0.8, -0.08, 0.08, 0.1, -0.1),
        kf(1, 0, -0.1, 0, 0, 0),
      ],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },
  {
    id: 'sawtooth',
    label: 'Sawtooth',
    category: 'Utility',
    curve: {
      keyframes: [
        kf(0, 0, 0, 0, 0.15, 0.5, 'linear'),
        kf(0.5, 1, -0.15, -0.5, 0, 0, 'linear'),
        kf(0.5, 0, 0, 0, 0.15, 0.5, 'linear'),
        kf(1, 1, -0.15, -0.5, 0, 0, 'linear'),
      ],
      domainX: [0, 1],
      domainY: [0, 1],
    },
  },
];
