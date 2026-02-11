'use client';

import React, { useCallback } from 'react';

import type { MenuItem, MenuGroup, MenuSelection } from './Menu.types';

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
export const createItemClickHandler =
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
