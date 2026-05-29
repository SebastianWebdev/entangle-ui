'use client';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import React, { useCallback } from 'react';

import { cx } from '@/utils/cx';

import {
  cardBodyStyle,
  cardFooterStyle,
  cardHeaderLeadingStyle,
  cardHeaderStyle,
  cardHeaderSubtitleStyle,
  cardHeaderTextStyle,
  cardHeaderTitleStyle,
  cardHeaderTrailingStyle,
  cardMediaAspectVar,
  cardMediaImageStyle,
  cardMediaStyle,
  cardRecipe,
} from './Card.css';

import type {
  CardBodyProps,
  CardFooterProps,
  CardHeaderProps,
  CardMediaProps,
  CardProps,
} from './Card.types';

interface CardComponent extends React.FC<CardProps> {
  Header: React.FC<CardHeaderProps>;
  Media: React.FC<CardMediaProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
}

/**
 * A bounded surface representing a single semantic unit (item, summary,
 * preview). Distinct from `Paper` (a generic surface): a Card has a
 * header / media / body / footer convention and can be made interactive.
 *
 * @example
 * ```tsx
 * <Card variant="elevated" onClick={open}>
 *   <Card.Header
 *     title="Asset"
 *     subtitle="Updated 2h ago"
 *     trailing={<IconButton icon={<MoreIcon />} />}
 *   />
 *   <Card.Media src="/preview.png" alt="Preview" />
 *   <Card.Body>Description...</Card.Body>
 *   <Card.Footer>
 *     <Button>Open</Button>
 *   </Card.Footer>
 * </Card>
 * ```
 */
const CardRoot: React.FC<CardProps> = ({
  variant = 'outlined',
  onClick,
  selected = false,
  disabled = false,
  className,
  style,
  testId,
  children,
  ref,
  ...rest
}) => {
  const interactive = onClick !== undefined && !disabled;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive || !onClick) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick(event as unknown as React.MouseEvent<HTMLDivElement>);
      }
    },
    [interactive, onClick]
  );

  return (
    <div
      ref={ref}
      className={cx(
        cardRecipe({
          variant,
          interactive: interactive || undefined,
          selected: selected || undefined,
          disabled: disabled || undefined,
        }),
        className
      )}
      style={style}
      data-testid={testId}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-disabled={disabled || undefined}
      aria-pressed={interactive && selected ? true : undefined}
      {...rest}
    >
      {children}
    </div>
  );
};

CardRoot.displayName = 'Card';

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}) => (
  <div
    ref={ref}
    className={cx(cardHeaderStyle, className)}
    style={style}
    data-testid={testId}
    {...rest}
  >
    {leading && <div className={cardHeaderLeadingStyle}>{leading}</div>}
    <div className={cardHeaderTextStyle}>
      {children ?? (
        <>
          {title && <h3 className={cardHeaderTitleStyle}>{title}</h3>}
          {subtitle && <p className={cardHeaderSubtitleStyle}>{subtitle}</p>}
        </>
      )}
    </div>
    {trailing && <div className={cardHeaderTrailingStyle}>{trailing}</div>}
  </div>
);

CardHeader.displayName = 'Card.Header';

const CardMedia: React.FC<CardMediaProps> = ({
  src,
  alt,
  aspectRatio = 16 / 9,
  className,
  style,
  testId,
  children,
  ref,
  ...rest
}) => (
  <div
    ref={ref}
    className={cx(cardMediaStyle, className)}
    style={{
      ...assignInlineVars({ [cardMediaAspectVar]: String(aspectRatio) }),
      ...style,
    }}
    data-testid={testId}
    {...rest}
  >
    {src ? (
      <img className={cardMediaImageStyle} src={src} alt={alt ?? ''} />
    ) : (
      children
    )}
  </div>
);

CardMedia.displayName = 'Card.Media';

const CardBody: React.FC<CardBodyProps> = ({
  className,
  style,
  testId,
  children,
  ref,
  ...rest
}) => (
  <div
    ref={ref}
    className={cx(cardBodyStyle, className)}
    style={style}
    data-testid={testId}
    {...rest}
  >
    {children}
  </div>
);

CardBody.displayName = 'Card.Body';

const CardFooter: React.FC<CardFooterProps> = ({
  align = 'right',
  className,
  style,
  testId,
  children,
  ref,
  ...rest
}) => (
  <div
    ref={ref}
    className={cx(cardFooterStyle({ align }), className)}
    style={style}
    data-testid={testId}
    {...rest}
  >
    {children}
  </div>
);

CardFooter.displayName = 'Card.Footer';

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Media: CardMedia,
  Body: CardBody,
  Footer: CardFooter,
}) as CardComponent;
