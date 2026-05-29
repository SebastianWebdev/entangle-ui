'use client';

import React from 'react';

import { Icon } from '@/components/primitives/Icon';

import type { IconProps } from '@/components/primitives/Icon';

/**
 * File Text icon component for documents and text content.
 *
 * A document page with horizontal text lines, commonly used for
 * documentation, notes, write-ups, and scribe-style personas.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FileTextIcon />
 *
 * // With custom size and color
 * <FileTextIcon size="md" color="secondary" />
 *
 * // In a documentation entry
 * <Button icon={<FileTextIcon />}>Open Document</Button>
 * ```
 */
export const FileTextIcon = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <line x1="8" y1="9" x2="10" y2="9" />
    </Icon>
  );
});

FileTextIcon.displayName = 'FileTextIcon';
