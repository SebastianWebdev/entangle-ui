---
'entangle-ui': minor
---

ViewportGizmo: add `invertYaw` and `invertPitch` props to flip the orbit drag direction without negating the `onOrbit` delta by hand. Inversion is applied before `constrainPitch`, so pitch clamping stays correct at the poles. Also documents the `onOrbit` delta sign convention and adds a copy-paste Three.js / R3F `OrbitControls` integration recipe to the docs.
