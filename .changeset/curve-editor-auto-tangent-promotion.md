---
'entangle-ui': patch
---

Fixed CurveEditor handle values resetting when moving keyframes. Manually adjusting a handle on an auto-tangent keyframe now promotes the tangent mode from auto to free, preventing recalculation from overwriting user changes.
