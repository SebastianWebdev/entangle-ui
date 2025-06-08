import React, { useCallback, useMemo } from 'react';
import { Menu as BaseMenu } from '@base-ui-components/react/menu';
import styled from '@emotion/styled';

import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import { CheckIcon, CircleIcon } from '@/components/Icons';
import { Button } from '@/components/primitives/Button';
import { Text } from '@/components/primitives/Text';

import type { Theme } from '@/theme';

/**
 * Configuration for a single menu item.
 */
export type MenuItem = {
  /** Unique identifier for the menu item */
  id: string;
  /** Display text for the menu item */
  label: string;
  /** Click handler called with item id and event */
  onClick: (id: string, event: MouseEvent) => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Nested submenu configuration */
  subMenu?: MenuConfig;
};

/**
 * Type of item selection behavior within a group.
 * - `radio`: Single selection within group
 * - `checkbox`: Multiple selection within group
 * - `none`: No selection state, just click handlers
 */
export type ItemSelectionType = 'radio' | 'checkbox' | 'none';

/**
 * Configuration for a group of menu items.
 * Groups are visually separated and can have different selection behaviors.
 */
export type MenuGroup = {
  /** Unique identifier for the group */
  id: string;
  /** Optional label displayed above the group */
  label?: string;
  /** Array of menu items in this group */
  items: MenuItem[];
  /** Selection behavior for items in this group */
  itemSelectionType: ItemSelectionType;
  /** Whether to close menu when any item in group is clicked */
  closeOnItemClick?: boolean;
};

/**
 * Configuration for a menu component.
 * Defines structure, behavior, and selection state.
 */
export type MenuConfig = {
  /** Whether to open menu on hover instead of click */
  openOnHover?: boolean;
  /** Array of menu groups */
  groups: MenuGroup[];
};

/**
 * Selected items state organized by group.
 * Maps group ID to array of selected item IDs.
 */
export type MenuSelection = Record<string, string[]>;

/**
 * Base props for the Menu component.
 */
export interface MenuBaseProps
  extends Omit<BaseComponent<HTMLElement>, 'onChange'> {
  /** Menu configuration object */
  config: MenuConfig;
  /** Currently selected items organized by group */
  selectedItems?: MenuSelection;
  /** Callback when selection changes */
  onChange?: (selection: MenuSelection) => void;
  /** Menu trigger element */
  children: React.ReactNode;
  /** Custom icon for checkbox selected state */
  checkboxIcon?: React.ReactNode;
  /** Custom icon for radio selected state */
  radioIcon?: React.ReactNode;
  /** Whether the menu is disabled */
  disabled?: boolean;
}

/**
 * Props for the Menu component using Prettify utility type.
 */
export type MenuProps = Prettify<MenuBaseProps>;

/**
 * Hook for managing menu selection state and interactions.
 * Handles radio/checkbox logic and state updates.
 */
export const useMenu = (
  selectedItems: MenuSelection = {},
  onChange?: (selection: MenuSelection) => void
) => {
  const handleItemClick = useCallback(
    (groupId: string, itemId: string, group: MenuGroup) => {
      if (!onChange) return;

      const currentSelection = selectedItems[groupId] ?? [];
      let newSelection: string[];

      switch (group.itemSelectionType) {
        case 'radio':
          // Radio: single selection, replace current
          newSelection = [itemId];
          break;
        case 'checkbox':
          // Checkbox: toggle selection
          newSelection = currentSelection.includes(itemId)
            ? currentSelection.filter(id => id !== itemId)
            : [...currentSelection, itemId];
          break;
        case 'none':
        default:
          // No selection state management
          return;
      }

      onChange({
        ...selectedItems,
        [groupId]: newSelection,
      });
    },
    [selectedItems, onChange]
  );

  const isItemSelected = useCallback(
    (groupId: string, itemId: string): boolean => {
      return selectedItems[groupId]?.includes(itemId) ?? false;
    },
    [selectedItems]
  );

  return {
    handleItemClick,
    isItemSelected,
  };
};

/**
 * A configuration-driven menu component for editor interfaces.
 *
 * Automatically handles radio/checkbox selection states, grouping,
 * and nested submenus based on provided configuration object.
 *
 * @example
 * ```tsx
 * const config = {
 *   groups: [{
 *     id: 'actions',
 *     items: [
 *       { id: 'copy', label: 'Copy', onClick: handleCopy },
 *       { id: 'paste', label: 'Paste', onClick: handlePaste }
 *     ],
 *     itemSelectionType: 'none'
 *   }]
 * };
 *
 * <Menu config={config}>
 *   <Button>Options</Button>
 * </Menu>
 * ```
 */
export const Menu: React.FC<MenuProps> = ({
  config,
  selectedItems = {},
  onChange,
  children,
  checkboxIcon = <CheckIcon size="sm" />,
  radioIcon = <CircleIcon size="sm" />,
  disabled = false,
  className,
  testId: testId,
  ...rest
}) => {
  const { handleItemClick, isItemSelected } = useMenu(selectedItems, onChange);

  const menuItems = useMemo(() => {
    return config.groups.map((group, groupIndex) => {
      const items = group.items.map(item => {
        const isSelected = isItemSelected(group.id, item.id);

        const handleClick = (event: React.MouseEvent) => {
          // Call original onClick handler
          item.onClick(item.id, event.nativeEvent);

          // Handle selection state
          handleItemClick(group.id, item.id, group);
        };

        // Render different item types based on selection type
        switch (group.itemSelectionType) {
          case 'radio':
            return (
              <BaseMenu.RadioItem
                key={item.id}
                value={item.id}
                disabled={item.disabled}
                onClick={handleClick}
              >
                <StyledMenuItemContent>
                  <BaseMenu.RadioItemIndicator>
                    {isSelected && radioIcon}
                  </BaseMenu.RadioItemIndicator>
                  <Text variant="caption" color="primary">
                    {item.label}
                  </Text>
                </StyledMenuItemContent>
                {item.subMenu && (
                  <StyledSubmenu>
                    <Menu
                      config={item.subMenu}
                      selectedItems={selectedItems}
                      onChange={onChange}
                      checkboxIcon={checkboxIcon}
                      radioIcon={radioIcon}
                    >
                      <div />
                    </Menu>
                  </StyledSubmenu>
                )}
              </BaseMenu.RadioItem>
            );

          case 'checkbox':
            return (
              <BaseMenu.CheckboxItem
                key={item.id}
                checked={isSelected}
                disabled={item.disabled}
                onClick={handleClick}
              >
                <StyledMenuItemContent>
                  <BaseMenu.CheckboxItemIndicator>
                    {isSelected && checkboxIcon}
                  </BaseMenu.CheckboxItemIndicator>
                  <Text variant="caption" color="primary">
                    {item.label}
                  </Text>
                </StyledMenuItemContent>
                {item.subMenu && (
                  <StyledSubmenu>
                    <Menu
                      config={item.subMenu}
                      selectedItems={selectedItems}
                      onChange={onChange}
                      checkboxIcon={checkboxIcon}
                      radioIcon={radioIcon}
                    >
                      <div />
                    </Menu>
                  </StyledSubmenu>
                )}
              </BaseMenu.CheckboxItem>
            );

          case 'none':
          default:
            return (
              <StyledMenuItem
                key={item.id}
                disabled={item.disabled}
                onClick={handleClick}
              >
                <StyledMenuItemContent>
                  <Text variant="caption" color="primary">
                    {item.label}
                  </Text>
                </StyledMenuItemContent>
                {item.subMenu && (
                  <StyledSubmenu>
                    <Menu
                      config={item.subMenu}
                      selectedItems={selectedItems}
                      onChange={onChange}
                      checkboxIcon={checkboxIcon}
                      radioIcon={radioIcon}
                    >
                      <div />
                    </Menu>
                  </StyledSubmenu>
                )}
              </StyledMenuItem>
            );
        }
      });

      // Wrap group items with BaseMenu.Group structure
      const groupContent = (
        <BaseMenu.Group key={group.id}>
          {group.label && (
            <BaseMenu.GroupLabel>
              <Text variant="caption" color="muted" weight="semibold">
                {group.label}
              </Text>
            </BaseMenu.GroupLabel>
          )}
          {group.itemSelectionType === 'radio' ? (
            <BaseMenu.RadioGroup value={selectedItems[group.id]?.[0] ?? ''}>
              {items}
            </BaseMenu.RadioGroup>
          ) : (
            items
          )}
          {/* Add separator between groups, but not after the last one */}
          {groupIndex < config.groups.length - 1 &&
            config.groups.length > 1 && <BaseMenu.Separator />}
        </BaseMenu.Group>
      );

      return groupContent;
    });
  }, [
    config,
    selectedItems,
    isItemSelected,
    handleItemClick,
    checkboxIcon,
    radioIcon,
  ]);

  return (
    <BaseMenu.Root openOnHover={config.openOnHover}>
      <BaseMenu.Trigger
        render={props => <Button {...props} />}
        disabled={disabled}
      >
        {children}
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner>
          <StyledMenuContent
            className={className}
            data-testid={testId}
            {...rest}
          >
            {menuItems}
          </StyledMenuContent>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
};

// Styled Components
interface StyledMenuItemProps {
  disabled?: boolean;
}

const StyledMenuContent = styled(BaseMenu.Popup)<{ theme?: Theme }>`
  min-width: 200px;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.md}px;
  box-shadow: ${props => props.theme.shadows.md};
  padding: ${props => props.theme.spacing.sm}px;
  z-index: 1000;
`;

const StyledMenuItem = styled(BaseMenu.Item)<
  StyledMenuItemProps & { theme?: Theme }
>`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.sm}px;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  cursor: pointer;
  user-select: none;
  outline: none;

  color: ${props =>
    props.disabled
      ? props.theme.colors.text.disabled
      : props.theme.colors.text.primary};

  ${props =>
    props.disabled &&
    `
    cursor: not-allowed;
    pointer-events: none;
  `}

  &:hover:not([data-disabled]) {
    background: ${props => props.theme.colors.surface.hover};
  }

  &:focus-visible {
    background: ${props => props.theme.colors.surface.hover};
    outline: 2px solid ${props => props.theme.colors.border.focus};
    outline-offset: -2px;
  }
`;

const StyledMenuItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm}px;
  flex: 1;
  min-height: 20px;
`;

const StyledSubmenu = styled.div`
  margin-left: auto;
`;
