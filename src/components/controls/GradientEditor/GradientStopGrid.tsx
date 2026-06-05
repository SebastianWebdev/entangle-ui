'use client';

import React from 'react';

import {
  formatColor,
  parseColor,
} from '@/components/controls/ColorPicker/colorUtils';
import { TrashIcon } from '@/components/Icons/TrashIcon';
import { IconButton } from '@/components/primitives/IconButton/IconButton';
import { Popover } from '@/components/primitives/Popover/Popover';
import { PopoverContent } from '@/components/primitives/Popover/PopoverContent';
import { PopoverTrigger } from '@/components/primitives/Popover/PopoverTrigger';

import {
  stopsGridStyle,
  stopCardRecipe,
  stopCardTopStyle,
  stopCardSwatchStyle,
  stopCardSwatchFillStyle,
  stopCardValueStyle,
  stopCardPositionStyle,
} from './GradientEditor.css';
import { sortStops } from './gradientUtils';

import type {
  GradientColorEditorMode,
  GradientStop,
} from './GradientEditor.types';
import type { ColorFormat } from '@/components/controls/ColorPicker';

interface GradientStopGridProps {
  /** Stops, rendered left-to-right by position. */
  stops: GradientStop[];
  /** Currently selected stop id (highlights its card). */
  selectedId: string | null;
  /** `popover` edits each card in its own popover; `inline` selects the card. */
  colorEditor: GradientColorEditorMode;
  /** Display format for each card's value text. */
  swatchFormat: ColorFormat;
  disabled: boolean;
  /** Whether stops can still be removed (above `minStops`). */
  canDelete: boolean;
  /** Width of the per-card popover content. */
  width: number;
  /** Builds the color editor for a stop (used inside each card's popover). */
  renderColorEditor: (stop: GradientStop) => React.ReactNode;
  onDeleteStop: (id: string) => void;
  onSelectStop: (id: string) => void;
  testId?: string;
}

/**
 * Grid summary of every gradient stop. Each card shows the color swatch, its
 * value (in `swatchFormat`), the ramp position, and a delete button.
 */
export const GradientStopGrid = ({
  stops,
  selectedId,
  colorEditor,
  swatchFormat,
  disabled,
  canDelete,
  width,
  renderColorEditor,
  onDeleteStop,
  onSelectStop,
  testId,
}: GradientStopGridProps): React.ReactElement => {
  return (
    <div
      className={stopsGridStyle}
      data-testid={testId ? `${testId}-stops-grid` : undefined}
    >
      {sortStops(stops).map(stop => {
        const valueText = formatColor(parseColor(stop.color), swatchFormat);
        const positionText = `${Math.round(stop.position * 100)}%`;
        const selected = stop.id === selectedId;

        const swatch = (
          <button
            type="button"
            className={stopCardSwatchStyle}
            onClick={() => {
              onSelectStop(stop.id);
            }}
            disabled={disabled}
            aria-label={
              colorEditor === 'popover'
                ? `Edit color ${valueText}`
                : `Select color ${valueText}`
            }
            title={stop.color}
          >
            <span
              className={stopCardSwatchFillStyle}
              style={{ backgroundColor: stop.color }}
            />
          </button>
        );

        return (
          <div
            key={stop.id}
            className={stopCardRecipe({ selected })}
            data-testid={testId ? `${testId}-stop-${stop.id}` : undefined}
          >
            <div className={stopCardTopStyle}>
              {colorEditor === 'popover' ? (
                <Popover>
                  <PopoverTrigger>{swatch}</PopoverTrigger>
                  <PopoverContent width={width} padding="md">
                    {renderColorEditor(stop)}
                  </PopoverContent>
                </Popover>
              ) : (
                swatch
              )}
              <IconButton
                size="sm"
                variant="ghost"
                aria-label={`Delete color ${valueText}`}
                disabled={disabled || !canDelete}
                onClick={() => {
                  onDeleteStop(stop.id);
                }}
                testId={testId ? `${testId}-delete-${stop.id}` : undefined}
              >
                <TrashIcon />
              </IconButton>
            </div>
            <span className={stopCardValueStyle} title={valueText}>
              {valueText}
            </span>
            <span className={stopCardPositionStyle}>{positionText}</span>
          </div>
        );
      })}
    </div>
  );
};

GradientStopGrid.displayName = 'GradientStopGrid';
