import React from 'react';

import { Tooltip } from '@base-ui-components/react/tooltip';
import { cx } from '@/utils/cx';
import { arrowFillStyle, tooltipArrowStyle } from './Tooltip.css';

export const ArrowSvg = (props: React.ComponentProps<'svg'>) => {
  return (
    <svg
      width="20"
      height="10"
      viewBox="0 0 20 10"
      fill="none"
      style={{
        // Improve SVG rendering quality
        shapeRendering: 'geometricPrecision',
        imageRendering: 'crisp-edges',
      }}
      {...props}
    >
      <path
        className={arrowFillStyle}
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
      />
    </svg>
  );
};

export const StyledTooltipArrow = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Tooltip.Arrow>
>(({ className, ...props }, ref) => (
  <Tooltip.Arrow
    ref={ref}
    className={cx(tooltipArrowStyle, typeof className === 'string' ? className : undefined)}
    {...props}
  />
));

StyledTooltipArrow.displayName = 'StyledTooltipArrow';
