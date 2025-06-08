import React from 'react';

import styled from '@emotion/styled';
import { Tooltip } from '@base-ui-components/react/tooltip';

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
      <ArrowFill d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z" />
    </svg>
  );
};

const ArrowFill = styled.path`
  fill: ${props => props.theme.colors.background.elevated};
`;

export const StyledTooltipArrow = styled(Tooltip.Arrow)`
  display: flex;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  perspective: 1000px;
  /* Ensure crisp rendering */
  image-rendering: crisp-edges;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: pixelated;

  /* Antialiasing for smooth edges */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  &[data-side='top'] {
    bottom: -8px;
    rotate: 180deg;
  }

  &[data-side='bottom'] {
    top: -8px;
    rotate: 0deg;
  }

  &[data-side='left'] {
    right: -13px;
    rotate: 90deg;
  }

  &[data-side='right'] {
    left: -13px;
    rotate: -90deg;
  }
  will-change: transform;
`;
