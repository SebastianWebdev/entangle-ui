---
'entangle-ui': patch
---

`Timeline` — two new opt-in props that tune the loop region's chrome:

- **`loopStrip`** (default `false`) — adds a thin dedicated band directly
  under the time ruler. A plain drag on the strip creates / re-draws the
  loop region, no Alt needed. The main ruler keeps its scrub behaviour, so
  scrub vs loop-create stop fighting on a single zone.
- **`loopHandles`** (default `'edges'`) — `'edges'` keeps the existing
  full-height vertical bars on each loop edge; `'brackets'` draws compact
  `[ ]` markers with serifs in the chrome (ruler + strip) area instead. No
  full-height bars across the track area, and the edge pick zone widens so
  the markers are easier to grab.

Both compose: the Animation Editor showcase enables them together. Drawing
and hit-test now resolve a unified `chromeHeight = rulerHeight +
loopStripHeight` so screen↔content Y conversions stay correct for marquee
selection, double-click add, tangent drags and scrolling.
