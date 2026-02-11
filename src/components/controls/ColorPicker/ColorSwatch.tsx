'use client';

import React from 'react';
import type { ColorSwatchProps } from './ColorPicker.types';
import { cx } from '@/utils/cx';
import { swatchRecipe, swatchColorStyle } from './ColorPicker.css';

export const ColorSwatch = /*#__PURE__*/ React.memo<ColorSwatchProps>(
  ({
    color,
    size = 'md',
    shape = 'square',
    disabled = false,
    onClick,
    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cx(swatchRecipe({ size, shape, disabled }), className)}
        disabled={disabled}
        onClick={onClick}
        style={style}
        data-testid={testId}
        aria-label={rest['aria-label'] ?? `Color: ${color}`}
        {...rest}
      >
        <span className={swatchColorStyle} style={{ background: color }} />
      </button>
    );
  }
);

ColorSwatch.displayName = 'ColorSwatch';
