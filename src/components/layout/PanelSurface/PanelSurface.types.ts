import type React from 'react';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';

export type PanelSurfaceSize = Size;

export interface PanelSurfaceBaseProps extends Omit<
  BaseComponent<HTMLDivElement>,
  'children'
> {
  /**
   * Panel content. Typically PanelSurface.Header + PanelSurface.Body (+ optional Footer).
   */
  children?: React.ReactNode;

  /**
   * Visual density for header/footer chrome.
   * @default "md"
   */
  size?: PanelSurfaceSize;

  /**
   * Whether to show a border around the panel.
   * @default true
   */
  bordered?: boolean;

  /**
   * Optional panel background. Supports solid colors and gradients.
   * @example "linear-gradient(180deg, #2f3442 0%, #1b202a 100%)"
   */
  background?: string;
}

export type PanelSurfaceProps = Prettify<PanelSurfaceBaseProps>;

export interface PanelSurfaceHeaderBaseProps extends BaseComponent<HTMLDivElement> {
  /**
   * Header content (title/label section).
   */
  children?: React.ReactNode;

  /**
   * Optional actions shown on the right side of the header.
   */
  actions?: React.ReactNode;
}

export type PanelSurfaceHeaderProps = Prettify<PanelSurfaceHeaderBaseProps>;

export interface PanelSurfaceBodyBaseProps extends BaseComponent<HTMLDivElement> {
  /**
   * Main panel content.
   */
  children?: React.ReactNode;

  /**
   * Enables automatic scrolling for body content.
   * @default false
   */
  scroll?: boolean;

  /**
   * Body padding. Number values are treated as px.
   * @default 0
   */
  padding?: number | string;
}

export type PanelSurfaceBodyProps = Prettify<PanelSurfaceBodyBaseProps>;

export interface PanelSurfaceFooterBaseProps extends BaseComponent<HTMLDivElement> {
  /**
   * Footer content.
   */
  children?: React.ReactNode;
}

export type PanelSurfaceFooterProps = Prettify<PanelSurfaceFooterBaseProps>;

export interface PanelSurfaceContextValue {
  size: PanelSurfaceSize;
}
