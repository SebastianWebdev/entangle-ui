import React, { useCallback, useId, useState } from 'react';
import styled from '@emotion/styled';
import { processCss } from '@/utils/styledUtils';
import { FormHelperText } from '@/components/form';
import type { Prettify } from '@/types/utilities';
import type { BaseComponent, Size } from '@/types/common';
import type { Theme } from '@/theme';

// --- Types ---

export type SwitchSize = Size;

export interface SwitchBaseProps
  extends Omit<BaseComponent<HTMLButtonElement>, 'onChange'> {
  /**
   * Whether the switch is on (controlled)
   */
  checked?: boolean;

  /**
   * Default on/off state (uncontrolled)
   * @default false
   */
  defaultChecked?: boolean;

  /**
   * Switch label text
   */
  label?: string;

  /**
   * Position of the label relative to the switch
   * @default "right"
   */
  labelPosition?: 'left' | 'right';

  /**
   * Switch size
   * - `sm`: 28x14px track, compact toolbars
   * - `md`: 34x18px track, standard for panels
   * - `lg`: 42x22px track, prominent settings
   * @default "md"
   */
  size?: SwitchSize;

  /**
   * Whether the switch is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Helper text displayed below the switch
   */
  helperText?: string;

  /**
   * Error state
   * @default false
   */
  error?: boolean;

  /**
   * Error message displayed when error is true
   */
  errorMessage?: string;

  /**
   * Name attribute for form submission
   */
  name?: string;

  /**
   * Change event handler
   * @param checked - The new on/off state
   */
  onChange?: (checked: boolean) => void;
}

export type SwitchProps = Prettify<SwitchBaseProps>;

// --- Size maps ---

interface SizeConfig {
  trackW: number;
  trackH: number;
  thumbDiameter: number;
  offset: number;
}

const SIZE_MAP: Record<SwitchSize, SizeConfig> = {
  sm: { trackW: 28, trackH: 14, thumbDiameter: 10, offset: 2 },
  md: { trackW: 34, trackH: 18, thumbDiameter: 14, offset: 2 },
  lg: { trackW: 42, trackH: 22, thumbDiameter: 18, offset: 2 },
};

const FONT_SIZE_MAP: Record<SwitchSize, keyof Theme['typography']['fontSize']> =
  {
    sm: 'xs',
    md: 'sm',
    lg: 'md',
  };

// --- Styled components ---

const StyledSwitchContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

interface StyledSwitchRowProps {
  $labelPosition: 'left' | 'right';
  $disabled: boolean;
  $size: SwitchSize;
}

const StyledSwitchRow = styled.label<StyledSwitchRowProps>`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm}px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  flex-direction: ${props => (props.$labelPosition === 'left' ? 'row' : 'row')};
  font-size: ${props =>
    props.theme.typography.fontSize[FONT_SIZE_MAP[props.$size]]}px;
  color: ${props =>
    props.$disabled
      ? props.theme.colors.text.disabled
      : props.theme.colors.text.secondary};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  user-select: none;
`;

const StyledLabelText = styled.span<{ $order: number }>`
  order: ${props => props.$order};
`;

interface StyledTrackProps {
  $size: SwitchSize;
  $checked: boolean;
  $disabled: boolean;
  $error: boolean;
  $css?: SwitchProps['css'];
}

const StyledTrack = styled.button<StyledTrackProps>`
  /* Reset */
  padding: 0;
  margin: 0;
  font: inherit;
  outline: none;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};

  /* Layout */
  display: inline-flex;
  align-items: center;
  position: relative;
  flex-shrink: 0;

  /* Sizing */
  width: ${props => SIZE_MAP[props.$size].trackW}px;
  height: ${props => SIZE_MAP[props.$size].trackH}px;
  border-radius: ${props => SIZE_MAP[props.$size].trackH}px;
  transition:
    background-color ${props => props.theme.transitions.fast},
    border-color ${props => props.theme.transitions.fast};

  /* State styles */
  ${props => {
    const { colors } = props.theme;

    if (props.$disabled) {
      return `
        opacity: 0.5;
        background: ${props.$checked ? colors.accent.primary : colors.surface.active};
        border: 1px solid ${props.$checked ? 'transparent' : colors.border.default};
      `;
    }

    if (props.$error && !props.$checked) {
      return `
        background: ${colors.surface.active};
        border: 1px solid ${colors.accent.error};
        &:hover {
          background: ${colors.surface.hover};
        }
      `;
    }

    if (props.$checked) {
      return `
        background: ${colors.accent.primary};
        border: 1px solid transparent;
        &:hover {
          background: ${colors.accent.secondary};
        }
      `;
    }

    return `
      background: ${colors.surface.active};
      border: 1px solid ${colors.border.default};
      &:hover {
        background: ${colors.surface.hover};
      }
    `;
  }}

  /* Focus visible */
  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }

  /* Disabled */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Custom CSS */
  ${props => processCss(props.$css, props.theme)}
`;

interface StyledThumbProps {
  $size: SwitchSize;
  $checked: boolean;
}

const StyledThumb = styled.span<StyledThumbProps>`
  position: absolute;
  border-radius: 50%;
  transition: transform ${props => props.theme.transitions.fast};

  width: ${props => SIZE_MAP[props.$size].thumbDiameter}px;
  height: ${props => SIZE_MAP[props.$size].thumbDiameter}px;

  background: ${props =>
    props.$checked ? 'white' : props.theme.colors.text.muted};

  ${props => {
    const config = SIZE_MAP[props.$size];
    const translateX = config.trackW - config.thumbDiameter - config.offset * 2;
    return `
      transform: translateX(${props.$checked ? translateX : config.offset}px);
    `;
  }}
`;

/**
 * Switch component for boolean on/off states in editor toolbars,
 * settings panels, and property inspectors.
 *
 * More space-efficient than Checkbox for toggle options like
 * "Show Grid", "Snap to Grid", "Auto-Save".
 *
 * @example
 * ```tsx
 * <Switch label="Show Grid" />
 * <Switch checked={value} onChange={setValue} label="Auto-save" />
 * ```
 */
export const Switch: React.FC<SwitchProps> = ({
  checked: checkedProp,
  defaultChecked = false,
  label,
  labelPosition = 'right',
  size = 'md',
  disabled = false,
  helperText,
  error = false,
  errorMessage,
  name,
  onChange,
  className,
  style,
  css,
  testId,
  ref,
  id: idProp,
  ...rest
}) => {
  const autoId = useId();
  const switchId = idProp ?? autoId;
  const helperId = `${switchId}-helper`;

  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checkedProp !== undefined;
  const resolvedChecked = isControlled ? checkedProp : internalChecked;

  const handleClick = useCallback(() => {
    if (disabled) return;

    const newChecked = !resolvedChecked;

    if (!isControlled) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked);
  }, [disabled, resolvedChecked, isControlled, onChange]);

  const showHelperText = error && errorMessage ? errorMessage : helperText;

  const track = (
    <StyledTrack
      ref={ref}
      type="button"
      role="switch"
      aria-checked={resolvedChecked}
      aria-disabled={disabled || undefined}
      aria-describedby={showHelperText ? helperId : undefined}
      disabled={disabled}
      onClick={handleClick}
      $size={size}
      $checked={resolvedChecked}
      $disabled={disabled}
      $error={error}
      $css={css}
      data-testid={testId}
      {...rest}
    >
      <StyledThumb $size={size} $checked={resolvedChecked} />
      {name && (
        <input type="hidden" name={name} value={resolvedChecked ? 'on' : ''} />
      )}
    </StyledTrack>
  );

  if (!label && !showHelperText) {
    return track;
  }

  return (
    <StyledSwitchContainer className={className} style={style}>
      <StyledSwitchRow
        $labelPosition={labelPosition}
        $disabled={disabled}
        $size={size}
      >
        {labelPosition === 'left' && label && (
          <StyledLabelText $order={0}>{label}</StyledLabelText>
        )}
        {track}
        {labelPosition === 'right' && label && (
          <StyledLabelText $order={1}>{label}</StyledLabelText>
        )}
      </StyledSwitchRow>
      {showHelperText && (
        <FormHelperText id={helperId} error={error}>
          {showHelperText}
        </FormHelperText>
      )}
    </StyledSwitchContainer>
  );
};

Switch.displayName = 'Switch';
