'use client';

import React from 'react';

/**
 * Shared mini-icons for Chat components.
 * These use smaller viewBoxes (8x8, 16x16) than the library's Icon system (24x24)
 * and are designed for inline use in compact chat UI elements.
 */

export const MiniCloseIcon: React.FC = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
    <path
      d="M1 1l6 6M7 1L1 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const MiniFileIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9 2H4.5A1.5 1.5 0 003 3.5v9A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V6L9 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9 2v4h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

export const MiniImageIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="2"
      y="2"
      width="12"
      height="12"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="5.5" cy="5.5" r="1.5" fill="currentColor" />
    <path
      d="M2 11l3-3 2 2 3-3 4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MiniCodeIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 4L1 8l4 4M11 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MiniSelectionIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="2"
      y="2"
      width="5"
      height="5"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="9"
      y="9"
      width="5"
      height="5"
      rx="0.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export const MiniWrenchIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M14.25 1.75L12.5 3.5L13 5L11.5 6.5L10.5 5.5L5.5 10.5L6.5 11.5L5 13L3.5 12.5L1.75 14.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 2.5L10 4L8 6L6.5 4.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MiniChevronIcon: React.FC<{ size?: number }> = ({ size = 10 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4.5 3L7.5 6L4.5 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
