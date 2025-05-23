// src/icons/UndoIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
* Undo icon component for undo actions.
* 
* A standard curved arrow icon commonly used for undoing operations,
* reverting changes, and history navigation in editor interfaces.
* 
* @example
* ```tsx
* // Basic usage
* <UndoIcon />
* 
* // With custom size and color
* <UndoIcon size="md" color="secondary" />
* 
* // In an undo button
* <Button icon={<UndoIcon />}>Undo</Button>
* ```
*/
export const UndoIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
 return (
   <Icon
     svg="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
     {...props}
   />
 );
};