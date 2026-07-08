#!/usr/bin/env node
/**
 * Convert a raw Recraft SVG export into an experimental Entangle UI icon
 * component.
 *
 * Recraft outputs solid, fill-based artwork (dark shapes + white "knockout"
 * shapes on a white background) on a large canvas. To fit the Icon contract we:
 *   - drop the full-canvas background rectangle,
 *   - merge every remaining path into a single `fill-rule="evenodd"` path so the
 *     white knockouts become transparent holes (background-agnostic),
 *   - paint it with `currentColor` and disable stroke,
 *   - scale the original canvas down into the 24x24 viewBox used by <Icon/>.
 *
 * Usage:
 *   node scripts/recraft-to-experimental-icon.mjs <input.svg> <ComponentName> <output.tsx>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [, , input, componentName, output] = process.argv;

if (!input || !componentName || !output) {
  console.error(
    'Usage: recraft-to-experimental-icon.mjs <input.svg> <ComponentName> <output.tsx>'
  );
  process.exit(1);
}

const svg = readFileSync(input, 'utf8');

const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
if (!viewBoxMatch) {
  console.error(`No viewBox found in ${input}`);
  process.exit(1);
}
const [, , width, height] = viewBoxMatch[1].trim().split(/\s+/).map(Number);
const canvas = Math.max(width, height);
const scale = +(24 / canvas).toFixed(8);

const paths = [...svg.matchAll(/<path\b[^>]*?\bd="([^"]*)"[^>]*?>/g)].map(m =>
  m[1].replace(/\s+/g, ' ').trim()
);

const background = `M0 0L${width} 0L${width} ${height}L0 ${height}L0 0Z`;
const artwork = paths.filter(d => d !== background);

if (artwork.length === 0) {
  console.error(`No artwork paths left after dropping background in ${input}`);
  process.exit(1);
}

const combined = artwork.join(' ');

const component = `'use client';

import React from 'react';
import { Icon } from '@/components/primitives/Icon';
import type { IconProps } from '@/components/primitives/Icon';

/**
 * Experimental ${componentName} — generated from a Recraft V4.1 SVG export and
 * normalized to the Icon contract. Recraft produces fill-based artwork, so the
 * geometry is merged into a single \`evenodd\` path painted with \`currentColor\`
 * and scaled into the 24x24 viewBox.
 *
 * Not part of the stable public API.
 */
export const ${componentName} = /*#__PURE__*/ React.memo<
  Omit<IconProps, 'children'>
>(props => {
  return (
    <Icon {...props}>
      <g transform="scale(${scale})">
        <path
          d="${combined}"
          fill="currentColor"
          fillRule="evenodd"
          stroke="none"
        />
      </g>
    </Icon>
  );
});

${componentName}.displayName = '${componentName}';
`;

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, component);
console.log(`Wrote ${output} (${artwork.length} paths merged, scale ${scale})`);
