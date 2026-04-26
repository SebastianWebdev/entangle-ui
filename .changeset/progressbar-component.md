---
'entangle-ui': minor
---

Add `ProgressBar` and `CircularProgress` feedback components for measurable
operations like uploads, exports, renders, and batch jobs. Both share `value`
/ `min` / `max` semantics and four named colors (`primary`, `success`,
`warning`, `error`) plus arbitrary CSS color pass-through. Omitting `value`
renders an indeterminate variant — a sliding gradient on the linear bar, a
rotating arc on the circular one — with a `prefers-reduced-motion` fallback.
`ProgressBar` ships in three heights (`sm` 2px → `lg` 8px), supports inline /
overlay / custom labels, and an optional striped (optionally animated)
texture overlay; `CircularProgress` ranges from `xs` (16px) to `xl` (48px),
auto-derives stroke thickness from size (overridable via `thickness`), and
can render a center label for `lg`+ sizes. Both expose
`role="progressbar"` with the appropriate `aria-value*` attributes.
