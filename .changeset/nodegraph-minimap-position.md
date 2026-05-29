---
'entangle-ui': patch
---

Fix `<NodeGraph.Minimap>` rendering off-screen. The slot applied `position: absolute` to the inner `<Minimap>`, but `ViewportMinimap` already pins it via its own absolutely-positioned wrapper. The duplicate positioning pulled the minimap out of the wrapper's flow, collapsing the wrapper to a zero-size box at the viewport's bottom-right corner and pushing the minimap off-screen. The slot class now only re-enables pointer events.
