import React from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import type { DialogFooterProps } from './Dialog.types';

// --- Alignment map ---

const ALIGN_MAP: Record<NonNullable<DialogFooterProps['align']>, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
  'space-between': 'space-between',
};

// --- Styled components ---

const StyledFooter = styled.div<{
  $align: NonNullable<DialogFooterProps['align']>;
  $css?: DialogFooterProps['css'];
}>`
  display: flex;
  align-items: center;
  justify-content: ${props => ALIGN_MAP[props.$align]};
  gap: ${props => props.theme.spacing.md}px;
  padding: ${props => props.theme.spacing.md}px
    ${props => props.theme.spacing.lg}px;
  border-top: 1px solid ${props => props.theme.colors.border.default};
  flex-shrink: 0;

  ${props => processCss(props.$css, props.theme)}
`;

// --- Component ---

/**
 * DialogFooter renders the action area at the bottom of a Dialog.
 *
 * @example
 * ```tsx
 * <DialogFooter align="right">
 *   <Button onClick={onCancel}>Cancel</Button>
 *   <Button variant="filled" onClick={onConfirm}>Confirm</Button>
 * </DialogFooter>
 * ```
 */
export const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  align = 'right',
  className,
  style,
  css,
  testId,
  ref,
  ...rest
}) => {
  return (
    <StyledFooter
      ref={ref}
      $align={align}
      className={className}
      style={style}
      $css={css}
      data-testid={testId}
      {...rest}
    >
      {children}
    </StyledFooter>
  );
};

DialogFooter.displayName = 'DialogFooter';
