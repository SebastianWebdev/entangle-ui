import React from 'react';
import { Icon } from '@/components/primitives';
import type { IconProps } from '@/components/primitives';

/**
 * Save icon component for editor interfaces.
 * 
 * Displays a floppy disk icon commonly used for save actions.
 * Optimized for editor toolbars and buttons.
 * 
 * @example
 * ```tsx
 * <SaveIcon size="md" />
 * <Button icon={<SaveIcon />}>Save</Button>
 * ```
 */
export const SaveIcon: React.FC<Omit<IconProps, 'children'>> = (props) => {
  return (
    <Icon {...props}>
      <path
        d="M3 3v18h18V6.414L17.586 3H3zm2 2h10v4H5V5zm0 6h14v8H5v-8zm2 2v4h10v-4H7z"
        fill="currentColor"
      />
    </Icon>
  );
};
