'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { getKeyGlyph, getPlatform, parseShortcut } from '@/utils/platform';
import type { Platform } from '@/utils/platform';
import { cx } from '@/utils/cx';
import { kbdRoot, keycapRecipe, separatorStyle } from './Kbd.css';
import type { KbdProps } from './Kbd.types';

function getKeys(children: React.ReactNode): React.ReactNode[] {
  if (typeof children === 'string') {
    return parseShortcut(children);
  }

  return React.Children.toArray(children);
}

/**
 * Render keyboard shortcuts with consistent keycap styling and platform-aware glyphs.
 *
 * Use Kbd for shortcut hints in menus, tooltips, command palettes, help overlays,
 * and keyboard reference panels.
 *
 * @example
 * ```tsx
 * <Kbd>Ctrl+S</Kbd>
 * <Kbd platform="mac" separator={null}>Cmd+S</Kbd>
 * ```
 */
export const Kbd = /*#__PURE__*/ React.memo<KbdProps>(
  ({
    children,
    size = 'md',
    variant = 'outline',
    glyphs = true,
    platform = 'auto',
    separator = '+',
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    const [platformDetected, setPlatformDetected] =
      useState<Platform>('windows');

    useEffect(() => {
      if (platform === 'auto') {
        setPlatformDetected(getPlatform());
      }
    }, [platform]);

    const platformResolved = platform === 'auto' ? platformDetected : platform;
    const keys = useMemo(() => getKeys(children), [children]);

    const renderKey = (key: React.ReactNode): React.ReactNode => {
      if (glyphs && typeof key === 'string') {
        return getKeyGlyph(key, platformResolved);
      }

      return key;
    };

    return (
      <span
        ref={ref}
        className={cx(kbdRoot, className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {keys.map((key, index) => (
          <React.Fragment
            key={`${typeof key === 'string' ? key : index}-${index}`}
          >
            {index > 0 && separator !== null && (
              <span className={separatorStyle}>{separator}</span>
            )}
            <kbd className={keycapRecipe({ size, variant })}>
              {renderKey(key)}
            </kbd>
          </React.Fragment>
        ))}
      </span>
    );
  }
);

Kbd.displayName = 'Kbd';
