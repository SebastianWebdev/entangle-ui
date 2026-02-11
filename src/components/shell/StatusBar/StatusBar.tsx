'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { cx } from '@/utils/cx';
import type {
  StatusBarProps,
  StatusBarSectionProps,
  StatusBarItemProps,
  StatusBarContextValue,
} from './StatusBar.types';
import {
  statusBarRoot,
  statusBarSection,
  itemButton,
  itemSpan,
  badge,
} from './StatusBar.css';

const StatusBarContext = /*#__PURE__*/ createContext<StatusBarContextValue>({
  size: 'sm',
});

const useStatusBar = () => useContext(StatusBarContext);

// --- Sub-components ---

const StatusBarSection = /*#__PURE__*/ React.memo<StatusBarSectionProps>(
  ({
    $side = 'left',
    children,

    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    return (
      <div
        ref={ref}
        className={cx(statusBarSection({ side: $side }), className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

StatusBarSection.displayName = 'StatusBar.Section';

const StatusBarItem = /*#__PURE__*/ React.memo<StatusBarItemProps>(
  ({
    onClick,
    icon,
    children,
    title,
    badge: badgeProp,
    disabled = false,

    className,
    style,
    testId,
    ref,
    ...rest
  }) => {
    useStatusBar();

    const content = (
      <>
        {icon}
        {children && <span>{children}</span>}
        {badgeProp !== undefined && badgeProp !== false && (
          <span className={badge({ dot: badgeProp === true })}>
            {typeof badgeProp === 'number' ? badgeProp : null}
          </span>
        )}
      </>
    );

    if (onClick) {
      return (
        <button
          onClick={onClick}
          title={title}
          disabled={disabled}
          className={cx(itemButton, className)}
          style={style}
          data-testid={testId}
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          {...rest}
        >
          {content}
        </button>
      );
    }

    return (
      <span
        title={title}
        className={cx(itemSpan, className)}
        style={style}
        data-testid={testId}
        ref={ref as React.Ref<HTMLSpanElement>}
        {...rest}
      >
        {content}
      </span>
    );
  }
);

StatusBarItem.displayName = 'StatusBar.Item';

// --- Root Component ---

const StatusBarRoot: React.FC<StatusBarProps> = ({
  $size = 'sm',
  $variant = 'default',
  children,

  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const contextValue = useMemo(() => ({ size: $size }), [$size]);

  return (
    <StatusBarContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cx(
          statusBarRoot({ variant: $variant, size: $size }),
          className
        )}
        style={style}
        data-testid={testId}
        role="status"
        aria-live="polite"
        {...rest}
      >
        {children}
      </div>
    </StatusBarContext.Provider>
  );
};

StatusBarRoot.displayName = 'StatusBar';

// --- Compound Component ---

export const StatusBar = /*#__PURE__*/ Object.assign(StatusBarRoot, {
  Section: StatusBarSection,
  Item: StatusBarItem,
});
