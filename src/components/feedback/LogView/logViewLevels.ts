import { ErrorIcon } from '@/components/Icons/ErrorIcon';
import { InfoIcon } from '@/components/Icons/InfoIcon';
import { WarningIcon } from '@/components/Icons/WarningIcon';

import type {
  BuiltInLogLevel,
  LogLevel,
  LogLevelConfig,
} from './LogView.types';
import type React from 'react';

/** A component usable as a level icon (subset of the icon props we render). */
export type LevelIconComponent = React.ComponentType<{
  size?: 'sm' | 'md' | 'lg' | number;
  color?: string;
}>;

/** A level's fully-resolved visual definition. */
export interface ResolvedLevelDefinition {
  level: LogLevel;
  label: string;
  icon: LevelIconComponent | null;
  /** Inline color for custom levels; `undefined` for built-ins (themed via CSS). */
  color?: string;
  /** Whether this is one of the four built-in, CSS-themed levels. */
  isBuiltIn: boolean;
}

/** The four built-in levels, in default display order. */
export const BUILT_IN_LEVELS: readonly BuiltInLogLevel[] = [
  'debug',
  'info',
  'warn',
  'error',
];

const BUILT_IN_DEFAULTS: Record<
  BuiltInLogLevel,
  { label: string; icon: LevelIconComponent | null; order: number }
> = {
  debug: { label: 'Debug', icon: null, order: 0 },
  info: { label: 'Info', icon: InfoIcon, order: 1 },
  warn: { label: 'Warn', icon: WarningIcon, order: 2 },
  error: { label: 'Error', icon: ErrorIcon, order: 3 },
};

export function isBuiltInLevel(level: LogLevel): level is BuiltInLogLevel {
  return (
    level === 'debug' ||
    level === 'info' ||
    level === 'warn' ||
    level === 'error'
  );
}

function capitalize(value: string): string {
  return value.length === 0
    ? value
    : value.charAt(0).toUpperCase() + value.slice(1);
}

function levelSortKey(
  level: LogLevel,
  config: LogLevelConfig | undefined
): number {
  const configured = config?.[level]?.order;
  if (configured !== undefined) return configured;
  if (isBuiltInLevel(level)) return BUILT_IN_DEFAULTS[level].order;
  return 100;
}

/**
 * Resolve the ordered list of levels shown as filter chips. Defaults to the
 * four built-ins plus any keys present in `levelConfig`, sorted by `order`. An
 * explicit `levelOrder` short-circuits this.
 */
export function resolveLevelOrder(
  levelConfig: LogLevelConfig | undefined,
  explicit: readonly LogLevel[] | undefined
): LogLevel[] {
  if (explicit) return [...explicit];
  const set = new Set<LogLevel>(BUILT_IN_LEVELS);
  if (levelConfig) {
    for (const key of Object.keys(levelConfig)) set.add(key);
  }
  return [...set].sort(
    (a, b) => levelSortKey(a, levelConfig) - levelSortKey(b, levelConfig)
  );
}

/** Resolve a single level's label, icon, and color. */
export function resolveLevelDefinition(
  level: LogLevel,
  config: LogLevelConfig | undefined
): ResolvedLevelDefinition {
  const cfg = config?.[level];
  const builtIn = isBuiltInLevel(level);
  const defaults = builtIn ? BUILT_IN_DEFAULTS[level] : undefined;
  return {
    level,
    label: cfg?.label ?? defaults?.label ?? capitalize(String(level)),
    icon: cfg?.icon !== undefined ? cfg.icon : (defaults?.icon ?? null),
    color: builtIn ? undefined : cfg?.color,
    isBuiltIn: builtIn,
  };
}
