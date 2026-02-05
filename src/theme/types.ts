import type { Tokens } from './tokens';
import type { Prettify, DeepPartial } from '../types/utilities';

// For Emotion theme, these are directly the tokens
export type Theme = Prettify<Tokens>;

// Re-export for convenience
export type { DeepPartial };
