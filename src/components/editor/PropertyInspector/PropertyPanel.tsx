import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import { ScrollArea } from '@/components/layout/ScrollArea';
import type {
  PropertyInspectorSize,
  PropertyPanelContextValue,
  PropertyPanelProps,
} from './PropertyInspector.types';

// --- Context ---

const PropertyPanelContext =
  /*#__PURE__*/ createContext<PropertyPanelContextValue | null>(null);

/**
 * Returns the PropertyPanel context value, or null if not inside a PropertyPanel.
 * Child components use this to inherit size and search query from the panel.
 */
export function usePropertyPanelContext(): PropertyPanelContextValue | null {
  return useContext(PropertyPanelContext);
}

export { PropertyPanelContext };

// --- Size map ---

interface SearchInputSizeConfig {
  height: number;
  fontKey: keyof import('@/theme').Theme['typography']['fontSize'];
  paddingKey: keyof import('@/theme').Theme['spacing'];
}

const SEARCH_SIZE_MAP: Record<PropertyInspectorSize, SearchInputSizeConfig> = {
  sm: { height: 20, fontKey: 'md', paddingKey: 'sm' },
  md: { height: 24, fontKey: 'md', paddingKey: 'md' },
  lg: { height: 28, fontKey: 'lg', paddingKey: 'md' },
};

// --- Styled ---

interface StyledPanelRootProps {
  $css?: PropertyPanelProps['css'];
}

const StyledPanelRoot = styled.div<StyledPanelRootProps>`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.typography.fontFamily.sans};

  ${props => processCss(props.$css, props.theme)}
`;

const StyledPanelHeader = styled.div`
  flex-shrink: 0;
  border-bottom: 1px solid ${props => props.theme.colors.border.default};
`;

const StyledSearchWrapper = styled.div`
  padding: ${props => props.theme.spacing.sm}px
    ${props => props.theme.spacing.md}px;
`;

interface StyledSearchInputProps {
  $size: PropertyInspectorSize;
}

const StyledSearchInput = styled.input<StyledSearchInputProps>`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.md}px;
  background: ${props => props.theme.colors.surface.default};
  color: ${props => props.theme.colors.text.primary};
  height: ${props => SEARCH_SIZE_MAP[props.$size].height}px;
  font-size: ${props =>
    props.theme.typography.fontSize[SEARCH_SIZE_MAP[props.$size].fontKey]}px;
  padding: 0
    ${props => props.theme.spacing[SEARCH_SIZE_MAP[props.$size].paddingKey]}px;
  font-family: inherit;
  outline: none;
  transition:
    border-color ${props => props.theme.transitions.fast},
    box-shadow ${props => props.theme.transitions.fast};

  &:focus {
    border-color: ${props => props.theme.colors.border.focus};
    box-shadow: ${props => props.theme.shadows.focus};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }
`;

interface StyledPanelContentProps {
  $contentTopSpacing?: number;
  $contentBottomSpacing?: number;
}

const StyledPanelContent = styled.div<StyledPanelContentProps>`
  flex: 1;
  min-height: 0;
  padding: ${props => props.$contentTopSpacing ?? props.theme.spacing.sm}px
    ${props => props.theme.spacing.md}px
    ${props => props.$contentBottomSpacing ?? props.theme.spacing.md}px;
  box-sizing: border-box;
`;

const StyledPanelFooter = styled.div`
  flex-shrink: 0;
  border-top: 1px solid ${props => props.theme.colors.border.default};
`;

// --- Component ---

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  children,
  header,
  footer,
  size = 'md',
  maxHeight,
  searchable = false,
  searchPlaceholder = 'Search properties...',
  onSearchChange,
  contentTopSpacing,
  contentBottomSpacing,
  css,
  className,
  style,
  testId,
  ref,
  ...rest
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      onSearchChange?.(query);
    },
    [onSearchChange]
  );

  const contextValue = useMemo<PropertyPanelContextValue>(
    () => ({
      size,
      searchQuery: searchQuery.toLowerCase(),
    }),
    [size, searchQuery]
  );

  const hasHeader = header != null || searchable;
  const hasFooter = footer != null;

  const content = (
    <StyledPanelContent
      $contentTopSpacing={contentTopSpacing}
      $contentBottomSpacing={contentBottomSpacing}
    >
      {children}
    </StyledPanelContent>
  );

  return (
    <PropertyPanelContext.Provider value={contextValue}>
      <StyledPanelRoot
        ref={ref}
        role="region"
        aria-label="Properties"
        $css={css}
        className={className}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {hasHeader && (
          <StyledPanelHeader>
            {header}
            {searchable && (
              <StyledSearchWrapper>
                <StyledSearchInput
                  type="search"
                  role="searchbox"
                  aria-label="Search properties"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  $size={size}
                />
              </StyledSearchWrapper>
            )}
          </StyledPanelHeader>
        )}

        {maxHeight != null ? (
          <ScrollArea
            maxHeight={maxHeight}
            direction="vertical"
            scrollbarVisibility="auto"
            fadeMask
          >
            {content}
          </ScrollArea>
        ) : (
          content
        )}

        {hasFooter && <StyledPanelFooter>{footer}</StyledPanelFooter>}
      </StyledPanelRoot>
    </PropertyPanelContext.Provider>
  );
};

PropertyPanel.displayName = 'PropertyPanel';
