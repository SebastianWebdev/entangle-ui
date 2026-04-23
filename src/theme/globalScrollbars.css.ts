import { globalStyle } from '@vanilla-extract/css';
import { vars } from './contract.css';

/**
 * Global scrollbar theming (opt-in).
 *
 * Emits scrollbar styling rules scoped under the `.etuiGlobalScrollbars`
 * class. `ThemeProvider` (or consumers manually) can add this class to
 * `document.body` via the `globalScrollbars` prop so that native
 * scrollbars on overflowing elements blend with the dark editor theme.
 *
 * Scoped to a class (rather than `html`/`body`) so the default build
 * of Entangle UI never forces scrollbar styling on hosts that embed
 * the library alongside other UI frameworks.
 */

export const GLOBAL_SCROLLBARS_CLASS = 'etuiGlobalScrollbars';

globalStyle(`.${GLOBAL_SCROLLBARS_CLASS} *`, {
  scrollbarWidth: 'thin',
  scrollbarColor: `${vars.colors.text.disabled} transparent`,
});

globalStyle(`.${GLOBAL_SCROLLBARS_CLASS} *::-webkit-scrollbar`, {
  width: '8px',
  height: '8px',
});

globalStyle(`.${GLOBAL_SCROLLBARS_CLASS} *::-webkit-scrollbar-track`, {
  background: 'transparent',
});

globalStyle(`.${GLOBAL_SCROLLBARS_CLASS} *::-webkit-scrollbar-thumb`, {
  background: vars.colors.text.disabled,
  borderRadius: '4px',
});

globalStyle(`.${GLOBAL_SCROLLBARS_CLASS} *::-webkit-scrollbar-thumb:hover`, {
  background: vars.colors.text.muted,
});

globalStyle(`.${GLOBAL_SCROLLBARS_CLASS} *::-webkit-scrollbar-corner`, {
  background: 'transparent',
});
