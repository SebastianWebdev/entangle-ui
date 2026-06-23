---
'entangle-ui': minor
---

`Select`: type `onChange` per `clearable` so the value is only nullable when it can actually be cleared.

`SelectProps` is now a discriminated union on `clearable`:

- Without `clearable`, `onChange` is `(value: T) => void` — it never receives `null`, so consumers no longer need a spurious null check.
- With `clearable`, `onChange` is `(value: T | null) => void` — `null` is emitted by the clear button.

Type-only change (runtime behavior is unchanged). This is stricter than before: an inline `onChange` handler on a non-clearable select now infers `T` instead of `T | null`. Handlers already written to accept `T | null` remain assignable, so most code is unaffected; a handler that explicitly compared the value to `null` on a non-clearable select should drop that dead branch.
