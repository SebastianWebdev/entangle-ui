---
'entangle-ui': minor
---

Add `Alert` component for persistent inline status banners — read-only
notices, expired-credentials warnings, unsaved-changes banners, and similar
in-layout messages. Five semantic variants (`info`, `success`, `warning`,
`error`, `neutral`) drive the color and the default icon, with three visual
treatments: `subtle` (default), `solid`, and `outline`. Provide `onClose`
to render a dismiss button. Ships a compound API — `Alert.Title`,
`Alert.Description`, `Alert.Actions` — also exported as standalone
`AlertTitle`, `AlertDescription`, `AlertActions`. ARIA roles are derived
from the variant (`alert` for error/warning, `status` for info/success,
`region` for neutral). For transient confirmations like "File saved", reach
for `useToast` instead.
