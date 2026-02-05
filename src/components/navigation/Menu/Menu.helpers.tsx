import React from 'react';
import { Menu as BaseMenu } from '@base-ui-components/react/menu';

import { ChevronUpIcon } from '@/components/Icons';
import { Text } from '@/components/primitives/Text';
import { Stack } from '@/components/layout/Stack';

import type {
  MenuItem,
  MenuGroup,
  MenuSelection,
  MenuProps,
} from './Menu.types';
import {
  StyledMenuContent,
  StyledMenuItem,
  StyledRadioItem,
  StyledCheckboxItem,
  StyledMenuItemContent,
  StyledIconContainer,
  StyledIcon,
  StyledChevronIcon,
} from './Menu.styled';

/**
 * Helper function to render menu item content with consistent structure.
 */
export const renderMenuItemContent = (
  item: MenuItem,
  iconSlot?: React.ReactNode
): React.ReactNode => (
  <StyledMenuItemContent>
    {iconSlot && <StyledIconContainer>{iconSlot}</StyledIconContainer>}
    <Stack direction="row" justify="space-between" align="center" expand>
      <Text variant="caption" color="primary">
        {item.label}
      </Text>
      {item.subMenu && (
        <StyledChevronIcon>
          <ChevronUpIcon size="sm" />
        </StyledChevronIcon>
      )}
    </Stack>
  </StyledMenuItemContent>
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
  <StyledRadioItem
    key={item.id}
    value={item.id}
    disabled={item.disabled}
    onClick={clickHandler}
  >
    {renderMenuItemContent(
      item,
      <BaseMenu.RadioItemIndicator>
        <StyledIcon $visible={isSelected}>{radioIcon}</StyledIcon>
      </BaseMenu.RadioItemIndicator>
    )}
  </StyledRadioItem>
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
  <StyledCheckboxItem
    key={item.id}
    checked={isSelected}
    disabled={item.disabled}
    onClick={clickHandler}
  >
    {renderMenuItemContent(
      item,
      <BaseMenu.CheckboxItemIndicator>
        <StyledIcon $visible={isSelected}>{checkboxIcon}</StyledIcon>
      </BaseMenu.CheckboxItemIndicator>
    )}
  </StyledCheckboxItem>
);

/**
 * Helper function to render a regular menu item without selection state.
 */
export const renderRegularItem = (
  item: MenuItem,
  _group: MenuGroup,
  clickHandler: (event: React.MouseEvent) => void
): React.ReactNode => (
  <StyledMenuItem key={item.id} disabled={item.disabled} onClick={clickHandler}>
    {renderMenuItemContent(item)}
  </StyledMenuItem>
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
      <BaseMenu.Root
        key={item.id}
        openOnHover={item.submenuTrigger !== 'click'}
      >
        <BaseMenu.SubmenuTrigger>{menuItem}</BaseMenu.SubmenuTrigger>
        <BaseMenu.Portal>
          <BaseMenu.Positioner>
            <StyledMenuContent>
              <MenuComponent
                isSubmenu
                config={item.subMenu}
                selectedItems={selectedItems}
                onChange={onChange}
                checkboxIcon={checkboxIcon}
                radioIcon={radioIcon}
              />
            </StyledMenuContent>
          </BaseMenu.Positioner>
        </BaseMenu.Portal>
      </BaseMenu.Root>
    );
  }

  return menuItem;
};
