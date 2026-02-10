import React, { useMemo } from 'react';
import { ContextMenu as BaseContextMenu } from '@base-ui-components/react/context-menu';
import { CheckIcon, CircleIcon } from '@/components/Icons';
import { Text } from '@/components/primitives/Text';
import { Menu } from '../Menu/Menu';
import { useMenu, createItemClickHandler } from '../Menu/useMenu';
import { renderItemWithSubmenu } from '../Menu/Menu.helpers';
import { StyledMenuContent, StyledSeparator } from '../Menu/Menu.styled';
import type { ContextMenuProps } from './ContextMenu.types';
import { useContextMenuTarget } from './useContextMenuTarget';

export function ContextMenu<TPayload = unknown>({
  config,
  selectedItems = {},
  onChange,
  children,
  payload,
  checkboxIcon = <CheckIcon size="sm" />,
  radioIcon = <CircleIcon size="sm" />,
  disabled = false,
  className,
  style,
  testId,
  ref,
  ...rest
}: ContextMenuProps<TPayload>) {
  const { handleItemClick, isItemSelected, toggleSubmenu } = useMenu(
    selectedItems,
    onChange
  );
  const { context, onContextMenuCapture } = useContextMenuTarget(payload);

  const resolvedConfig = useMemo(() => {
    return typeof config === 'function' ? config(context) : config;
  }, [config, context]);

  const menuItems = useMemo(() => {
    return resolvedConfig.groups.map((group, groupIndex) => {
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
        groupIndex < resolvedConfig.groups.length - 1 &&
        resolvedConfig.groups.length > 1;

      return (
        <React.Fragment key={group.id}>
          <BaseContextMenu.Group>
            {group.label && (
              <BaseContextMenu.GroupLabel>
                <Text variant="caption" color="muted" weight="semibold">
                  {group.label}
                </Text>
              </BaseContextMenu.GroupLabel>
            )}
            {group.itemSelectionType === 'radio' ? (
              <BaseContextMenu.RadioGroup
                value={selectedItems[group.id]?.[0] ?? ''}
              >
                {items}
              </BaseContextMenu.RadioGroup>
            ) : (
              items
            )}
          </BaseContextMenu.Group>
          {showSeparator && <StyledSeparator />}
        </React.Fragment>
      );
    });
  }, [
    resolvedConfig,
    isItemSelected,
    handleItemClick,
    toggleSubmenu,
    checkboxIcon,
    radioIcon,
    selectedItems,
    onChange,
  ]);

  return (
    <BaseContextMenu.Root disabled={disabled}>
      <BaseContextMenu.Trigger
        onContextMenuCapture={onContextMenuCapture}
        style={{ display: 'contents' }}
      >
        {children}
      </BaseContextMenu.Trigger>
      <BaseContextMenu.Portal>
        <BaseContextMenu.Positioner>
          <StyledMenuContent
            ref={ref as React.Ref<HTMLDivElement>}
            className={className}
            style={style}
            data-testid={testId}
            {...rest}
          >
            {menuItems}
          </StyledMenuContent>
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    </BaseContextMenu.Root>
  );
}
