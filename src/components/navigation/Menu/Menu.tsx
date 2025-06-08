import React, { useCallback, useMemo } from 'react';
import { Menu as BaseMenu } from '@base-ui-components/react/menu';
import styled from '@emotion/styled';

import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import { CheckIcon, CircleIcon, ChevronUpIcon } from '@/components/Icons';
import { Button } from '@/components/primitives/Button';
import { Text } from '@/components/primitives/Text';
import { Stack } from '@/components/layout/Stack';

import type { Theme } from '@/theme';

/**
 * How submenus should be triggered.
 * - `hover`: Submenu opens on hover
 * - `click`: Submenu opens on click only
 */
export type SubmenuTrigger = 'hover' | 'click';

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
  /** How submenu should be triggered when subMenu is present */
  submenuTrigger?: SubmenuTrigger;
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
  children?: React.ReactNode;
  /** Custom icon for checkbox selected state */
  checkboxIcon?: React.ReactNode;
  /** Custom icon for radio selected state */
  radioIcon?: React.ReactNode;
  /** Whether the menu is disabled */
  disabled?: boolean;
  /** Whether this menu is a submenu */
  isSubmenu?: boolean;
}

/**
 * Props for the Menu component using Prettify utility type.
 */
export type MenuProps = Prettify<MenuBaseProps>;

/**
 * Hook for managing menu selection state and interactions.
 * Handles radio/checkbox logic, state updates, and submenu visibility.
 */
export const useMenu = (
  selectedItems: MenuSelection = {},
  onChange?: (selection: MenuSelection) => void
) => {
  const [openSubmenus, setOpenSubmenus] = React.useState<Set<string>>(
    new Set()
  );

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

  const toggleSubmenu = useCallback((itemId: string) => {
    setOpenSubmenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const openSubmenu = useCallback((itemId: string) => {
    setOpenSubmenus(prev => new Set(prev).add(itemId));
  }, []);

  const closeSubmenu = useCallback((itemId: string) => {
    setOpenSubmenus(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  const isSubmenuOpen = useCallback(
    (itemId: string): boolean => {
      return openSubmenus.has(itemId);
    },
    [openSubmenus]
  );

  return {
    handleItemClick,
    isItemSelected,
    toggleSubmenu,
    openSubmenu,
    closeSubmenu,
    isSubmenuOpen,
  };
};

/**
 * Helper function to create a common click handler for menu items.
 */
const createItemClickHandler =
  (
    item: MenuItem,
    group: MenuGroup,
    handleItemClick: (
      groupId: string,
      itemId: string,
      group: MenuGroup
    ) => void,
    toggleSubmenu: (itemId: string) => void
  ) =>
  (event: React.MouseEvent) => {
    // Call original onClick handler
    item.onClick(item.id, event.nativeEvent);

    // Handle submenu toggle for click trigger
    if (item.subMenu && item.submenuTrigger === 'click') {
      toggleSubmenu(item.id);
    }

    // Handle selection state
    handleItemClick(group.id, item.id, group);
  };

/**
 * Helper function to render menu item content with consistent structure.
 */
const renderMenuItemContent = (
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
const renderRadioItem = (
  item: MenuItem,
  group: MenuGroup,
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
const renderCheckboxItem = (
  item: MenuItem,
  group: MenuGroup,
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
const renderRegularItem = (
  item: MenuItem,
  group: MenuGroup,
  clickHandler: (event: React.MouseEvent) => void
): React.ReactNode => (
  <StyledMenuItem key={item.id} disabled={item.disabled} onClick={clickHandler}>
    {renderMenuItemContent(item)}
  </StyledMenuItem>
);

/**
 * Helper function to render a menu item based on group selection type.
 */
const renderMenuItem = (
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
const renderItemWithSubmenu = (
  item: MenuItem,
  group: MenuGroup,
  isSelected: boolean,
  checkboxIcon: React.ReactNode,
  radioIcon: React.ReactNode,
  selectedItems: MenuSelection,
  clickHandler: (event: React.MouseEvent) => void,
  onChange?: (selection: MenuSelection) => void
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
              <Menu
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
 *       {
 *         id: 'copy',
 *         label: 'Copy',
 *         onClick: handleCopy,
 *         subMenu: nestedConfig,
 *         submenuTrigger: 'hover' // Opens on hover (default)
 *       },
 *       {
 *         id: 'paste',
 *         label: 'Paste',
 *         onClick: handlePaste,
 *         subMenu: nestedConfig,
 *         submenuTrigger: 'click' // Opens on click only
 *       }
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
  isSubmenu = false,
  testId,
  ...rest
}) => {
  const { handleItemClick, isItemSelected, toggleSubmenu } = useMenu(
    selectedItems,
    onChange
  );

  const menuItems = useMemo(() => {
    return config.groups.map((group, groupIndex) => {
      const items = group.items.map(item => {
        const isSelected = isItemSelected(group.id, item.id);
        const clickHandler = createItemClickHandler(
          item,
          group,
          handleItemClick,
          toggleSubmenu
        );

        return renderItemWithSubmenu(
          item,
          group,
          isSelected,
          checkboxIcon,
          radioIcon,
          selectedItems,
          clickHandler,
          onChange
        );
      });

      const showSeparator =
        groupIndex < config.groups.length - 1 && config.groups.length > 1;

      // Wrap group items with BaseMenu.Group structure
      return (
        <React.Fragment key={group.id}>
          <BaseMenu.Group>
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
          </BaseMenu.Group>
          {showSeparator && <StyledSeparator />}
        </React.Fragment>
      );
    });
  }, [
    config,
    selectedItems,
    isItemSelected,
    handleItemClick,
    toggleSubmenu,
    checkboxIcon,
    radioIcon,
    onChange,
  ]);

  // For submenu, only render the content without root/trigger wrapper
  if (isSubmenu) {
    return <>{menuItems}</>;
  }

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

interface StyledIconProps {
  $visible: boolean;
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

const StyledRadioItem = styled(BaseMenu.RadioItem)<
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

const StyledCheckboxItem = styled(BaseMenu.CheckboxItem)<
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

const StyledIconContainer = styled.div<{ theme?: Theme }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const StyledIcon = styled.div<StyledIconProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: ${props => (props.$visible ? 'visible' : 'hidden')};
`;

const StyledChevronIcon = styled.div<{ theme?: Theme }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: ${props => props.theme.spacing.sm}px;
  transform: rotate(90deg);
  color: ${props => props.theme.colors.text.muted};
`;

const StyledSeparator = styled(BaseMenu.Separator)<{ theme?: Theme }>`
  margin: ${props => props.theme.spacing.xs}px 0;
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;
