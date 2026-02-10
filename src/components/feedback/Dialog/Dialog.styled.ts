import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { processCss } from '@/utils/styledUtils';
import type { DialogProps, DialogSize } from './Dialog.types';

// --- Constants ---

export const DIALOG_ANIMATION_MS = 200;

export const DIALOG_SIZE_MAP: Record<DialogSize, string> = {
  sm: '360px',
  md: '480px',
  lg: '640px',
  xl: '800px',
  fullscreen: 'calc(100vw - 48px)',
};

// --- Animations ---

const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const overlayFadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const panelFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const panelFadeOut = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
`;

// --- Styled Components ---

export const StyledOverlay = styled.div<{
  $closing: boolean;
}>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.colors.backdrop};
  backdrop-filter: blur(2px);
  z-index: ${props => props.theme.zIndex.modal};
  animation: ${props => (props.$closing ? overlayFadeOut : overlayFadeIn)} 150ms
    ease-out forwards;
`;

export const StyledDialogPanel = styled.div<{
  $size: DialogSize;
  $closing: boolean;
  $css?: DialogProps['css'];
}>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: ${props => props.theme.zIndex.modal};
  width: ${props => DIALOG_SIZE_MAP[props.$size]};
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background.primary};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.borderRadius.lg}px;
  box-shadow: ${props => props.theme.shadows.lg};
  font-family: ${props => props.theme.typography.fontFamily.sans};
  outline: none;
  animation: ${props => (props.$closing ? panelFadeOut : panelFadeIn)}
    ${DIALOG_ANIMATION_MS}ms ease-out forwards;

  ${props => processCss(props.$css, props.theme)}
`;
