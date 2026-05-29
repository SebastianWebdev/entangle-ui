---
'entangle-ui': minor
---

`NodeGraph` socket-level edge actions and a drop point on the connection event.

**Socket actions** — right-clicking a port already reported a `{ kind: 'port' }` context target; now there are batch helpers to act on a socket's wires: a pure `edgesConnectedToPort(edges, ref)` (ids of every edge on a socket) and a `disconnectPort(node, port)` action on `useNodeGraph` (detach them all, pruning the selection). The demo gives sockets a "Select connected edges" context menu.

**Drop point on `onConnectEnd`** — the event now carries `worldPoint` and `screenPoint` (the release position). A drop on empty space (`cancelled` + `target === null`) is the hook for the classic "drag a wire onto the canvas → open a create-node menu there → wire the new node straight up" flow; the consumer positions the menu at `screenPoint`, spawns at `worldPoint`, and `connect`s to `source`. The demo wires this end to end.
