'use client';

import React from 'react';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { IconButton } from '@/components/primitives/IconButton';
import { Select } from '@/components/controls/Select';
import { Tooltip } from '@/components/primitives/Tooltip';
import { TangentFreeIcon } from '@/components/Icons/TangentFreeIcon';
import { TangentAlignedIcon } from '@/components/Icons/TangentAlignedIcon';
import { TangentMirroredIcon } from '@/components/Icons/TangentMirroredIcon';
import { TangentAutoIcon } from '@/components/Icons/TangentAutoIcon';
import { TangentLinearIcon } from '@/components/Icons/TangentLinearIcon';
import { TangentStepIcon } from '@/components/Icons/TangentStepIcon';
import type {
  CurveEditorSize,
  CurvePreset,
  TangentMode,
} from './CurveEditor.types';
import {
  toolbarStyle,
  toolbarSectionStyle,
  toolbarSeparatorStyle,
  toolbarHeightVar,
} from './CurveEditor.css';

interface CurveToolbarProps {
  selectedTangentMode: TangentMode | null;
  onTangentModeChange: (mode: TangentMode) => void;
  onPresetSelect: (preset: CurvePreset) => void;
  presets: CurvePreset[];
  disabled: boolean;
  lockTangents: boolean;
  size: CurveEditorSize;
  testId?: string;
}

const TOOLBAR_HEIGHT: Record<CurveEditorSize, number> = {
  sm: 28,
  md: 32,
  lg: 36,
};

const TANGENT_MODES: Array<{
  mode: TangentMode;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
}> = [
  {
    mode: 'free',
    label: 'Free',
    icon: <TangentFreeIcon decorative />,
    shortcut: '1',
  },
  {
    mode: 'aligned',
    label: 'Aligned',
    icon: <TangentAlignedIcon decorative />,
    shortcut: '2',
  },
  {
    mode: 'mirrored',
    label: 'Mirrored',
    icon: <TangentMirroredIcon decorative />,
    shortcut: '3',
  },
  {
    mode: 'auto',
    label: 'Auto',
    icon: <TangentAutoIcon decorative />,
    shortcut: '4',
  },
  {
    mode: 'linear',
    label: 'Linear',
    icon: <TangentLinearIcon decorative />,
    shortcut: '5',
  },
  {
    mode: 'step',
    label: 'Step',
    icon: <TangentStepIcon decorative />,
    shortcut: '6',
  },
];

export const CurveToolbar: React.FC<CurveToolbarProps> = ({
  selectedTangentMode,
  onTangentModeChange,
  onPresetSelect,
  presets,
  disabled,
  lockTangents,
  size,
  testId,
}) => {
  const presetOptions = presets.map(p => ({
    value: p.id,
    label: p.label,
  }));

  const handlePresetChange = (id: string | null) => {
    if (!id) return;
    const preset = presets.find(p => p.id === id);
    if (preset) onPresetSelect(preset);
  };

  const iconSize = size === 'lg' ? 'md' : 'sm';

  return (
    <div
      className={toolbarStyle}
      style={assignInlineVars({
        [toolbarHeightVar]: `${TOOLBAR_HEIGHT[size]}px`,
      })}
      data-testid={testId ? `${testId}-toolbar` : undefined}
    >
      {/* Preset selector */}
      <div className={toolbarSectionStyle}>
        <Select
          options={presetOptions}
          onChange={handlePresetChange}
          size={size === 'lg' ? 'md' : 'sm'}
          variant="ghost"
          disabled={disabled}
          placeholder="Preset..."
          aria-label="Curve preset"
          minDropdownWidth={180}
        />
      </div>

      {!lockTangents && (
        <>
          <div className={toolbarSeparatorStyle} />

          {/* Tangent mode buttons */}
          <div className={toolbarSectionStyle}>
            {TANGENT_MODES.map(({ mode, label, icon, shortcut }) => (
              <Tooltip
                key={mode}
                title={`${label} (${shortcut})`}
                placement="bottom"
              >
                <IconButton
                  size={iconSize}
                  variant="ghost"
                  pressed={selectedTangentMode === mode}
                  disabled={disabled || selectedTangentMode === null}
                  aria-label={`${label} tangent mode`}
                  onClick={() => onTangentModeChange(mode)}
                >
                  {icon}
                </IconButton>
              </Tooltip>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

CurveToolbar.displayName = 'CurveToolbar';
