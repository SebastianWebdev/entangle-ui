---
'entangle-ui': minor
---

Add `TransformControl` — the canonical position / rotation / scale property
control for 3D editor interfaces. Composes `VectorInput`, `Select` and
`PropertyRow` into a single high-level component, mirroring the transform
widget found in Blender, Unity and Unreal. Renders three rows (position,
rotation, scale) plus a coordinate-space dropdown and a linked-scale lock
toggle, with sensible defaults for precision (`3 / 1 / 3`), step
(`0.1 / 1 / 0.01`) and units (`m / ° / ''`). Three independent atoms —
`value`, `coordinateSpace`, `linkedScale` — each support controlled and
uncontrolled usage. `linkedScale` performs uniform (not proportional)
scaling and does not snap values when toggled. Hide rows via `show`,
swap the coordinate-space options via `coordinateSpaceOptions`, and turn
on per-row reset buttons with `showReset`. The component intentionally
renders no `PropertySection` wrapper — slot it inside one of your own.
Note: changing the coordinate-space dropdown does not transform the
numeric values; the consumer's editor logic is responsible for re-projecting
them.
