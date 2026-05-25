'use client';

import React from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';

import { CheckIcon } from '@/components/Icons/CheckIcon';
import { CircleIcon } from '@/components/Icons/CircleIcon';
import { ChevronRightIcon } from '@/components/Icons/ChevronRightIcon';
import { Button } from '@/components/primitives/Button';
import { Text } from '@/components/primitives/Text';
import { cx } from '@/utils/cx';

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

/**
 * Positioning gaps must be plain numbers (floating-ui computes the transform
 * in JS, so a CSS `var()` can't be used here). These mirror the spacing scale
 * (`vars.spacing.*`: xs 2 · sm 4 · md 8 · lg 12), which is theme-invariant.
 */
const MENU_TRIGGER_GAP = 4; // vars.spacing.sm — menu ↔ trigger
const SUBMENU_GAP = 4; // vars.spacing.sm — submenu ↔ parent menu

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
}: MenuRootProps): React.ReactElement => (
  <BaseMenu.Root
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange ? open => onOpenChange(open) : undefined}
    modal={modal}
    disabled={disabled}
  >
    {children}
  </BaseMenu.Root>
);
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
  sideOffset = MENU_TRIGGER_GAP,
  alignOffset,
  testId,
  ref,
  ...rest
}: MenuContentProps): React.ReactElement => (
  <BaseMenu.Portal>
    <BaseMenu.Positioner
      side={side}
      align={align}
      sideOffset={sideOffset}
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
MenuContent.displayName = 'Menu.Content';

/**
 * Submenu popup. Same surface as `Content`, but defaults to a small gap from
 * the parent menu so nested panels don't visually touch.
 */
const MenuSubContent = ({
  sideOffset = SUBMENU_GAP,
  ...rest
}: MenuContentProps): React.ReactElement => (
  <MenuContent sideOffset={sideOffset} {...rest} />
);
MenuSubContent.displayName = 'Menu.SubContent';

const MenuItem = ({
  children,
  icon,
  shortcut,
  endContent,
  disabled,
  closeOnClick,
  onClick,
  className,
  testId,
  ref,
  ...rest
}: MenuItemProps): React.ReactElement => (
  <BaseMenu.Item
    ref={ref as React.Ref<HTMLElement>}
    disabled={disabled}
    closeOnClick={closeOnClick}
    onClick={onClick}
    className={cx(menuItemStyle, className)}
    data-testid={testId}
    {...rest}
  >
    <ItemLayout start={icon} shortcut={shortcut} endContent={endContent}>
      {children}
    </ItemLayout>
  </BaseMenu.Item>
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
        <Text variant="caption" color="muted" weight="semibold">
          {label}
        </Text>
      </BaseMenu.GroupLabel>
    )}
    {children}
  </BaseMenu.Group>
);
MenuGroup.displayName = 'Menu.Group';

const MenuSeparator = ({
  className,
  testId,
  ...rest
}: MenuSeparatorProps): React.ReactElement => (
  <BaseMenu.Separator
    className={cx(separatorStyle, className)}
    data-testid={testId}
    {...rest}
  />
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
    onValueChange={
      onValueChange ? value => onValueChange(value as string) : undefined
    }
    className={className}
    data-testid={testId}
    {...rest}
  >
    {children}
  </BaseMenu.RadioGroup>
);
MenuRadioGroup.displayName = 'Menu.RadioGroup';

const MenuRadioItem = ({
  children,
  value,
  indicator = <CircleIcon size="sm" />,
  shortcut,
  endContent,
  disabled,
  closeOnClick,
  onClick,
  className,
  testId,
  ref,
  ...rest
}: MenuRadioItemProps): React.ReactElement => (
  <BaseMenu.RadioItem
    ref={ref as React.Ref<HTMLElement>}
    value={value}
    disabled={disabled}
    closeOnClick={closeOnClick}
    onClick={onClick}
    className={cx(menuItemStyle, className)}
    data-testid={testId}
    {...rest}
  >
    <ItemLayout
      start={
        <BaseMenu.RadioItemIndicator>{indicator}</BaseMenu.RadioItemIndicator>
      }
      shortcut={shortcut}
      endContent={endContent}
    >
      {children}
    </ItemLayout>
  </BaseMenu.RadioItem>
);
MenuRadioItem.displayName = 'Menu.RadioItem';

const MenuCheckboxItem = ({
  children,
  checked,
  defaultChecked,
  onCheckedChange,
  indicator = <CheckIcon size="sm" />,
  shortcut,
  endContent,
  disabled,
  closeOnClick,
  onClick,
  className,
  testId,
  ref,
  ...rest
}: MenuCheckboxItemProps): React.ReactElement => (
  <BaseMenu.CheckboxItem
    ref={ref as React.Ref<HTMLElement>}
    checked={checked}
    defaultChecked={defaultChecked}
    onCheckedChange={
      onCheckedChange ? checked => onCheckedChange(checked) : undefined
    }
    disabled={disabled}
    closeOnClick={closeOnClick}
    onClick={onClick}
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

const MenuSubTrigger = ({
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
    ref={ref as React.Ref<HTMLElement>}
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
);
MenuSubTrigger.displayName = 'Menu.SubTrigger';

/**
 * Compound Menu API.
 *
 * `Content` and `SubContent` share the same popup surface; `SubContent` just
 * defaults to a gap from the parent menu.
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
  SubContent: MenuSubContent,
});
