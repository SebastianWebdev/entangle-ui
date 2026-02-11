import React from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';

import { ChevronUpIcon } from '@/components/Icons';
import { Text } from '@/components/primitives/Text';
import { Stack } from '@/components/layout/Stack';
import { cx } from '@/utils/cx';

import type {
  MenuItem,
  MenuGroup,
  MenuSelection,
  MenuProps,
} from './Menu.types';
import {
  menuContentStyle,
  menuItemStyle,
  menuItemDisabledStyle,
  radioItemStyle,
  checkboxItemStyle,
  menuItemContentStyle,
  iconContainerStyle,
  iconVisibleStyle,
  iconHiddenStyle,
  chevronIconStyle,
} from './Menu.css';

/**
 * Helper function to render menu item content with consistent structure.
 */
export const renderMenuItemContent = (
  item: MenuItem,
  iconSlot?: React.ReactNode
): React.ReactNode => (
  <div className={menuItemContentStyle}>
    {iconSlot && <div className={iconContainerStyle}>{iconSlot}</div>}
    <Stack direction="row" justify="space-between" align="center" expand>
      <Text variant="caption" size="md" color="primary">
        {item.label}
      </Text>
      {item.subMenu && (
        <div className={chevronIconStyle}>
          <ChevronUpIcon size="sm" />
        </div>
      )}
    </Stack>
  </div>
);

/**
 * Helper function to render a radio menu item.
 */
export const renderRadioItem = (
  item: MenuItem,
  _group: MenuGroup,
  isSelected: boolean,
  radioIcon: React.ReactNode,
  clickHandler: (event: React.MouseEvent) => void
): React.ReactNode => (
  <BaseMenu.RadioItem
    key={item.id}
    value={item.id}
    disabled={item.disabled}
    onClick={clickHandler}
    className={cx(radioItemStyle, item.disabled && menuItemDisabledStyle)}
  >
    {renderMenuItemContent(
      item,
      <BaseMenu.RadioItemIndicator>
        <div className={isSelected ? iconVisibleStyle : iconHiddenStyle}>
          {radioIcon}
        </div>
      </BaseMenu.RadioItemIndicator>
    )}
  </BaseMenu.RadioItem>
);

/**
 * Helper function to render a checkbox menu item.
 */
export const renderCheckboxItem = (
  item: MenuItem,
  _group: MenuGroup,
  isSelected: boolean,
  checkboxIcon: React.ReactNode,
  clickHandler: (event: React.MouseEvent) => void
): React.ReactNode => (
  <BaseMenu.CheckboxItem
    key={item.id}
    checked={isSelected}
    disabled={item.disabled}
    onClick={clickHandler}
    className={cx(checkboxItemStyle, item.disabled && menuItemDisabledStyle)}
  >
    {renderMenuItemContent(
      item,
      <BaseMenu.CheckboxItemIndicator>
        <div className={isSelected ? iconVisibleStyle : iconHiddenStyle}>
          {checkboxIcon}
        </div>
      </BaseMenu.CheckboxItemIndicator>
    )}
  </BaseMenu.CheckboxItem>
);

/**
 * Helper function to render a regular menu item without selection state.
 */
export const renderRegularItem = (
  item: MenuItem,
  _group: MenuGroup,
  clickHandler: (event: React.MouseEvent) => void
): React.ReactNode => (
  <BaseMenu.Item
    key={item.id}
    disabled={item.disabled}
    onClick={clickHandler}
    className={cx(menuItemStyle, item.disabled && menuItemDisabledStyle)}
  >
    {renderMenuItemContent(
      item,
      item.icon ? (
        <div className={iconVisibleStyle}>{item.icon}</div>
      ) : undefined
    )}
  </BaseMenu.Item>
);

/**
 * Helper function to render a menu item based on group selection type.
 */
export const renderMenuItem = (
  item: MenuItem,
  group: MenuGroup,
  isSelected: boolean,
  checkboxIcon: React.ReactNode,
  radioIcon: React.ReactNode,
  clickHandler: (event: React.MouseEvent) => void
): React.ReactNode => {
  switch (group.itemSelectionType) {
    case 'radio':
      return renderRadioItem(item, group, isSelected, radioIcon, clickHandler);
    case 'checkbox':
      return renderCheckboxItem(
        item,
        group,
        isSelected,
        checkboxIcon,
        clickHandler
      );
    case 'none':
    default:
      return renderRegularItem(item, group, clickHandler);
  }
};

/**
 * Helper function to render a menu item with optional submenu wrapper.
 */
export const renderItemWithSubmenu = (
  item: MenuItem,
  group: MenuGroup,
  isSelected: boolean,
  checkboxIcon: React.ReactNode,
  radioIcon: React.ReactNode,
  selectedItems: MenuSelection,
  clickHandler: (event: React.MouseEvent) => void,
  onChange: ((selection: MenuSelection) => void) | undefined,
  MenuComponent: React.FC<MenuProps>
): React.ReactNode => {
  const menuItem = renderMenuItem(
    item,
    group,
    isSelected,
    checkboxIcon,
    radioIcon,
    clickHandler
  );

  // If item has submenu, wrap it in submenu structure
  if (item.subMenu) {
    return (
      <BaseMenu.Root key={item.id}>
        <BaseMenu.SubmenuTrigger>{menuItem}</BaseMenu.SubmenuTrigger>
        <BaseMenu.Portal>
          <BaseMenu.Positioner>
            <BaseMenu.Popup className={menuContentStyle}>
              <MenuComponent
                isSubmenu
                config={item.subMenu}
                selectedItems={selectedItems}
                onChange={onChange}
                checkboxIcon={checkboxIcon}
                radioIcon={radioIcon}
              />
            </BaseMenu.Popup>
          </BaseMenu.Positioner>
        </BaseMenu.Portal>
      </BaseMenu.Root>
    );
  }

  return menuItem;
};
