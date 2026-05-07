import type React from 'react';
import type { BaseComponent } from '@/types/common';
import type { Prettify } from '@/types/utilities';

export type StatSize = 'sm' | 'md' | 'lg';
export type StatDeltaDirection = 'up' | 'down' | 'neutral';
export type StatDeltaSemantics = 'positive' | 'negative' | 'neutral';

export interface StatDelta {
  /** Delta value to display (e.g. "+12.4%"). */
  value: React.ReactNode;
  /** Direction of change — drives the icon. */
  direction: StatDeltaDirection;
  /**
   * What the "up" direction means for this metric.
   * - `positive`: up is good (revenue, signups) — green for up, red for down
   * - `negative`: up is bad (errors, latency) — red for up, green for down
   * - `neutral`: just show the direction with muted color
   * @default "positive"
   */
  semantics?: StatDeltaSemantics;
}

export interface StatBaseProps
  extends Omit<BaseComponent<HTMLDivElement>, 'title'> {
  /** Label above the value. */
  label: React.ReactNode;
  /** Primary value (already formatted by the consumer). */
  value: React.ReactNode;
  /** Optional delta — displayed below the value. */
  delta?: StatDelta;
  /** Helper text below the delta. */
  helper?: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Size variant. @default "md" */
  size?: StatSize;
}

export type StatProps = Prettify<StatBaseProps>;
