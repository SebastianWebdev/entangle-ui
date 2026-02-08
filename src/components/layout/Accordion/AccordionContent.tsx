import React from 'react';
import styled from '@emotion/styled';
import { useAccordionContext, useAccordionItemContext } from './Accordion';
import type { AccordionContentProps, AccordionSize } from './Accordion.types';
import type { Theme } from '@/theme';

// --- Size maps ---

interface ContentSizeConfig {
  paddingVKey: keyof Theme['spacing'];
  paddingHKey: keyof Theme['spacing'];
}

const CONTENT_SIZE_MAP: Record<AccordionSize, ContentSizeConfig> = {
  sm: { paddingVKey: 'sm', paddingHKey: 'md' },
  md: { paddingVKey: 'md', paddingHKey: 'lg' },
  lg: { paddingVKey: 'lg', paddingHKey: 'xl' },
};

// --- Styled ---

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

interface StyledContentBodyProps {
  $size: AccordionSize;
}

const StyledContentBody = styled.div<StyledContentBodyProps>`
  padding: ${props =>
      props.theme.spacing[CONTENT_SIZE_MAP[props.$size].paddingVKey]}px
    ${props => props.theme.spacing[CONTENT_SIZE_MAP[props.$size].paddingHKey]}px;
`;

// --- Component ---

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  keepMounted = false,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const { size, accordionId } = useAccordionContext();
  const { value, isExpanded } = useAccordionItemContext();

  const triggerId = `accordion-${accordionId}-trigger-${value}`;
  const contentId = `accordion-${accordionId}-content-${value}`;

  if (!isExpanded && !keepMounted) {
    return null;
  }

  return (
    <StyledContentWrapper
      $expanded={isExpanded}
      role="region"
      id={contentId}
      aria-labelledby={triggerId}
      hidden={!isExpanded || undefined}
    >
      <StyledContentInner>
        <StyledContentBody
          ref={ref}
          $size={size}
          className={className}
          style={style}
          data-testid={testId}
          {...rest}
        >
          {children}
        </StyledContentBody>
      </StyledContentInner>
    </StyledContentWrapper>
  );
};

AccordionContent.displayName = 'AccordionContent';
