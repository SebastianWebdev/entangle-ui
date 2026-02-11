'use client';

// src/primitives/BaseButton/BaseButton.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Additional CSS classes */
  className?: string;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Button content */
  children?: React.ReactNode;
  /** Test ID */
  'data-testid'?: string;
}

export const BaseButton = /*#__PURE__*/ forwardRef<
  HTMLButtonElement,
  BaseButtonProps
>(({ className, disabled = false, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        // Reset only some styles, not all
        'bg-transparent p-0 m-0',
        // Base interactive styles
        'cursor-pointer select-none',
        'focus:outline-none',
        // Disabled state
        disabled && 'cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

BaseButton.displayName = 'BaseButton';
