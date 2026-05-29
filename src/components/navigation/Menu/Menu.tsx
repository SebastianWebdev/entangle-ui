'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import React from 'react';

import { CheckIcon } from '@/components/Icons/CheckIcon';
import { ChevronRightIcon } from '@/components/Icons/ChevronRightIcon';
import { CircleIcon } from '@/components/Icons/CircleIcon';
import { Button } from '@/components/primitives/Button';
import { useLatest } from '@/hooks/useLatest';
import { cx } from '@/utils/cx';

import {
  menuContentStyle,
  menuItemStyle,
  itemStartSlotStyle,
  itemLabelStyle,
  itemEndSlotStyle,
  shortcutStyle,
  groupLabelStyle,
  separatorStyle,
} from './Menu.css';
import { MenuGapContext, DEFAULT_MENU_GAP } from './MenuGapContext';

import type {
  MenuRootProps,
  MenuTriggerProps,
  MenuContentProps,
  MenuItemProps,
  MenuGroupProps,
  MenuSeparatorProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuCheckboxItemProps,
  MenuSubProps,
  MenuSubTriggerProps,
} from './Menu.types';
import type { MenuRootActions } from '@base-ui/react/menu';

/**
 * Internal three-slot row used by every interactive menu entry.
 */
const ItemLayout = ({
  start,
  children,
  shortcut,
  endContent,
}: {
  start?: React.ReactNode;
  children?: React.ReactNode;
  shortcut?: React.ReactNode;
  endContent?: React.ReactNode;
}): React.ReactElement => (
  <>
    {start != null && <span className={itemStartSlotStyle}>{start}</span>}
    <span className={itemLabelStyle}>{children}</span>
    {(shortcut != null || endContent != null) && (
      <span className={itemEndSlotStyle}>
        {shortcut != null && <span className={shortcutStyle}>{shortcut}</span>}
        {endContent}
      </span>
    )}
  </>
);

/**
 * Merge `onClick` and its `onSelect` alias into one stable handler so a new
 * function identity isn't handed to Base UI on every render. Returns
 * `undefined` when neither is set, so no listener is attached.
 */
const useActivate = (
  onClick?: React.MouseEventHandler<HTMLElement>,
  onSelect?: React.MouseEventHandler<HTMLElement>
): React.MouseEventHandler<HTMLElement> | undefined => {
  const handlersRef = useLatest({ onClick, onSelect });
  const handleActivate = React.useCallback<
    React.MouseEventHandler<HTMLElement>
  >(
    event => {
      handlersRef.current.onClick?.(event);
      handlersRef.current.onSelect?.(event);
    },
    [handlersRef]
  );
  return onClick || onSelect ? handleActivate : undefined;
};

/**
 * Composable menu for editor interfaces, built on `@base-ui/react` Menu
 * primitives. Compose the trigger, content and items as children — no config
 * object.
 *
 * @example
 * ```tsx
 * <Menu>
 *   <Menu.Trigger>File</Menu.Trigger>
 *   <Menu.Content>
 *     <Menu.Item icon={<SaveIcon />} shortcut="⌘S" onClick={save}>
 *       Save
 *     </Menu.Item>
 *     <Menu.Separator />
 *     <Menu.Sub>
 *       <Menu.SubTrigger>Export</Menu.SubTrigger>
 *       <Menu.SubContent>
 *         <Menu.Item>PNG</Menu.Item>
 *         <Menu.Item>SVG</Menu.Item>
 *       </Menu.SubContent>
 *     </Menu.Sub>
 *   </Menu.Content>
 * </Menu>
 * ```
 */
const MenuRoot = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  disabled,
  gap = DEFAULT_MENU_GAP,
  ref,
}: MenuRootProps): React.ReactElement => {
  const actionsRef = React.useRef<MenuRootActions | null>(null);
  React.useImperativeHandle(
    ref,
    () => ({ close: () => actionsRef.current?.close() }),
    []
  );
  return (
    <MenuGapContext.Provider value={gap}>
      <BaseMenu.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        modal={modal}
        disabled={disabled}
        actionsRef={actionsRef}
      >
        {children}
      </BaseMenu.Root>
    </MenuGapContext.Provider>
  );
};
MenuRoot.displayName = 'Menu';

const MenuTrigger = ({
  children,
  render,
  disabled,
  openOnHover,
  className,
  testId,
  ...rest
}: MenuTriggerProps): React.ReactElement => (
  <BaseMenu.Trigger
    render={render ?? <Button />}
    disabled={disabled}
    openOnHover={openOnHover}
    className={className}
    data-testid={testId}
    {...rest}
  >
    {children}
  </BaseMenu.Trigger>
);
MenuTrigger.displayName = 'Menu.Trigger';

const MenuContent = ({
  children,
  className,
  side,
  align = 'start',
  sideOffset,
  alignOffset,
  testId,
  ref,
  ...rest
}: MenuContentProps): React.ReactElement => {
  const gap = React.useContext(MenuGapContext);
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset ?? gap}
        alignOffset={alignOffset}
      >
        <BaseMenu.Popup
          ref={ref}
          className={cx(menuContentStyle, className)}
          data-testid={testId}
          {...rest}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
};
MenuContent.displayName = 'Menu.Content';

const MenuItem = React.memo(
  ({
    children,
    icon,
    shortcut,
    endContent,
    disabled,
    closeOnClick = true,
    onClick,
    onSelect,
    className,
    testId,
    ref,
    ...rest
  }: MenuItemProps): React.ReactElement => {
    const handleActivate = useActivate(onClick, onSelect);
    return (
      <BaseMenu.Item
        ref={ref}
        disabled={disabled}
        closeOnClick={closeOnClick}
        onClick={handleActivate}
        className={cx(menuItemStyle, className)}
        data-testid={testId}
        {...rest}
      >
        <ItemLayout start={icon} shortcut={shortcut} endContent={endContent}>
          {children}
        </ItemLayout>
      </BaseMenu.Item>
    );
  }
);
MenuItem.displayName = 'Menu.Item';

const MenuGroup = ({
  children,
  label,
  className,
  testId,
  ...rest
}: MenuGroupProps): React.ReactElement => (
  <BaseMenu.Group className={className} data-testid={testId} {...rest}>
    {label != null && (
      <BaseMenu.GroupLabel className={groupLabelStyle}>
        {label}
      </BaseMenu.GroupLabel>
    )}
    {children}
  </BaseMenu.Group>
);
MenuGroup.displayName = 'Menu.Group';

const MenuSeparator = React.memo(
  ({ className, testId, ...rest }: MenuSeparatorProps): React.ReactElement => (
    <BaseMenu.Separator
      className={cx(separatorStyle, className)}
      data-testid={testId}
      {...rest}
    />
  )
);
MenuSeparator.displayName = 'Menu.Separator';

const MenuRadioGroup = ({
  children,
  value,
  defaultValue,
  onValueChange,
  className,
  testId,
  ...rest
}: MenuRadioGroupProps): React.ReactElement => (
  <BaseMenu.RadioGroup
    value={value}
    defaultValue={defaultValue}
    onValueChange={onValueChange}
    className={className}
    data-testid={testId}
    {...rest}
  >
    {children}
  </BaseMenu.RadioGroup>
);
MenuRadioGroup.displayName = 'Menu.RadioGroup';

const MenuRadioItem = React.memo(
  ({
    children,
    value,
    indicator = <CircleIcon size="sm" />,
    shortcut,
    endContent,
    disabled,
    closeOnClick = false,
    onClick,
    onSelect,
    className,
    testId,
    ref,
    ...rest
  }: MenuRadioItemProps): React.ReactElement => {
    const handleActivate = useActivate(onClick, onSelect);
    return (
      <BaseMenu.RadioItem
        ref={ref}
        value={value}
        disabled={disabled}
        closeOnClick={closeOnClick}
        onClick={handleActivate}
        className={cx(menuItemStyle, className)}
        data-testid={testId}
        {...rest}
      >
        <ItemLayout
          start={
            <BaseMenu.RadioItemIndicator>
              {indicator}
            </BaseMenu.RadioItemIndicator>
          }
          shortcut={shortcut}
          endContent={endContent}
        >
          {children}
        </ItemLayout>
      </BaseMenu.RadioItem>
    );
  }
);
MenuRadioItem.displayName = 'Menu.RadioItem';

const MenuCheckboxItem = React.memo(
  ({
    children,
    checked,
    defaultChecked,
    onCheckedChange,
    indicator = <CheckIcon size="sm" />,
    shortcut,
    endContent,
    disabled,
    closeOnClick = false,
    onClick,
    onSelect,
    className,
    testId,
    ref,
    ...rest
  }: MenuCheckboxItemProps): React.ReactElement => {
    const handleActivate = useActivate(onClick, onSelect);
    return (
      <BaseMenu.CheckboxItem
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        closeOnClick={closeOnClick}
        onClick={handleActivate}
        className={cx(menuItemStyle, className)}
        data-testid={testId}
        {...rest}
      >
        <ItemLayout
          start={
            <BaseMenu.CheckboxItemIndicator>
              {indicator}
            </BaseMenu.CheckboxItemIndicator>
          }
          shortcut={shortcut}
          endContent={endContent}
        >
          {children}
        </ItemLayout>
      </BaseMenu.CheckboxItem>
    );
  }
);
MenuCheckboxItem.displayName = 'Menu.CheckboxItem';

const MenuSub = ({
  children,
  defaultOpen,
}: MenuSubProps): React.ReactElement => (
  <BaseMenu.SubmenuRoot defaultOpen={defaultOpen}>
    {children}
  </BaseMenu.SubmenuRoot>
);
MenuSub.displayName = 'Menu.Sub';

const MenuSubTrigger = React.memo(
  ({
    children,
    icon,
    disabled,
    onClick,
    className,
    testId,
    ref,
    ...rest
  }: MenuSubTriggerProps): React.ReactElement => (
    <BaseMenu.SubmenuTrigger
      ref={ref}
      disabled={disabled}
      onClick={onClick}
      className={cx(menuItemStyle, className)}
      data-testid={testId}
      {...rest}
    >
      <ItemLayout start={icon} endContent={<ChevronRightIcon size="sm" />}>
        {children}
      </ItemLayout>
    </BaseMenu.SubmenuTrigger>
  )
);
MenuSubTrigger.displayName = 'Menu.SubTrigger';

/**
 * Compound Menu API.
 *
 * `Content` and `SubContent` are the same popup surface. The gap from the
 * anchor is set once on the `Menu` root (`gap` prop) and inherited by both.
 */
export const Menu = /*#__PURE__*/ Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Group: MenuGroup,
  Separator: MenuSeparator,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  CheckboxItem: MenuCheckboxItem,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuContent,
});
