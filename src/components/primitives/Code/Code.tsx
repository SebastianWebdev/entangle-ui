'use client';

import React from 'react';
import { cx } from '@/utils/cx';
import type { CodeProps } from './Code.types';
import { codeRecipe } from './Code.css';

/**
 * Small inline `<code>` primitive with theme-aware background and font.
 *
 * Complements `ChatCodeBlock` (block-level) — use `Code` for short inline
 * snippets inside sentences and markdown renderers.
 *
 * @example
 * ```tsx
 * <Text>Run <Code>npm install</Code> to add the package.</Text>
 * ```
 */
export const Code = /*#__PURE__*/ React.memo<CodeProps>(
  ({ children, size = 'sm', className, style, testId, ref, ...rest }) => {
    return (
      <code
        ref={ref}
        className={cx(codeRecipe({ size }), className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {children}
      </code>
    );
  }
);

Code.displayName = 'Code';
