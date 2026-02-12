'use client';

import React, { useMemo } from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';

import { CheckIcon } from '@/components/Icons/CheckIcon';
import { CircleIcon } from '@/components/Icons/CircleIcon';
import { Button } from '@/components/primitives/Button';
import { Text } from '@/components/primitives/Text';
import { cx } from '@/utils/cx';

import type { MenuProps } from './Menu.types';
import { useMenu, createItemClickHandler } from './useMenu';
import { renderItemWithSubmenu } from './Menu.helpers';
import { menuContentStyle, separatorStyle } from './Menu.css';

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
          onChange,
          Menu
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
          {showSeparator && <BaseMenu.Separator className={separatorStyle} />}
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
    <BaseMenu.Root>
      <BaseMenu.Trigger
        render={props => <Button {...props} />}
        disabled={disabled}
      >
        {children}
      </BaseMenu.Trigger>

      <BaseMenu.Portal>
        <BaseMenu.Positioner>
          <BaseMenu.Popup
            className={cx(menuContentStyle, className)}
            data-testid={testId}
            {...rest}
          >
            {menuItems}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
};
