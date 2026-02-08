import React from 'react';
import styled from '@emotion/styled';
import { IconButton } from '@/components/primitives/IconButton';
import { Select } from '@/components/controls/Select';
import { Tooltip } from '@/components/primitives/Tooltip';
import {
  TangentFreeIcon,
  TangentAlignedIcon,
  TangentMirroredIcon,
  TangentAutoIcon,
  TangentLinearIcon,
  TangentStepIcon,
} from '@/components/Icons';
import type {
  CurveEditorSize,
  CurvePreset,
  TangentMode,
} from './CurveEditor.types';

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

const StyledToolbar = styled.div<{ $size: CurveEditorSize }>`
  display: flex;
  align-items: center;
  gap: ${p => p.theme.spacing.sm}px;
  padding: 0 ${p => p.theme.spacing.sm}px;
  height: ${p => TOOLBAR_HEIGHT[p.$size]}px;
  background: ${p => p.theme.colors.surface.default};
  border-bottom: 1px solid ${p => p.theme.colors.border.default};
  flex-shrink: 0;
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${p => p.theme.spacing.xs}px;
`;

const Separator = styled.div`
  width: 1px;
  height: 16px;
  background: ${p => p.theme.colors.border.default};
  margin: 0 ${p => p.theme.spacing.xs}px;
`;

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
    <StyledToolbar
      $size={size}
      data-testid={testId ? `${testId}-toolbar` : undefined}
    >
      {/* Preset selector */}
      <ToolbarSection>
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
      </ToolbarSection>

      {!lockTangents && (
        <>
          <Separator />

          {/* Tangent mode buttons */}
          <ToolbarSection>
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
          </ToolbarSection>
        </>
      )}
    </StyledToolbar>
  );
};

CurveToolbar.displayName = 'CurveToolbar';
