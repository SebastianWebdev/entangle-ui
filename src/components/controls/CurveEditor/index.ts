export { CurveEditor } from './CurveEditor';

export type {
  CurveEditorProps,
  CurveEditorSize,
  CurveData,
  CurveKeyframe,
  TangentMode,
  CurvePreset,
  CurveBackgroundInfo,
} from './CurveEditor.types';

export {
  evaluateCurve,
  sampleCurve,
  createLinearCurve,
  domainToCanvas,
} from './curveUtils';

export { CURVE_PRESETS } from './curvePresets';
