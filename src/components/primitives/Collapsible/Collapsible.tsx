import React, { useCallback, useId, useState } from 'react';
import styled from '@emotion/styled';
import type { Theme } from '@/theme';
import type { CollapsibleProps, CollapsibleSize } from './Collapsible.types';

// --- Size maps ---

interface TriggerSizeConfig {
  height: number;
  paddingKey: keyof Theme['spacing'];
  fontKey: keyof Theme['typography']['fontSize'];
  chevronSize: number;
}

const TRIGGER_SIZE_MAP: Record<CollapsibleSize, TriggerSizeConfig> = {
  sm: { height: 24, paddingKey: 'md', fontKey: 'xs', chevronSize: 10 },
  md: { height: 28, paddingKey: 'md', fontKey: 'sm', chevronSize: 12 },
  lg: { height: 32, paddingKey: 'lg', fontKey: 'md', chevronSize: 14 },
};

interface ContentSizeConfig {
  paddingVKey: keyof Theme['spacing'];
  paddingHKey: keyof Theme['spacing'];
}

const CONTENT_SIZE_MAP: Record<CollapsibleSize, ContentSizeConfig> = {
  sm: { paddingVKey: 'sm', paddingHKey: 'md' },
  md: { paddingVKey: 'md', paddingHKey: 'lg' },
  lg: { paddingVKey: 'lg', paddingHKey: 'xl' },
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

const StyledRoot = styled.div`
  display: flex;
  flex-direction: column;
`;

interface StyledTriggerProps {
  $size: CollapsibleSize;
  $disabled: boolean;
}

const StyledTrigger = styled.button<StyledTriggerProps>`
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
  background: transparent;
  color: ${props => props.theme.colors.text.muted};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  transition:
    color ${props => props.theme.transitions.fast},
    background ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props =>
      props.$disabled
        ? props.theme.colors.text.muted
        : props.theme.colors.text.primary};
  }

  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
    border-radius: ${props => props.theme.borderRadius.sm}px;
    z-index: 1;
  }
`;

interface StyledChevronProps {
  $open: boolean;
  $size: number;
}

const StyledChevron = styled.span<StyledChevronProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform ${props => props.theme.transitions.fast};
  transform: rotate(${props => (props.$open ? '90deg' : '0deg')});
  color: currentColor;

  svg {
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
  }
`;

interface StyledContentWrapperProps {
  $open: boolean;
}

const StyledContentWrapper = styled.div<StyledContentWrapperProps>`
  display: grid;
  grid-template-rows: ${props => (props.$open ? '1fr' : '0fr')};
  transition: grid-template-rows ${props => props.theme.transitions.normal};
`;

const StyledContentInner = styled.div`
  overflow: hidden;
  min-height: 0;
`;

interface StyledContentBodyProps {
  $size: CollapsibleSize;
}

const StyledContentBody = styled.div<StyledContentBodyProps>`
  padding: ${props =>
      props.theme.spacing[CONTENT_SIZE_MAP[props.$size].paddingVKey]}px
    ${props => props.theme.spacing[CONTENT_SIZE_MAP[props.$size].paddingHKey]}px;
`;

// --- Component ---

export const Collapsible: React.FC<CollapsibleProps> = ({
  trigger,
  open: openProp,
  defaultOpen = false,
  size = 'sm',
  indicator,
  disabled = false,
  keepMounted = false,
  onChange,
  children,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const autoId = useId();
  const triggerId = `collapsible-${autoId}-trigger`;
  const contentId = `collapsible-${autoId}-content`;

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const resolvedOpen = isControlled ? openProp : internalOpen;

  const handleToggle = useCallback(() => {
    if (disabled) return;

    const nextOpen = !resolvedOpen;

    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onChange?.(nextOpen);
  }, [disabled, resolvedOpen, isControlled, onChange]);

  const showIndicator = indicator !== null;
  const sizeConfig = TRIGGER_SIZE_MAP[size];

  return (
    <StyledRoot
      ref={ref}
      className={className}
      style={style}
      data-testid={testId}
      {...rest}
    >
      <StyledTrigger
        type="button"
        id={triggerId}
        aria-expanded={resolvedOpen}
        aria-controls={contentId}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={handleToggle}
        $size={size}
        $disabled={disabled}
      >
        {showIndicator && (
          <StyledChevron $open={resolvedOpen} $size={sizeConfig.chevronSize}>
            {indicator ?? <ChevronRightIcon size={sizeConfig.chevronSize} />}
          </StyledChevron>
        )}
        <span>{trigger}</span>
      </StyledTrigger>

      {(resolvedOpen || keepMounted) && (
        <StyledContentWrapper
          $open={resolvedOpen}
          role="region"
          id={contentId}
          aria-labelledby={triggerId}
          hidden={!resolvedOpen || undefined}
        >
          <StyledContentInner>
            <StyledContentBody $size={size}>{children}</StyledContentBody>
          </StyledContentInner>
        </StyledContentWrapper>
      )}
    </StyledRoot>
  );
};

Collapsible.displayName = 'Collapsible';
