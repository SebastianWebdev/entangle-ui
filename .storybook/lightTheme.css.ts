import { createLightTheme } from '../src/theme/createLightTheme';

/**
 * Storybook-only build-time generated class that flips a subtree to the
 * light theme. Used by the `withThemeByClassName` decorator in preview.tsx
 * so stories can be inspected under both dark and light themes.
 */
export const lightThemeClass = createLightTheme();
