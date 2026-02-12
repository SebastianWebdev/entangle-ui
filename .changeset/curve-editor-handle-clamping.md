---
'entangle-ui': patch
---

Fixed CurveEditor bezier curves producing vertical spikes and loops when control handles exceeded segment bounds. Auto-tangent handles now scale proportionally to segment length, and all handles are clamped at evaluation time as a safety net.
