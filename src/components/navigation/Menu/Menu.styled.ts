import { Menu as BaseMenu } from '@base-ui-components/react/menu';
import styled from '@emotion/styled';

import type { Theme } from '@/theme';

/**
 * Props for styled menu items that support disabled state.
 */
export interface StyledMenuItemProps {
  disabled?: boolean;
}

/**
 * Props for styled icon with visibility toggle.
 */
export interface StyledIconProps {
  $visible: boolean;
}

export const StyledMenuContent = styled(BaseMenu.Popup)<{ theme?: Theme }>`
  min-width: 200px;
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.md}px;
  box-shadow: ${props => props.theme.shadows.md};
  padding: ${props => props.theme.spacing.sm}px;
  z-index: ${props => props.theme.zIndex.dropdown};
`;

/** Shared styles for interactive menu items */
const interactiveItemStyles = (
  props: StyledMenuItemProps & { theme: Theme }
) => `
  display: flex;
  align-items: center;
  padding: ${props.theme.spacing.sm}px;
  border-radius: ${props.theme.borderRadius.sm}px;
  cursor: pointer;
  user-select: none;
  outline: none;

  color: ${
    props.disabled
      ? props.theme.colors.text.disabled
      : props.theme.colors.text.primary
  };

  ${
    props.disabled
      ? `
    cursor: not-allowed;
    pointer-events: none;
  `
      : ''
  }

  &:hover:not([data-disabled]) {
    background: ${props.theme.colors.surface.hover};
  }

  &:focus-visible {
    background: ${props.theme.colors.surface.hover};
    outline: 2px solid ${props.theme.colors.border.focus};
    outline-offset: -2px;
  }
`;

export const StyledMenuItem = styled(BaseMenu.Item)<
  StyledMenuItemProps & { theme?: Theme }
>`
  ${props =>
    interactiveItemStyles(props as StyledMenuItemProps & { theme: Theme })}
`;

export const StyledRadioItem = styled(BaseMenu.RadioItem)<
  StyledMenuItemProps & { theme?: Theme }
>`
  ${props =>
    interactiveItemStyles(props as StyledMenuItemProps & { theme: Theme })}
`;

export const StyledCheckboxItem = styled(BaseMenu.CheckboxItem)<
  StyledMenuItemProps & { theme?: Theme }
>`
  ${props =>
    interactiveItemStyles(props as StyledMenuItemProps & { theme: Theme })}
`;

export const StyledMenuItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm}px;
  flex: 1;
  min-height: 20px;
`;

export const StyledIconContainer = styled.div<{ theme?: Theme }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

export const StyledIcon = styled.div<StyledIconProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: ${props => (props.$visible ? 'visible' : 'hidden')};
`;

export const StyledChevronIcon = styled.div<{ theme?: Theme }>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: ${props => props.theme.spacing.sm}px;
  transform: rotate(90deg);
  color: ${props => props.theme.colors.text.muted};
`;

export const StyledSeparator = styled(BaseMenu.Separator)<{ theme?: Theme }>`
  margin: ${props => props.theme.spacing.xs}px 0;
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;
