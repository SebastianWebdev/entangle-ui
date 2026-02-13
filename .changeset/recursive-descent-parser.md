---
"entangle-ui": patch
---

Replace eval-based math expression parser with recursive descent parser. Removes `new Function()` to eliminate Socket.dev "Uses eval" flag. Adds modulo operator, implicit multiplication, multi-arg functions (min, max, pow, clamp, lerp, smoothstep), hyperbolic trig, unit conversion (deg/rad), and context-aware comma handling.
