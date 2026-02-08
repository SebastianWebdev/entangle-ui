import React from 'react';
import styled from '@emotion/styled';
import { IconButton } from '@/components/primitives/IconButton';
import { Select } from '@/components/controls/Select';
import { Tooltip } from '@/components/primitives/Tooltip';
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

// ─── Inline SVG icons for tangent modes (16x16) ───

const TangentFreeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <line x1="3" y1="13" x2="8" y2="8" />
    <line x1="8" y1="8" x2="14" y2="5" />
    <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const TangentAlignedIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <line x1="2" y1="12" x2="14" y2="4" />
    <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const TangentMirroredIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <line x1="2" y1="12" x2="14" y2="4" />
    <circle cx="4" cy="11" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const TangentAutoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M2 12 C5 12, 6 4, 8 4 C10 4, 11 12, 14 12" />
  </svg>
);

const TangentLinearIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <line x1="2" y1="13" x2="14" y2="3" />
  </svg>
);

const TangentStepIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <polyline points="2,12 2,8 8,8 8,4 14,4" />
  </svg>
);

const TANGENT_MODES: Array<{
  mode: TangentMode;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
}> = [
  { mode: 'free', label: 'Free', icon: <TangentFreeIcon />, shortcut: '1' },
  {
    mode: 'aligned',
    label: 'Aligned',
    icon: <TangentAlignedIcon />,
    shortcut: '2',
  },
  {
    mode: 'mirrored',
    label: 'Mirrored',
    icon: <TangentMirroredIcon />,
    shortcut: '3',
  },
  { mode: 'auto', label: 'Auto', icon: <TangentAutoIcon />, shortcut: '4' },
  {
    mode: 'linear',
    label: 'Linear',
    icon: <TangentLinearIcon />,
    shortcut: '5',
  },
  { mode: 'step', label: 'Step', icon: <TangentStepIcon />, shortcut: '6' },
];

export const CurveToolbar: React.FC<CurveToolbarProps> = ({
  selectedTangentMode,
  onTangentModeChange,
  onPresetSelect,
  presets,
  disabled,
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
    </StyledToolbar>
  );
};

CurveToolbar.displayName = 'CurveToolbar';
