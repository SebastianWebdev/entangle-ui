# Installation

> How to install and set up Entangle UI in your project.

## Install Entangle UI

```bash
npm install entangle-ui
```

### Peer Dependencies

Entangle UI requires the following peer dependencies:

```bash
npm install react react-dom @base-ui/react @floating-ui/react @tanstack/react-virtual @vanilla-extract/css @vanilla-extract/dynamic @vanilla-extract/recipes
```

| Package                    | Version    |
| -------------------------- | ---------- |
| `react`                    | `>=19.2.0` |
| `react-dom`                | `>=19.2.0` |
| `@base-ui/react`           | `^1.1.0`   |
| `@floating-ui/react`       | `^0.27.17` |
| `@tanstack/react-virtual`  | `^3.13.0`  |
| `@vanilla-extract/css`     | `^1.18.0`  |
| `@vanilla-extract/dynamic` | `^2.1.5`   |
| `@vanilla-extract/recipes` | `^0.5.7`   |

:::note
Entangle UI is ESM-only (`"type": "module"`). Make sure your bundler supports ES modules.
:::

## Deep Imports

Color palettes are available via a dedicated export for better tree-shaking:

```tsx
import { MATERIAL_PALETTE, TAILWIND_PALETTE } from 'entangle-ui/palettes';
```

Available palettes: `MATERIAL_PALETTE`, `TAILWIND_PALETTE`, `PASTEL_PALETTE`, `EARTH_PALETTE`, `NEON_PALETTE`, `MONOCHROME_PALETTE`, `SKIN_TONES_PALETTE`, `VINTAGE_PALETTE`, `PROFESSIONAL_PALETTES`.

## TypeScript

All components export their prop types. Utility types are also available:

```tsx
import type {
  Tokens,
  ThemeVars,
  Prettify,
  DeepPartial,
  LiteralUnion,
} from 'entangle-ui';
```

## Utilities

```tsx
import { cx, cn } from 'entangle-ui';

// cx — join class names, filtering out falsy values
<div className={cx('base', isActive && 'active', className)} />;
```

## Next Steps

- [Quick Start](/getting-started/quick-start) — build your first component
- [Theming](/guides/theming) — customize the theme
