import React from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import type { PropertyGroupProps } from './PropertyInspector.types';

// --- Styled ---

interface StyledGroupRootProps {
  $indent: number;
  $disabled: boolean;
  $css?: PropertyGroupProps['css'];
}

const StyledGroupRoot = styled.div<StyledGroupRootProps>`
  display: flex;
  flex-direction: column;
  padding-left: ${props => props.$indent * props.theme.spacing.xl}px;
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  pointer-events: ${props => (props.$disabled ? 'none' : 'auto')};

  ${props => processCss(props.$css, props.theme)}
`;

const StyledGroupDivider = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md}px;
  padding: ${props => props.theme.spacing.sm}px
    ${props => props.theme.spacing.md}px;
`;

const StyledGroupTitle = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  color: ${props => props.theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  white-space: nowrap;
  flex-shrink: 0;
`;

const StyledGroupLine = styled.span`
  flex: 1;
  height: 1px;
  background: ${props => props.theme.colors.border.default};
`;

// --- Component ---

export const PropertyGroup: React.FC<PropertyGroupProps> = ({
  title,
  children,
  indent = 0,
  disabled = false,
  css,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  return (
    <StyledGroupRoot
      ref={ref}
      $indent={indent}
      $disabled={disabled}
      $css={css}
      className={className}
      style={style}
      data-testid={testId}
      {...rest}
    >
      {title != null && (
        <StyledGroupDivider>
          <StyledGroupLine />
          <StyledGroupTitle>{title}</StyledGroupTitle>
          <StyledGroupLine />
        </StyledGroupDivider>
      )}
      {children}
    </StyledGroupRoot>
  );
};

PropertyGroup.displayName = 'PropertyGroup';
