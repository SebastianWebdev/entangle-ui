import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ScrollAreaProps } from './ScrollArea.types';
import { cx } from '@/utils/cx';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import {
  rootStyle,
  rootAutoFill,
  viewportRecipe,
  scrollbarVertical,
  scrollbarHorizontal,
  scrollbarVisible,
  scrollbarHidden,
  thumbBase,
  thumbVertical,
  thumbHorizontal,
  thumbDragging,
  fadeMaskBase,
  fadeMaskVisible,
  fadeMaskHiddenStyle,
  fadeMaskTop,
  fadeMaskBottom,
  fadeMaskLeft,
  fadeMaskRight,
  scrollbarWidthVar,
  scrollbarPaddingVar,
  fadeMaskSizeVar,
} from './ScrollArea.css';

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
  const [scrollbarVisibleState, setScrollbarVisibleState] = useState(
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

    setScrollbarVisibleState(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    if (scrollbarVisibility === 'auto') {
      hideTimerRef.current = setTimeout(() => {
        if (!isDragging) {
          setScrollbarVisibleState(false);
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
      setScrollbarVisibleState(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    }
  }, [scrollbarVisibility]);

  const handleMouseLeave = useCallback(() => {
    if (scrollbarVisibility === 'hover') {
      setScrollbarVisibleState(false);
    } else if (scrollbarVisibility === 'auto' && !isDragging) {
      hideTimerRef.current = setTimeout(() => {
        setScrollbarVisibleState(false);
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
    scrollbarVisibility === 'never' ? false : scrollbarVisibleState;

  const rootInlineStyle: React.CSSProperties = {
    ...assignInlineVars({
      [scrollbarWidthVar]: `${scrollbarWidth}px`,
      [scrollbarPaddingVar]: `${scrollbarPadding}px`,
      [fadeMaskSizeVar]: `${fadeMaskHeight}px`,
    }),
    ...(maxHeight != null
      ? {
          maxHeight:
            typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
        }
      : undefined),
    ...(maxWidth != null
      ? {
          maxWidth:
            typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
        }
      : undefined),
    ...style,
  };

  return (
    <div
      className={cx(rootStyle, autoFill && rootAutoFill, className)}
      style={rootInlineStyle}
      data-testid={testId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <div
        ref={setViewportRef}
        id={viewportId}
        role="region"
        tabIndex={0}
        className={viewportRecipe({ direction })}
        onScroll={handleScroll}
      >
        {children}
      </div>

      {/* Fade masks */}
      {fadeMask && showV && (
        <>
          <div
            className={cx(
              fadeMaskBase,
              fadeMaskTop,
              !atTop ? fadeMaskVisible : fadeMaskHiddenStyle,
            )}
            data-testid={testId ? `${testId}-fade-top` : undefined}
          />
          <div
            className={cx(
              fadeMaskBase,
              fadeMaskBottom,
              !atBottom ? fadeMaskVisible : fadeMaskHiddenStyle,
            )}
            data-testid={testId ? `${testId}-fade-bottom` : undefined}
          />
        </>
      )}
      {fadeMask && showH && (
        <>
          <div
            className={cx(
              fadeMaskBase,
              fadeMaskLeft,
              !atLeft ? fadeMaskVisible : fadeMaskHiddenStyle,
            )}
          />
          <div
            className={cx(
              fadeMaskBase,
              fadeMaskRight,
              !atRight ? fadeMaskVisible : fadeMaskHiddenStyle,
            )}
          />
        </>
      )}

      {/* Vertical scrollbar */}
      {showV && hasVOverflow && (
        <div
          className={cx(
            scrollbarVertical,
            isScrollbarShown ? scrollbarVisible : scrollbarHidden,
          )}
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
          <div
            className={cx(
              thumbBase,
              thumbVertical,
              isDragging && dragAxisRef.current === 'vertical' && thumbDragging,
            )}
            style={{
              height: `${vThumbSize}px`,
              transform: `translateY(${vThumbOffset}px)`,
            }}
            onPointerDown={e => handleThumbPointerDown('vertical', e)}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            data-testid={testId ? `${testId}-thumb-v` : undefined}
          />
        </div>
      )}

      {/* Horizontal scrollbar */}
      {showH && hasHOverflow && (
        <div
          className={cx(
            scrollbarHorizontal,
            isScrollbarShown ? scrollbarVisible : scrollbarHidden,
          )}
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
          <div
            className={cx(
              thumbBase,
              thumbHorizontal,
              isDragging && dragAxisRef.current === 'horizontal' && thumbDragging,
            )}
            style={{
              width: `${hThumbSize}px`,
              transform: `translateX(${hThumbOffset}px)`,
            }}
            onPointerDown={e => handleThumbPointerDown('horizontal', e)}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            data-testid={testId ? `${testId}-thumb-h` : undefined}
          />
        </div>
      )}
    </div>
  );
};

ScrollArea.displayName = 'ScrollArea';
