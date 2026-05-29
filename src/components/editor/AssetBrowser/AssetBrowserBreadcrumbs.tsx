'use client';

import React from 'react';

import {
  Breadcrumbs,
  BreadcrumbItem,
} from '@/components/navigation/Breadcrumbs';

import { breadcrumbsBar } from './AssetBrowser.css';
import { useAssetBrowserContext } from './AssetBrowserContext';

export function AssetBrowserBreadcrumbs(): React.ReactElement | null {
  const ctx = useAssetBrowserContext();
  if (ctx.path.length === 0) return null;

  return (
    <div className={breadcrumbsBar}>
      <Breadcrumbs maxItems={4} itemsAfterCollapse={2} itemsBeforeCollapse={1}>
        {ctx.path.map((segment, index) => {
          const isLast = index === ctx.path.length - 1;
          return (
            <BreadcrumbItem
              key={segment.id}
              isCurrent={isLast}
              onClick={
                isLast
                  ? undefined
                  : () => {
                      ctx.navigate(segment.id, 'breadcrumb');
                    }
              }
            >
              {segment.name}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumbs>
    </div>
  );
}
