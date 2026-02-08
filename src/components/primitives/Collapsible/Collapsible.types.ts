import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

export type CollapsibleSize = Size;

export interface CollapsibleBaseProps extends Omit<BaseComponent, 'onChange'> {
  /** Content shown in the collapsible header/trigger */
  trigger: React.ReactNode;

  /** Whether expanded (controlled) */
  open?: boolean;

  /** Default expanded state (uncontrolled) @default false */
  defaultOpen?: boolean;

  /** Size @default "sm" */
  size?: CollapsibleSize;

  /** Custom indicator icon, or null to hide the indicator @default built-in chevron */
  indicator?: React.ReactNode | null;

  /** Whether disabled @default false */
  disabled?: boolean;

  /** Keep content in DOM when collapsed @default false */
  keepMounted?: boolean;

  /** Callback when open state changes */
  onChange?: (open: boolean) => void;

  /** Content to render when expanded */
  children: React.ReactNode;
}

export type CollapsibleProps = Prettify<CollapsibleBaseProps>;
