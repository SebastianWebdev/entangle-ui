import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import type { Theme } from '@/theme';
import { Tooltip } from '@/components/primitives/Tooltip';
import { processCss } from '@/utils/styledUtils';
import { usePropertyPanelContext } from './PropertyPanel';
import type {
  PropertyInspectorSize,
  PropertyRowProps,
} from './PropertyInspector.types';

// --- Size maps ---

interface RowSizeConfig {
  minHeight: number;
  paddingVKey: keyof Theme['spacing'];
  paddingHKey: keyof Theme['spacing'];
  fontKey: keyof Theme['typography']['fontSize'];
  resetIconSize: number;
}

const ROW_SIZE_MAP: Record<PropertyInspectorSize, RowSizeConfig> = {
  sm: {
    minHeight: 22,
    paddingVKey: 'xs',
    paddingHKey: 'sm',
    fontKey: 'xs',
    resetIconSize: 10,
  },
  md: {
    minHeight: 26,
    paddingVKey: 'xs',
    paddingHKey: 'md',
    fontKey: 'sm',
    resetIconSize: 12,
  },
  lg: {
    minHeight: 30,
    paddingVKey: 'sm',
    paddingHKey: 'lg',
    fontKey: 'md',
    resetIconSize: 14,
  },
};

// --- Reset icon ---

const ResetIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 4.5h6.5a2 2 0 0 1 0 4H6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 2.5L2 4.5L4 6.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- Styled ---

const RESET_BUTTON_CLASS = 'property-row-reset';

interface StyledRowRootProps {
  $disabled: boolean;
  $visible: boolean;
  $fullWidth: boolean;
  $size: PropertyInspectorSize;
  $css?: PropertyRowProps['css'];
}

const StyledRowRoot = styled.div<StyledRowRootProps>`
  display: ${props =>
    props.$visible ? (props.$fullWidth ? 'flex' : 'flex') : 'none'};
  flex-direction: ${props => (props.$fullWidth ? 'column' : 'row')};
  align-items: ${props => (props.$fullWidth ? 'stretch' : 'center')};
  position: relative;
  min-height: ${props => ROW_SIZE_MAP[props.$size].minHeight}px;
  padding: ${props =>
      props.theme.spacing[ROW_SIZE_MAP[props.$size].paddingVKey]}px
    ${props => props.theme.spacing[ROW_SIZE_MAP[props.$size].paddingHKey]}px;
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  pointer-events: ${props => (props.$disabled ? 'none' : 'auto')};
  transition: background ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surface.hover};
  }

  &:hover .${RESET_BUTTON_CLASS} {
    opacity: 1;
  }

  ${props => processCss(props.$css, props.theme)}
`;

interface StyledRowLabelProps {
  $splitRatio: number;
  $modified: boolean;
  $size: PropertyInspectorSize;
}

const StyledRowLabel = styled.div<StyledRowLabelProps>`
  flex: 0 0 ${props => props.$splitRatio}%;
  display: flex;
  align-items: center;
  font-size: ${props =>
    props.theme.typography.fontSize[ROW_SIZE_MAP[props.$size].fontKey]}px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props =>
    props.$modified
      ? props.theme.typography.fontWeight.medium
      : props.theme.typography.fontWeight.normal};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;
  padding-right: ${props => props.theme.spacing.md}px;
`;

const StyledFullWidthLabel = styled.div<{
  $modified: boolean;
  $size: PropertyInspectorSize;
}>`
  display: flex;
  align-items: center;
  font-size: ${props =>
    props.theme.typography.fontSize[ROW_SIZE_MAP[props.$size].fontKey]}px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: ${props =>
    props.$modified
      ? props.theme.typography.fontWeight.medium
      : props.theme.typography.fontWeight.normal};
  margin-bottom: ${props => props.theme.spacing.xs}px;
  user-select: none;
`;

const StyledModifiedDot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${props => props.theme.colors.accent.primary};
  margin-right: ${props => props.theme.spacing.xs}px;
  flex-shrink: 0;
`;

interface StyledRowControlProps {
  $splitRatio: number;
}

const StyledRowControl = styled.div<StyledRowControlProps>`
  flex: 0 0 ${props => props.$splitRatio}%;
  display: flex;
  align-items: center;
  min-width: 0;
`;

const StyledFullWidthControl = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

const StyledResetButton = styled.span`
  position: absolute;
  right: ${props => props.theme.spacing.xs}px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  color: ${props => props.theme.colors.text.muted};
  transition:
    opacity ${props => props.theme.transitions.fast},
    color ${props => props.theme.transitions.fast},
    background ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text.primary};
    background: ${props => props.theme.colors.surface.active};
  }
`;

// --- Component ---

export const PropertyRow: React.FC<PropertyRowProps> = ({
  label,
  tooltip,
  children,
  fullWidth = false,
  splitRatio = [40, 60],
  modified = false,
  disabled = false,
  visible = true,
  size: sizeProp,
  action,
  onLabelContextMenu,
  onReset,
  css,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const panelCtx = usePropertyPanelContext();
  const size = sizeProp ?? panelCtx?.size ?? 'md';
  const sizeConfig = ROW_SIZE_MAP[size];

  const handleResetClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onReset?.();
    },
    [onReset]
  );

  const modifiedDot = modified ? (
    <StyledModifiedDot aria-label="Modified" data-testid="modified-dot" />
  ) : null;

  const labelText = <span>{label}</span>;

  const labelElement = tooltip ? (
    <Tooltip title={tooltip}>
      <span style={{ display: 'contents' }}>
        {modifiedDot}
        {labelText}
      </span>
    </Tooltip>
  ) : (
    <>
      {modifiedDot}
      {labelText}
    </>
  );

  return (
    <StyledRowRoot
      ref={ref}
      $disabled={disabled}
      $visible={visible}
      $fullWidth={fullWidth}
      $size={size}
      $css={css}
      className={className}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {fullWidth ? (
        <>
          <StyledFullWidthLabel
            $modified={modified}
            $size={size}
            onContextMenu={onLabelContextMenu}
          >
            {labelElement}
          </StyledFullWidthLabel>
          <StyledFullWidthControl>{children}</StyledFullWidthControl>
        </>
      ) : (
        <>
          <StyledRowLabel
            $splitRatio={splitRatio[0]}
            $modified={modified}
            $size={size}
            onContextMenu={onLabelContextMenu}
          >
            {labelElement}
          </StyledRowLabel>
          <StyledRowControl $splitRatio={splitRatio[1]}>
            {children}
          </StyledRowControl>
        </>
      )}

      {action}

      {onReset && (
        <StyledResetButton
          className={RESET_BUTTON_CLASS}
          role="button"
          tabIndex={0}
          aria-label="Reset to default"
          onClick={handleResetClick}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onReset();
            }
          }}
          data-testid="reset-button"
        >
          <ResetIcon size={sizeConfig.resetIconSize} />
        </StyledResetButton>
      )}
    </StyledRowRoot>
  );
};

PropertyRow.displayName = 'PropertyRow';
