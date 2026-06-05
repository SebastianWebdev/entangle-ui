/**
 * Localizable strings for {@link AngleInput}. Every screen-reader / user-facing
 * string the component produces lives here, so the whole control can be
 * localized in one place. Spread {@link DEFAULT_ANGLE_INPUT_LABELS} and override
 * only the keys you need.
 */
export interface AngleInputLabels {
  /**
   * Accessible name for the dial (the `role="slider"` element).
   * @default 'Angle'
   */
  dialAriaLabel: string;

  /**
   * Accessible name for the numeric input shown next to the dial.
   * @default 'Angle value'
   */
  inputAriaLabel: string;

  /**
   * Spoken value of the dial (`aria-valuetext`). A function so locales control
   * number formatting and unit placement.
   * @default (degrees) => `${Math.round(degrees)}°`
   */
  valueText: (degrees: number) => string;
}

/**
 * English defaults for {@link AngleInputLabels}.
 */
export const DEFAULT_ANGLE_INPUT_LABELS: AngleInputLabels = {
  dialAriaLabel: 'Angle',
  inputAriaLabel: 'Angle value',
  valueText: degrees => `${Math.round(degrees)}°`,
};
