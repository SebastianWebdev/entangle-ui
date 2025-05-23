// src/icons/LockIcon.tsx
import React from 'react';
import { Icon } from '../primitives/Icon';
import type { IconProps } from '../primitives/Icon';

/**
* Lock icon component for security and locked states.
* 
* A standard padlock icon commonly used for indicating locked content,
* security features, and protected operations in editor interfaces.
* 
* @example
* ```tsx
* // Basic usage
* <LockIcon />
* 
* // With custom size and color
* <LockIcon size="sm" color="warning" />
* 
* // In a security context
* <Button icon={<LockIcon />}>Lock</Button>
* ```
*/
export const LockIcon: React.FC<Omit<IconProps, 'svg'>> = (props) => {
 return (
   <Icon
     svg="M8 11V7a4 4 0 118 0v4m-4 4v2m-6-6h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z"
     {...props}
   />
 );
};