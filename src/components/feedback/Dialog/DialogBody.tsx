import React from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import type { DialogBodyProps } from './Dialog.types';

// --- Styled components ---

const StyledBody = styled.div<{
  $css?: DialogBodyProps['css'];
}>`
  padding: ${props => props.theme.spacing.lg}px;
  overflow-y: auto;
  flex: 1;
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.md}px;
  line-height: ${props => props.theme.typography.lineHeight.normal};

  ${props => processCss(props.$css, props.theme)}
`;

// --- Component ---

/**
 * DialogBody renders the scrollable content area of a Dialog.
 *
 * @example
 * ```tsx
 * <DialogBody>
 *   <p>Dialog content goes here.</p>
 * </DialogBody>
 * ```
 */
export const DialogBody: React.FC<DialogBodyProps> = ({
  children,
  className,
  style,
  css,
  testId,
  ref,
  ...rest
}) => {
  return (
    <StyledBody
      ref={ref}
      className={className}
      style={style}
      $css={css}
      data-testid={testId}
      {...rest}
    >
      {children}
    </StyledBody>
  );
};

DialogBody.displayName = 'DialogBody';
