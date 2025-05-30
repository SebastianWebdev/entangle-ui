import type { Tokens } from './tokens';
import type { Prettify, DeepPartial } from '../types/utilities';

// Dla Emotion theme to są bezpośrednio tokens
export type Theme = Prettify<Tokens>;

// Re-export for convenience
export type { DeepPartial };
