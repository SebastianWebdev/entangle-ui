'use client';

import React from 'react';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
  SortIcon,
} from '@/components/Icons';
import { Menu } from '@/components/navigation/Menu';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/navigation/SegmentedControl';
import { Icon } from '@/components/primitives/Icon';
import { IconButton } from '@/components/primitives/IconButton';
import { Input } from '@/components/primitives/Input';

import { searchField, toolbar, toolbarSpacer } from './AssetBrowser.css';
import { useAssetBrowserChrome } from './AssetBrowserContext';

import type { AssetSortField, AssetView } from './AssetBrowser.types';

const SORT_FIELDS: AssetSortField[] = ['name', 'type', 'size', 'modified'];

export function AssetBrowserToolbar(): React.ReactElement {
  const chrome = useAssetBrowserChrome();
  const { labels } = chrome;

  const toggleType = (type: string, checked: boolean): void => {
    const current = new Set(chrome.filters.types ?? []);
    if (checked) current.add(type);
    else current.delete(type);
    chrome.setFilters({ types: Array.from(current) });
  };

  return (
    <div className={toolbar}>
      {chrome.history && (
        <>
          <IconButton
            aria-label={labels.back}
            size="sm"
            disabled={!chrome.canGoBack}
            onClick={chrome.goBack}
          >
            <ChevronLeftIcon size="sm" decorative />
          </IconButton>
          <IconButton
            aria-label={labels.forward}
            size="sm"
            disabled={!chrome.canGoForward}
            onClick={chrome.goForward}
          >
            <ChevronRightIcon size="sm" decorative />
          </IconButton>
        </>
      )}

      <SegmentedControl
        value={chrome.view}
        onChange={value => {
          chrome.setView(value as AssetView);
        }}
        size="sm"
        aria-label={labels.viewModeAria}
      >
        <SegmentedControlItem
          value="grid"
          icon={<GridIcon />}
          tooltip={labels.gridViewTooltip}
        />
        <SegmentedControlItem
          value="list"
          icon={<ListIcon />}
          tooltip={labels.listViewTooltip}
        />
      </SegmentedControl>

      <Input
        className={searchField}
        type="search"
        size="sm"
        placeholder={labels.searchPlaceholder}
        value={chrome.search}
        onChange={value => {
          chrome.setSearch(value);
        }}
        startIcon={
          <Icon size="sm" decorative>
            <SearchIcon />
          </Icon>
        }
      />

      <span className={toolbarSpacer} />

      <Menu>
        <Menu.Trigger>
          <Icon size="sm" decorative>
            <SortIcon />
          </Icon>
          {labels.sort}
        </Menu.Trigger>
        <Menu.Content>
          <Menu.RadioGroup
            value={chrome.sort.field}
            onValueChange={field => {
              chrome.setSort({ field, direction: chrome.sort.direction });
            }}
          >
            {SORT_FIELDS.map(field => (
              <Menu.RadioItem key={field} value={field}>
                {labels.sortFields[field]}
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
          <Menu.Separator />
          <Menu.RadioGroup
            value={chrome.sort.direction}
            onValueChange={direction => {
              chrome.setSort({
                field: chrome.sort.field,
                direction: direction === 'desc' ? 'desc' : 'asc',
              });
            }}
          >
            <Menu.RadioItem value="asc">{labels.sortAscending}</Menu.RadioItem>
            <Menu.RadioItem value="desc">
              {labels.sortDescending}
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu>

      {chrome.filterableTypes.length > 0 && (
        <Menu>
          <Menu.Trigger>
            <Icon size="sm" decorative>
              <FilterIcon />
            </Icon>
            {labels.filter}
          </Menu.Trigger>
          <Menu.Content>
            {chrome.filterableTypes.map(type => (
              <Menu.CheckboxItem
                key={type}
                checked={(chrome.filters.types ?? []).includes(type)}
                onCheckedChange={checked => {
                  toggleType(type, checked);
                }}
              >
                {type}
              </Menu.CheckboxItem>
            ))}
          </Menu.Content>
        </Menu>
      )}
    </div>
  );
}
