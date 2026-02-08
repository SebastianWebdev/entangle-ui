import React from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import { useDialogContext } from './Dialog';
import type { DialogHeaderProps } from './Dialog.types';

// --- Styled components ---

const StyledHeader = styled.div<{
  $css?: DialogHeaderProps['css'];
}>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md}px
    ${props => props.theme.spacing.lg}px;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
  flex-shrink: 0;

  ${props => processCss(props.$css, props.theme)}
`;

const StyledHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs}px;
  min-width: 0;
  flex: 1;
`;

const StyledTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg}px;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

const StyledDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm}px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeight.normal};
`;

const StyledCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  margin: 0;
  margin-left: ${props => props.theme.spacing.md}px;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background ${props => props.theme.transitions.fast},
    color ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surface.hover};
    color: ${props => props.theme.colors.text.primary};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${props => props.theme.shadows.focus};
  }
`;

// --- Component ---

/**
 * DialogHeader renders the title, optional description, and close button
 * for a Dialog.
 *
 * @example
 * ```tsx
 * <DialogHeader description="This cannot be undone">
 *   Delete Item
 * </DialogHeader>
 * ```
 */
export const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  showClose = true,
  description,
  className,
  style,
  css,
  testId,
  ref,
  ...rest
}) => {
  const { onClose, titleId, descriptionId } = useDialogContext();

  return (
    <StyledHeader
      ref={ref}
      className={className}
      style={style}
      $css={css}
      data-testid={testId}
      {...rest}
    >
      <StyledHeaderContent>
        <StyledTitle id={titleId}>{children}</StyledTitle>
        {description && (
          <StyledDescription id={descriptionId}>
            {description}
          </StyledDescription>
        )}
      </StyledHeaderContent>
      {showClose && (
        <StyledCloseButton
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          data-testid={testId ? `${testId}-close` : undefined}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L11 11M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </StyledCloseButton>
      )}
    </StyledHeader>
  );
};

DialogHeader.displayName = 'DialogHeader';
