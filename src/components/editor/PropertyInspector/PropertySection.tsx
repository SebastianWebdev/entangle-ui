import React, { useCallback, useId, useState } from 'react';
import styled from '@emotion/styled';
import type { Theme } from '@/theme';
import { usePropertyPanelContext } from './PropertyPanel';
import type {
  PropertyInspectorSize,
  PropertySectionProps,
} from './PropertyInspector.types';

// --- Size maps ---

interface TriggerSizeConfig {
  height: number;
  paddingKey: keyof Theme['spacing'];
  fontKey: keyof Theme['typography']['fontSize'];
  chevronSize: number;
}

const TRIGGER_SIZE_MAP: Record<PropertyInspectorSize, TriggerSizeConfig> = {
  sm: { height: 24, paddingKey: 'sm', fontKey: 'md', chevronSize: 10 },
  md: { height: 28, paddingKey: 'md', fontKey: 'md', chevronSize: 12 },
  lg: { height: 32, paddingKey: 'lg', fontKey: 'lg', chevronSize: 14 },
};

// --- Chevron icon ---

const ChevronRightIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4.5 3L7.5 6L4.5 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- Styled ---

const StyledSectionRoot = styled.div`
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.md}px;
  overflow: hidden;

  & + & {
    margin-top: ${props => props.theme.spacing.sm}px;
  }
`;

interface StyledSectionTriggerProps {
  $size: PropertyInspectorSize;
  $disabled: boolean;
  $expanded: boolean;
  $css?: PropertySectionProps['css'];
}

const StyledSectionTrigger = styled.button<StyledSectionTriggerProps>`
  /* Reset */
  margin: 0;
  border: none;
  font-family: inherit;
  outline: none;
  user-select: none;
  width: 100%;
  text-align: left;

  /* Layout */
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm}px;

  /* Sizing */
  height: ${props => TRIGGER_SIZE_MAP[props.$size].height}px;
  padding: 0
    ${props => props.theme.spacing[TRIGGER_SIZE_MAP[props.$size].paddingKey]}px;
  font-size: ${props =>
    props.theme.typography.fontSize[TRIGGER_SIZE_MAP[props.$size].fontKey]}px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};

  /* Colors */
  background: ${props => props.theme.colors.surface.default};
  color: ${props => props.theme.colors.text.primary};
  border-bottom: ${props =>
    props.$expanded
      ? `1px solid ${props.theme.colors.border.default}`
      : 'none'};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  transition: background ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.surface.hover};
  }

  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
    z-index: 1;
  }
`;

interface StyledChevronProps {
  $expanded: boolean;
  $size: number;
}

const StyledChevron = styled.span<StyledChevronProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform ${props => props.theme.transitions.fast};
  transform: rotate(${props => (props.$expanded ? '90deg' : '0deg')});
  color: ${props => props.theme.colors.text.muted};

  svg {
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
  }
`;

const StyledIconArea = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const StyledSectionLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledActionsArea = styled.span`
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: ${props => props.theme.spacing.xs}px;
`;

interface StyledContentWrapperProps {
  $expanded: boolean;
}

const StyledContentWrapper = styled.div<StyledContentWrapperProps>`
  display: grid;
  grid-template-rows: ${props => (props.$expanded ? '1fr' : '0fr')};
  transition: grid-template-rows ${props => props.theme.transitions.normal};
`;

const StyledContentInner = styled.div`
  overflow: hidden;
  min-height: 0;
`;

// --- Component ---

export const PropertySection: React.FC<PropertySectionProps> = ({
  title,
  icon,
  actions,
  expanded: expandedProp,
  defaultExpanded = true,
  onExpandedChange,
  keepMounted = false,
  disabled = false,
  size: sizeProp,
  indicator,
  onContextMenu,
  children,
  className,
  style,
  css,
  testId,
  ref,
  ...rest
}) => {
  const autoId = useId();
  const triggerId = `property-section-${autoId}-trigger`;
  const contentId = `property-section-${autoId}-content`;

  const panelCtx = usePropertyPanelContext();
  const size = sizeProp ?? panelCtx?.size ?? 'md';
  const sizeConfig = TRIGGER_SIZE_MAP[size];

  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = expandedProp !== undefined;
  const resolvedExpanded = isControlled ? expandedProp : internalExpanded;

  const handleToggle = useCallback(() => {
    if (disabled) return;

    const nextExpanded = !resolvedExpanded;

    if (!isControlled) {
      setInternalExpanded(nextExpanded);
    }

    onExpandedChange?.(nextExpanded);
  }, [disabled, resolvedExpanded, isControlled, onExpandedChange]);

  const handleActionsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const showIndicator = indicator !== null;

  return (
    <StyledSectionRoot
      ref={ref}
      className={className}
      style={style}
      data-testid={testId}
      {...rest}
    >
      <StyledSectionTrigger
        type="button"
        id={triggerId}
        aria-expanded={resolvedExpanded}
        aria-controls={contentId}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={handleToggle}
        onContextMenu={onContextMenu}
        $size={size}
        $disabled={disabled}
        $expanded={resolvedExpanded}
        $css={css}
      >
        {showIndicator && (
          <StyledChevron
            $expanded={resolvedExpanded}
            $size={sizeConfig.chevronSize}
          >
            {indicator ?? <ChevronRightIcon size={sizeConfig.chevronSize} />}
          </StyledChevron>
        )}
        {icon && <StyledIconArea>{icon}</StyledIconArea>}
        <StyledSectionLabel>{title}</StyledSectionLabel>
        {actions && (
          <StyledActionsArea onClick={handleActionsClick}>
            {actions}
          </StyledActionsArea>
        )}
      </StyledSectionTrigger>

      {(resolvedExpanded || keepMounted) && (
        <StyledContentWrapper
          $expanded={resolvedExpanded}
          role="region"
          id={contentId}
          aria-labelledby={triggerId}
          hidden={!resolvedExpanded || undefined}
        >
          <StyledContentInner>{children}</StyledContentInner>
        </StyledContentWrapper>
      )}
    </StyledSectionRoot>
  );
};

PropertySection.displayName = 'PropertySection';
