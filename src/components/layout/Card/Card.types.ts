import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';
import type React from 'react';

export type CardVariant = 'outlined' | 'filled' | 'elevated';

export interface CardBaseProps extends Omit<BaseComponent, 'onClick'> {
  /** Visual variant. @default "outlined" */
  variant?: CardVariant;
  /** Click handler — when set, the whole card becomes interactive (button role). */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Selected state (e.g. for a card grid). @default false */
  selected?: boolean;
  /** Disabled state. @default false */
  disabled?: boolean;
  /** Children — typically Card.Header / Card.Media / Card.Body / Card.Footer. */
  children?: React.ReactNode;
}

export type CardProps = Prettify<CardBaseProps>;

export interface CardHeaderBaseProps extends Omit<BaseComponent, 'title'> {
  /** Title row content. Ignored when `children` is provided. */
  title?: React.ReactNode;
  /** Subtitle below the title. Ignored when `children` is provided. */
  subtitle?: React.ReactNode;
  /** Leading visual (icon, Avatar). */
  leading?: React.ReactNode;
  /** Trailing actions (IconButton, Menu). */
  trailing?: React.ReactNode;
  /** Custom content — overrides title/subtitle layout. */
  children?: React.ReactNode;
}

export type CardHeaderProps = Prettify<CardHeaderBaseProps>;

export interface CardMediaBaseProps extends BaseComponent {
  /** Image source — shortcut for an `<img>` child. */
  src?: string;
  /** Alt text for the image. */
  alt?: string;
  /** Aspect ratio (width/height). @default 16/9 */
  aspectRatio?: number;
  children?: React.ReactNode;
}

export type CardMediaProps = Prettify<CardMediaBaseProps>;

export interface CardBodyBaseProps extends BaseComponent {
  children?: React.ReactNode;
}

export type CardBodyProps = Prettify<CardBodyBaseProps>;

export type CardFooterAlign = 'left' | 'center' | 'right' | 'space-between';

export interface CardFooterBaseProps extends BaseComponent {
  /** Horizontal alignment of footer content. @default "right" */
  align?: CardFooterAlign;
  children?: React.ReactNode;
}

export type CardFooterProps = Prettify<CardFooterBaseProps>;
