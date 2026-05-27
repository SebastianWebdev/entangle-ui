'use client';

import React from 'react';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/navigation/SegmentedControl';
import { Menu } from '@/components/navigation/Menu';
import { Input } from '@/components/primitives/Input';
import { Icon } from '@/components/primitives/Icon';
import {
  FilterIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
  SortIcon,
} from '@/components/Icons';
import { useAssetBrowserContext } from './AssetBrowserContext';
import type { AssetSortField, AssetView } from './AssetBrowser.types';
import { searchField, toolbar, toolbarSpacer } from './AssetBrowser.css';

const SORT_FIELDS: { value: AssetSortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'type', label: 'Type' },
  { value: 'size', label: 'Size' },
  { value: 'modified', label: 'Modified' },
];

export function AssetBrowserToolbar(): React.ReactElement {
  const ctx = useAssetBrowserContext();

  const toggleType = (type: string, checked: boolean): void => {
    const current = new Set(ctx.filters.types ?? []);
    if (checked) current.add(type);
    else current.delete(type);
    ctx.setFilters({ types: Array.from(current) });
  };

  return (
    <div className={toolbar}>
      <SegmentedControl
        value={ctx.view}
        onChange={value => ctx.setView(value as AssetView)}
        size="sm"
        aria-label="View mode"
      >
        <SegmentedControlItem
          value="grid"
          icon={<GridIcon />}
          tooltip="Grid view"
        />
        <SegmentedControlItem
          value="list"
          icon={<ListIcon />}
          tooltip="List view"
        />
      </SegmentedControl>

      <Input
        className={searchField}
        type="search"
        size="sm"
        placeholder="Search assets…"
        value={ctx.search}
        onChange={value => ctx.setSearch(value)}
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
          Sort
        </Menu.Trigger>
        <Menu.Content>
          <Menu.RadioGroup
            value={ctx.sort.field}
            onValueChange={field =>
              ctx.setSort({ field, direction: ctx.sort.direction })
            }
          >
            {SORT_FIELDS.map(field => (
              <Menu.RadioItem key={field.value} value={field.value}>
                {field.label}
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
          <Menu.Separator />
          <Menu.RadioGroup
            value={ctx.sort.direction}
            onValueChange={direction =>
              ctx.setSort({
                field: ctx.sort.field,
                direction: direction === 'desc' ? 'desc' : 'asc',
              })
            }
          >
            <Menu.RadioItem value="asc">Ascending</Menu.RadioItem>
            <Menu.RadioItem value="desc">Descending</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu>

      {ctx.filterableTypes.length > 0 && (
        <Menu>
          <Menu.Trigger>
            <Icon size="sm" decorative>
              <FilterIcon />
            </Icon>
            Filter
          </Menu.Trigger>
          <Menu.Content>
            {ctx.filterableTypes.map(type => (
              <Menu.CheckboxItem
                key={type}
                checked={(ctx.filters.types ?? []).includes(type)}
                onCheckedChange={checked => toggleType(type, checked)}
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
