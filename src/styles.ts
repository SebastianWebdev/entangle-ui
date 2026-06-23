/**
 * Canonical Entangle UI stylesheet entry — `import 'entangle-ui/styles.css'`.
 *
 * Import this exactly once at your application root. It registers the default
 * dark theme: every `--etui-*` design token is declared on `:root`, plus the
 * opt-in global-scrollbar rules. With it loaded, components render with the
 * correct theme and **no `ThemeProvider` wrapper is required** — the provider
 * only layers extra runtime behaviors (keyboard context, `globalScrollbars`)
 * on top.
 *
 * Each component's own CSS still ships as a side effect of importing that
 * component, so this entry stays tiny: it is only the global theme layer.
 *
 * @example
 * ```ts
 * // app entry, e.g. main.tsx
 * import 'entangle-ui/styles.css';
 * import { Button } from 'entangle-ui';
 * ```
 */
import '@/theme/darkTheme.css';
import '@/theme/globalScrollbars.css';
