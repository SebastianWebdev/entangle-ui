'use client';

import React from 'react';
import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import type { MenuRootActions } from '@base-ui/react/menu';

import { cx } from '@/utils/cx';

import { menuContentStyle } from '../Menu/Menu.css';
import { MenuGapContext, DEFAULT_MENU_GAP } from '../Menu/MenuGapContext';
import type {
  ContextMenuProps,
  ContextMenuTriggerProps,
  ContextMenuContentProps,
} from './ContextMenu.types';

/**
 * Right-click context menu, built on `@base-ui/react` ContextMenu primitives.
 *
 * Compose the trigger area and content as children. Reuse the shared `Menu.*`
 * primitives for items, or pass a fully custom panel into
 * `ContextMenu.Content`. Define separate menus per area by giving each area its
 * own `ContextMenu`.
 *
 * @example
 * ```tsx
 * <ContextMenu>
 *   <ContextMenu.Trigger>
 *     <div className="viewport">Right-click me</div>
 *   </ContextMenu.Trigger>
 *   <ContextMenu.Content>
 *     <Menu.Item icon={<CutIcon />} shortcut="⌘X">Cut</Menu.Item>
 *     <Menu.Item icon={<CopyIcon />} shortcut="⌘C">Copy</Menu.Item>
 *   </ContextMenu.Content>
 * </ContextMenu>
 * ```
 */
const ContextMenuRoot = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  gap = DEFAULT_MENU_GAP,
  ref,
}: ContextMenuProps): React.ReactElement => {
  const actionsRef = React.useRef<MenuRootActions | null>(null);
  React.useImperativeHandle(
    ref,
    () => ({ close: () => actionsRef.current?.close() }),
    []
  );
  return (
    <MenuGapContext.Provider value={gap}>
      <BaseContextMenu.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        disabled={disabled}
        actionsRef={actionsRef}
      >
        {children}
      </BaseContextMenu.Root>
    </MenuGapContext.Provider>
  );
};
ContextMenuRoot.displayName = 'ContextMenu';

const ContextMenuTrigger = ({
  children,
  render,
  className,
  style,
  testId,
  ref,
  ...rest
}: ContextMenuTriggerProps): React.ReactElement => (
  <BaseContextMenu.Trigger
    ref={ref}
    render={render}
    className={className}
    // With `render`, the user's element is the trigger, so no wrapper is
    // needed; otherwise wrap so the trigger is transparent to layout.
    style={render ? style : { display: 'contents', ...style }}
    data-testid={testId}
    {...rest}
  >
    {render ? undefined : children}
  </BaseContextMenu.Trigger>
);
ContextMenuTrigger.displayName = 'ContextMenu.Trigger';

const ContextMenuContent = ({
  children,
  className,
  testId,
  ref,
  ...rest
}: ContextMenuContentProps): React.ReactElement => (
  <BaseContextMenu.Portal>
    <BaseContextMenu.Positioner>
      <BaseContextMenu.Popup
        ref={ref}
        className={cx(menuContentStyle, className)}
        data-testid={testId}
        {...rest}
      >
        {children}
      </BaseContextMenu.Popup>
    </BaseContextMenu.Positioner>
  </BaseContextMenu.Portal>
);
ContextMenuContent.displayName = 'ContextMenu.Content';

/**
 * Compound ContextMenu API. Items reuse the shared `Menu.*` primitives.
 */
export const ContextMenu = /*#__PURE__*/ Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
});
