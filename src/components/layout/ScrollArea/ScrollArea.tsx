import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import styled from '@emotion/styled';
import type { ScrollAreaProps } from './ScrollArea.types';

// --- Styled ---

interface StyledRootProps {
  $maxHeight?: number | string;
  $maxWidth?: number | string;
  $autoFill?: boolean;
}

const StyledRoot = styled.div<StyledRootProps>`
  position: relative;
  overflow: hidden;
  ${props =>
    props.$autoFill
      ? `
    width: 100%;
    height: 100%;
  `
      : ''}
  ${props =>
    props.$maxHeight != null
      ? `max-height: ${typeof props.$maxHeight === 'number' ? `${props.$maxHeight}px` : props.$maxHeight};`
      : ''}
  ${props =>
    props.$maxWidth != null
      ? `max-width: ${typeof props.$maxWidth === 'number' ? `${props.$maxWidth}px` : props.$maxWidth};`
      : ''}
`;

interface StyledViewportProps {
  $direction: 'vertical' | 'horizontal' | 'both';
}

const StyledViewport = styled.div<StyledViewportProps>`
  width: 100%;
  height: 100%;
  max-height: inherit;
  max-width: inherit;
  overflow-x: ${props =>
    props.$direction === 'horizontal' || props.$direction === 'both'
      ? 'scroll'
      : 'hidden'};
  overflow-y: ${props =>
    props.$direction === 'vertical' || props.$direction === 'both'
      ? 'scroll'
      : 'hidden'};

  /* Hide native scrollbars */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    box-shadow: ${props => props.theme.shadows.focus};
  }
`;

interface StyledScrollbarProps {
  $direction: 'vertical' | 'horizontal';
  $width: number;
  $padding: number;
  $visible: boolean;
}

const StyledScrollbar = styled.div<StyledScrollbarProps>`
  position: absolute;
  z-index: 1;
  ${props =>
    props.$direction === 'vertical'
      ? `
    right: ${props.$padding}px;
    top: ${props.$padding}px;
    bottom: ${props.$padding}px;
    width: ${props.$width}px;
  `
      : `
    bottom: ${props.$padding}px;
    left: ${props.$padding}px;
    right: ${props.$padding}px;
    height: ${props.$width}px;
  `}
  border-radius: ${props => props.$width}px;
  opacity: ${props => (props.$visible ? 1 : 0)};
  transition: opacity ${props => props.theme.transitions.fast};
  pointer-events: ${props => (props.$visible ? 'auto' : 'none')};
`;

interface StyledThumbProps {
  $direction: 'vertical' | 'horizontal';
  $isDragging: boolean;
}

const StyledThumb = styled.div<StyledThumbProps>`
  position: absolute;
  ${props =>
    props.$direction === 'vertical'
      ? `
    width: 100%;
    left: 0;
  `
      : `
    height: 100%;
    top: 0;
  `}
  border-radius: inherit;
  background: ${props => props.theme.colors.text.disabled};
  transition: background ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.text.muted};
  }

  ${props =>
    props.$isDragging
      ? `background: ${props.theme.colors.text.secondary};`
      : ''}
`;

interface StyledFadeMaskProps {
  $position: 'top' | 'bottom' | 'left' | 'right';
  $size: number;
  $visible: boolean;
}

const StyledFadeMask = styled.div<StyledFadeMaskProps>`
  position: absolute;
  z-index: 1;
  pointer-events: none;
  opacity: ${props => (props.$visible ? 1 : 0)};
  transition: opacity ${props => props.theme.transitions.fast};

  ${props => {
    const { $position, $size } = props;
    const bgBase = props.theme.colors.background.primary;

    switch ($position) {
      case 'top':
        return `
          top: 0; left: 0; right: 0; height: ${$size}px;
          background: linear-gradient(to bottom, ${bgBase}, transparent);
        `;
      case 'bottom':
        return `
          bottom: 0; left: 0; right: 0; height: ${$size}px;
          background: linear-gradient(to top, ${bgBase}, transparent);
        `;
      case 'left':
        return `
          top: 0; left: 0; bottom: 0; width: ${$size}px;
          background: linear-gradient(to right, ${bgBase}, transparent);
        `;
      case 'right':
        return `
          top: 0; right: 0; bottom: 0; width: ${$size}px;
          background: linear-gradient(to left, ${bgBase}, transparent);
        `;
    }
  }}
`;

// --- Component ---

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  direction = 'vertical',
  scrollbarVisibility = 'auto',
  hideDelay = 1000,
  scrollbarWidth = 6,
  minThumbLength = 30,
  scrollbarPadding = 2,
  fadeMask = false,
  fadeMaskHeight = 24,
  maxHeight,
  maxWidth,
  autoFill = false,
  onScroll,
  onScrollTop,
  onScrollBottom,
  className,
  style,
  testId,
  ref: externalRef,
  ...rest
}) => {
  const autoId = useId();
  const viewportId = `scrollarea-${autoId}-viewport`;
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Thumb state
  const [vThumbSize, setVThumbSize] = useState(0);
  const [vThumbOffset, setVThumbOffset] = useState(0);
  const [hThumbSize, setHThumbSize] = useState(0);
  const [hThumbOffset, setHThumbOffset] = useState(0);
  const [hasVOverflow, setHasVOverflow] = useState(false);
  const [hasHOverflow, setHasHOverflow] = useState(false);

  // Visibility state
  const [scrollbarVisible, setScrollbarVisible] = useState(
    scrollbarVisibility === 'always'
  );
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragAxisRef = useRef<'vertical' | 'horizontal' | null>(null);
  const dragStartRef = useRef({ pointerPos: 0, scrollPos: 0 });

  // Fade mask state
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const [atLeft, setAtLeft] = useState(true);
  const [atRight, setAtRight] = useState(false);

  const showV = direction === 'vertical' || direction === 'both';
  const showH = direction === 'horizontal' || direction === 'both';

  // Recalculate thumb sizes
  const recalculate = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    if (showV) {
      const ratio = vp.clientHeight / vp.scrollHeight;
      const overflow = ratio < 1;
      setHasVOverflow(overflow);
      if (overflow) {
        const trackHeight = vp.clientHeight - scrollbarPadding * 2;
        const thumbH = Math.max(minThumbLength, ratio * trackHeight);
        setVThumbSize(thumbH);
        const maxScroll = vp.scrollHeight - vp.clientHeight;
        const scrollRatio = maxScroll > 0 ? vp.scrollTop / maxScroll : 0;
        setVThumbOffset(scrollRatio * (trackHeight - thumbH));
      }
    }

    if (showH) {
      const ratio = vp.clientWidth / vp.scrollWidth;
      const overflow = ratio < 1;
      setHasHOverflow(overflow);
      if (overflow) {
        const trackWidth = vp.clientWidth - scrollbarPadding * 2;
        const thumbW = Math.max(minThumbLength, ratio * trackWidth);
        setHThumbSize(thumbW);
        const maxScroll = vp.scrollWidth - vp.clientWidth;
        const scrollRatio = maxScroll > 0 ? vp.scrollLeft / maxScroll : 0;
        setHThumbOffset(scrollRatio * (trackWidth - thumbW));
      }
    }

    // Update fade mask state
    if (fadeMask) {
      setAtTop(vp.scrollTop <= 0);
      setAtBottom(vp.scrollTop + vp.clientHeight >= vp.scrollHeight - 1);
      setAtLeft(vp.scrollLeft <= 0);
      setAtRight(vp.scrollLeft + vp.clientWidth >= vp.scrollWidth - 1);
    }
  }, [showV, showH, scrollbarPadding, minThumbLength, fadeMask]);

  // Show scrollbar with auto-hide
  const showScrollbar = useCallback(() => {
    if (scrollbarVisibility === 'never') return;
    if (scrollbarVisibility === 'always') return;

    setScrollbarVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    if (scrollbarVisibility === 'auto') {
      hideTimerRef.current = setTimeout(() => {
        if (!isDragging) {
          setScrollbarVisible(false);
        }
      }, hideDelay);
    }
  }, [scrollbarVisibility, hideDelay, isDragging]);

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      recalculate();
      showScrollbar();
      onScroll?.(e);

      const vp = e.currentTarget;
      if (vp.scrollTop <= 0) {
        onScrollTop?.();
      }
      if (vp.scrollTop + vp.clientHeight >= vp.scrollHeight - 1) {
        onScrollBottom?.();
      }
    },
    [recalculate, showScrollbar, onScroll, onScrollTop, onScrollBottom]
  );

  // Handle hover
  const handleMouseEnter = useCallback(() => {
    if (scrollbarVisibility === 'hover' || scrollbarVisibility === 'auto') {
      setScrollbarVisible(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    }
  }, [scrollbarVisibility]);

  const handleMouseLeave = useCallback(() => {
    if (scrollbarVisibility === 'hover') {
      setScrollbarVisible(false);
    } else if (scrollbarVisibility === 'auto' && !isDragging) {
      hideTimerRef.current = setTimeout(() => {
        setScrollbarVisible(false);
      }, hideDelay);
    }
  }, [scrollbarVisibility, isDragging, hideDelay]);

  // Thumb drag handlers
  const handleThumbPointerDown = useCallback(
    (axis: 'vertical' | 'horizontal', e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const vp = viewportRef.current;
      if (!vp) return;

      setIsDragging(true);
      dragAxisRef.current = axis;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      if (axis === 'vertical') {
        dragStartRef.current = {
          pointerPos: e.clientY,
          scrollPos: vp.scrollTop,
        };
      } else {
        dragStartRef.current = {
          pointerPos: e.clientX,
          scrollPos: vp.scrollLeft,
        };
      }
    },
    []
  );

  const handleThumbPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !dragAxisRef.current) return;
      const vp = viewportRef.current;
      if (!vp) return;

      const axis = dragAxisRef.current;

      if (axis === 'vertical') {
        const trackHeight = vp.clientHeight - scrollbarPadding * 2;
        const maxScroll = vp.scrollHeight - vp.clientHeight;
        const delta = e.clientY - dragStartRef.current.pointerPos;
        const scrollDelta = (delta / (trackHeight - vThumbSize)) * maxScroll;
        vp.scrollTop = dragStartRef.current.scrollPos + scrollDelta;
      } else {
        const trackWidth = vp.clientWidth - scrollbarPadding * 2;
        const maxScroll = vp.scrollWidth - vp.clientWidth;
        const delta = e.clientX - dragStartRef.current.pointerPos;
        const scrollDelta = (delta / (trackWidth - hThumbSize)) * maxScroll;
        vp.scrollLeft = dragStartRef.current.scrollPos + scrollDelta;
      }
    },
    [isDragging, scrollbarPadding, vThumbSize, hThumbSize]
  );

  const handleThumbPointerUp = useCallback(() => {
    setIsDragging(false);
    dragAxisRef.current = null;
  }, []);

  // Track click handler
  const handleTrackClick = useCallback(
    (axis: 'vertical' | 'horizontal', e: React.MouseEvent) => {
      const vp = viewportRef.current;
      if (!vp) return;

      const trackRect = (
        e.currentTarget as HTMLElement
      ).getBoundingClientRect();

      if (axis === 'vertical') {
        const clickRatio = (e.clientY - trackRect.top) / trackRect.height;
        vp.scrollTop = clickRatio * (vp.scrollHeight - vp.clientHeight);
      } else {
        const clickRatio = (e.clientX - trackRect.left) / trackRect.width;
        vp.scrollLeft = clickRatio * (vp.scrollWidth - vp.clientWidth);
      }
    },
    []
  );

  // Observe resize
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    recalculate();

    const ro = new ResizeObserver(() => {
      recalculate();
    });
    ro.observe(vp);
    if (vp.firstElementChild) {
      ro.observe(vp.firstElementChild);
    }

    return () => ro.disconnect();
  }, [recalculate]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  // Set ref
  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      if (typeof externalRef === 'function') {
        externalRef(node as HTMLDivElement);
      } else if (externalRef && typeof externalRef === 'object') {
        (externalRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }
    },
    [externalRef]
  );

  const isScrollbarShown =
    scrollbarVisibility === 'never' ? false : scrollbarVisible;

  return (
    <StyledRoot
      $maxHeight={maxHeight}
      $maxWidth={maxWidth}
      $autoFill={autoFill}
      className={className}
      style={style}
      data-testid={testId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <StyledViewport
        ref={setViewportRef}
        id={viewportId}
        role="region"
        tabIndex={0}
        $direction={direction}
        onScroll={handleScroll}
      >
        {children}
      </StyledViewport>

      {/* Fade masks */}
      {fadeMask && showV && (
        <>
          <StyledFadeMask
            $position="top"
            $size={fadeMaskHeight}
            $visible={!atTop}
            data-testid={testId ? `${testId}-fade-top` : undefined}
          />
          <StyledFadeMask
            $position="bottom"
            $size={fadeMaskHeight}
            $visible={!atBottom}
            data-testid={testId ? `${testId}-fade-bottom` : undefined}
          />
        </>
      )}
      {fadeMask && showH && (
        <>
          <StyledFadeMask
            $position="left"
            $size={fadeMaskHeight}
            $visible={!atLeft}
          />
          <StyledFadeMask
            $position="right"
            $size={fadeMaskHeight}
            $visible={!atRight}
          />
        </>
      )}

      {/* Vertical scrollbar */}
      {showV && hasVOverflow && (
        <StyledScrollbar
          $direction="vertical"
          $width={scrollbarWidth}
          $padding={scrollbarPadding}
          $visible={isScrollbarShown}
          role="scrollbar"
          aria-controls={viewportId}
          aria-orientation="vertical"
          aria-valuenow={Math.round(
            viewportRef.current
              ? (viewportRef.current.scrollTop /
                  Math.max(
                    1,
                    viewportRef.current.scrollHeight -
                      viewportRef.current.clientHeight
                  )) *
                  100
              : 0
          )}
          aria-valuemin={0}
          aria-valuemax={100}
          data-testid={testId ? `${testId}-scrollbar-v` : undefined}
          onClick={e => handleTrackClick('vertical', e)}
        >
          <StyledThumb
            $direction="vertical"
            $isDragging={isDragging && dragAxisRef.current === 'vertical'}
            style={{
              height: `${vThumbSize}px`,
              transform: `translateY(${vThumbOffset}px)`,
            }}
            onPointerDown={e => handleThumbPointerDown('vertical', e)}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            data-testid={testId ? `${testId}-thumb-v` : undefined}
          />
        </StyledScrollbar>
      )}

      {/* Horizontal scrollbar */}
      {showH && hasHOverflow && (
        <StyledScrollbar
          $direction="horizontal"
          $width={scrollbarWidth}
          $padding={scrollbarPadding}
          $visible={isScrollbarShown}
          role="scrollbar"
          aria-controls={viewportId}
          aria-orientation="horizontal"
          aria-valuenow={Math.round(
            viewportRef.current
              ? (viewportRef.current.scrollLeft /
                  Math.max(
                    1,
                    viewportRef.current.scrollWidth -
                      viewportRef.current.clientWidth
                  )) *
                  100
              : 0
          )}
          aria-valuemin={0}
          aria-valuemax={100}
          data-testid={testId ? `${testId}-scrollbar-h` : undefined}
          onClick={e => handleTrackClick('horizontal', e)}
        >
          <StyledThumb
            $direction="horizontal"
            $isDragging={isDragging && dragAxisRef.current === 'horizontal'}
            style={{
              width: `${hThumbSize}px`,
              transform: `translateX(${hThumbOffset}px)`,
            }}
            onPointerDown={e => handleThumbPointerDown('horizontal', e)}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            data-testid={testId ? `${testId}-thumb-h` : undefined}
          />
        </StyledScrollbar>
      )}
    </StyledRoot>
  );
};

ScrollArea.displayName = 'ScrollArea';
