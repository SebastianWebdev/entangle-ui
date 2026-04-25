/**
 * Shared animation utilities — keyframe references and utility class names.
 *
 * Re-exported from `animations.css.ts` so consumers can import from a
 * single module without coupling to the `.css.ts` suffix.
 *
 * @example
 * ```tsx
 * import { animSpin } from 'entangle-ui';
 *
 * <div className={animSpin}>…</div>
 * ```
 */
export {
  animBlink,
  animFadeIn,
  animPulse,
  animSpin,
  animWave,
  blinkKeyframe,
  fadeInKeyframe,
  pulseKeyframe,
  spinKeyframe,
  waveKeyframe,
} from './animations.css';
