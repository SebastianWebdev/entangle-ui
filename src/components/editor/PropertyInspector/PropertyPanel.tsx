'use client';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import React, {
  createContext,
  useCallback,
  useContext,
  useDeferredValue,
  useMemo,
  useState,
} from 'react';

import { ScrollArea } from '@/components/layout/ScrollArea';
import { cx } from '@/utils/cx';

import {
  panelRoot,
  panelHeader,
  searchWrapper,
  searchInputBase,
  panelContent,
  panelFooter,
  contentTopSpacingVar,
  contentBottomSpacingVar,
} from './PropertyPanel.css';

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
  fontSize: string;
  padding: string;
}

const SEARCH_SIZE_MAP: Record<PropertyInspectorSize, SearchInputSizeConfig> = {
  sm: {
    height: 20,
    fontSize: 'var(--etui-font-size-md)',
    padding: 'var(--etui-spacing-sm)',
  },
  md: {
    height: 24,
    fontSize: 'var(--etui-font-size-md)',
    padding: 'var(--etui-spacing-md)',
  },
  lg: {
    height: 28,
    fontSize: 'var(--etui-font-size-lg)',
    padding: 'var(--etui-spacing-md)',
  },
};

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

  // Defer the query handed to descendants for filtering so the search input
  // stays responsive while large property lists re-filter. The immediate
  // `searchQuery` still drives the input value.
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const contextValue = useMemo<PropertyPanelContextValue>(
    () => ({
      size,
      searchQuery: deferredSearchQuery.toLowerCase(),
    }),
    [size, deferredSearchQuery]
  );

  const hasHeader = header != null || searchable;
  const hasFooter = footer != null;

  const sizeConfig = SEARCH_SIZE_MAP[size];

  const contentStyle = assignInlineVars({
    [contentTopSpacingVar]:
      contentTopSpacing != null
        ? `${contentTopSpacing}px`
        : 'var(--etui-spacing-sm)',
    [contentBottomSpacingVar]:
      contentBottomSpacing != null
        ? `${contentBottomSpacing}px`
        : 'var(--etui-spacing-md)',
  });

  const content = (
    <div className={panelContent} style={contentStyle}>
      {children}
    </div>
  );

  return (
    <PropertyPanelContext.Provider value={contextValue}>
      <div
        ref={ref}
        role="region"
        aria-label="Properties"
        className={cx(panelRoot, className)}
        style={style}
        data-testid={testId}
        {...rest}
      >
        {hasHeader && (
          <div className={panelHeader}>
            {header}
            {searchable && (
              <div className={searchWrapper}>
                <input
                  type="search"
                  role="searchbox"
                  aria-label="Search properties"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={searchInputBase}
                  style={{
                    height: `${sizeConfig.height}px`,
                    fontSize: sizeConfig.fontSize,
                    padding: `0 ${sizeConfig.padding}`,
                  }}
                />
              </div>
            )}
          </div>
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

        {hasFooter && <div className={panelFooter}>{footer}</div>}
      </div>
    </PropertyPanelContext.Provider>
  );
};

PropertyPanel.displayName = 'PropertyPanel';
