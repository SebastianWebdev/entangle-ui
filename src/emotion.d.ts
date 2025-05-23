import '@emotion/react';
import type { Theme as CustomTheme } from './theme/types';

declare module '@emotion/react' {
  export interface Theme extends CustomTheme {}
}