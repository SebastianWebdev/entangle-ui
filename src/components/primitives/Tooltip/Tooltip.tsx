// src/components/primitives/Tooltip/Tooltip.tsx
import React, {
  useState,
  useContext,
  createContext,
  isValidElement,
  cloneElement,
  useMemo,
} from 'react';
import styled from '@emotion/styled';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  useMergeRefs,
  FloatingPortal,
  arrow,
  FloatingArrow,
  safePolygon,
} from '@floating-ui/react';

import type { Prettify } from '@/types/utilities';
import type { BaseComponent } from '@/types/common';
import type { Placement, FloatingContext } from '@floating-ui/react';

/**
 * Tooltip placement options following FloatingUI conventions
 */
export type TooltipPlacement = Placement;

/**
 * Tooltip appearance variants
 */
export type TooltipVariant = 'dark' | 'light';

/**
 * Options for the useTooltip hook
 */
interface UseTooltipOptions {
  initialOpen?: boolean;
  placement?: TooltipPlacement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  offset?: number;
  delay?: number;
  showArrow?: boolean;
}

/**
 * Return type of the useTooltip hook
 */
interface UseTooltipReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  refs: {
    setReference: (node: HTMLElement | null) => void;
    setFloating: (node: HTMLElement | null) => void;
    setArrow: (node: HTMLElement | null) => void;
  };
  floatingStyles: React.CSSProperties;
  context: FloatingContext;
  getReferenceProps: (
    props?: React.HTMLProps<HTMLElement>
  ) => Record<string, unknown>;
  getFloatingProps: (
    props?: React.HTMLProps<HTMLElement>
  ) => Record<string, unknown>;
  arrowRef: React.RefObject<HTMLElement | null>;
  middlewareData: Record<string, unknown>;
}

/**
 * Custom hook for tooltip functionality
 */
function useTooltip({
  initialOpen = false,
  placement = 'top',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  offset: offsetValue = 8,
  delay = 600,
  showArrow = true,
}: UseTooltipOptions = {}): UseTooltipReturn {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const arrowRef = React.useRef<HTMLElement | null>(null);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetValue),
      flip({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'start',
        padding: 8,
      }),
      shift({ padding: 8 }),
      ...(showArrow ? [arrow({ element: arrowRef })] : []),
    ],
  });

  const context = data.context;

  const hover = useHover(context, {
    move: false,
    enabled: controlledOpen == null,
    delay: {
      open: delay,
      close: 0,
    },
    handleClose: safePolygon(),
  });

  const focus = useFocus(context, {
    enabled: controlledOpen == null,
  });

  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const interactions = useInteractions([hover, focus, dismiss, role]);

  return useMemo(
    () => ({
      open,
      setOpen,
      arrowRef,
      ...interactions,
      ...data,
      refs: {
        ...data.refs,
        setArrow: (node: HTMLElement | null) => {
          arrowRef.current = node;
        },
      },
    }),
    [open, setOpen, interactions, data]
  );
}

/**
 * Context for sharing tooltip state between components
 */
const TooltipContext = createContext<UseTooltipReturn | null>(null);

/**
 * Hook to access tooltip context
 */
const useTooltipContext = () => {
  const context = useContext(TooltipContext);

  if (context == null) {
    throw new Error('Tooltip components must be wrapped in <Tooltip />');
  }

  return context;
};

export interface TooltipProps extends UseTooltipOptions {
  /**
   * The tooltip components (TooltipTrigger and TooltipContent)
   */
  children: React.ReactNode;
}

/**
 * Root tooltip component that provides context
 */
export function Tooltip({ children, ...options }: TooltipProps) {
  const tooltip = useTooltip(options);

  return (
    <TooltipContext.Provider value={tooltip}>
      {children}
    </TooltipContext.Provider>
  );
}

export interface TooltipTriggerProps extends React.HTMLProps<HTMLElement> {
  /**
   * Whether to render the trigger as the child element.
   * When true, the child must be a single React element that can accept a ref.
   * @default false
   */
  asChild?: boolean;
  children: React.ReactNode;
  ref?: React.Ref<HTMLElement>;
}

/**
 * Tooltip trigger component that handles interactions
 */
export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({
  children,
  asChild = false,
  ref: propRef,
  ...props
}) => {
  const context = useTooltipContext();
  const childrenRef = isValidElement(children)
    ? (children as React.ReactElement & { ref?: React.Ref<unknown> }).ref
    : null;
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

  // `asChild` allows the user to pass any element as the anchor
  if (asChild && isValidElement(children)) {
    return cloneElement(
      children as React.ReactElement<Record<string, unknown>>,
      context.getReferenceProps({
        ref,
        ...props,
        ...children.props,
        'data-state': context.open ? 'open' : 'closed',
      })
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      data-state={context.open ? 'open' : 'closed'}
      {...context.getReferenceProps(props)}
    >
      {children}
    </button>
  );
};

interface StyledTooltipContentProps {
  $variant: TooltipVariant;
}

const StyledTooltipContent = styled.div<StyledTooltipContentProps>`
  /* Base styles */
  position: relative;
  max-width: 250px;
  padding: ${props =>
    `${props.theme.spacing.sm}px ${props.theme.spacing.md}px`};
  border-radius: ${props => props.theme.borderRadius.md}px;
  font-size: ${props => props.theme.typography.fontSize.xs}px;
  line-height: ${props => props.theme.typography.lineHeight.normal};
  z-index: 1000;
  pointer-events: none;
  user-select: none;

  /* Animation */
  animation: fadeIn ${props => props.theme.transitions.fast};

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Variant styles */
  ${props => {
    const { colors } = props.theme;

    switch (props.$variant) {
      case 'dark':
        return `
          background: ${colors.background.elevated};
          color: ${colors.text.primary};
          border: 1px solid ${colors.border.default};
          box-shadow: ${props.theme.shadows.lg};
        `;
      case 'light':
        return `
          background: ${colors.surface.default};
          color: ${colors.text.primary};
          border: 1px solid ${colors.border.default};
          box-shadow: ${props.theme.shadows.md};
        `;
      default:
        return '';
    }
  }}
`;

const StyledArrow = styled(FloatingArrow)<StyledTooltipContentProps>`
  fill: ${props => {
    switch (props.$variant) {
      case 'dark':
        return props.theme.colors.background.elevated;
      case 'light':
        return props.theme.colors.surface.default;
      default:
        return props.theme.colors.background.elevated;
    }
  }};

  [stroke] {
    stroke: ${props => props.theme.colors.border.default};
  }
`;

export interface TooltipContentBaseProps
  extends Omit<BaseComponent<HTMLDivElement>, 'content' | 'style'> {
  /**
   * Visual variant of the tooltip
   * - `dark`: Dark background with light text (default)
   * - `light`: Light background with dark text
   * @default "dark"
   */
  variant?: TooltipVariant;

  /**
   * Whether to show an arrow pointing to the trigger element
   * @default true
   */
  showArrow?: boolean;

  /**
   * Override styles for the floating element
   */
  style?: React.CSSProperties;

  /**
   * Tooltip content
   */
  children: React.ReactNode;
}

export type TooltipContentProps = Prettify<TooltipContentBaseProps>;

/**
 * Tooltip content component that renders the floating element
 */
export const TooltipContent: React.FC<TooltipContentProps> = ({
  style,
  variant = 'dark',
  showArrow = true,
  className,
  testId,
  children,
  ref: propRef,
  ...props
}) => {
  const context = useTooltipContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!context.open) return null;

  return (
    <FloatingPortal>
      <StyledTooltipContent
        ref={ref}
        $variant={variant}
        className={className}
        data-testid={testId}
        style={{
          ...context.floatingStyles,
          ...style,
        }}
        {...context.getFloatingProps(props)}
      >
        {children}
        {showArrow && (
          <StyledArrow
            ref={
              context.refs.setArrow as unknown as React.RefObject<SVGSVGElement>
            }
            context={context.context}
            $variant={variant}
            strokeWidth={1}
          />
        )}
      </StyledTooltipContent>
    </FloatingPortal>
  );
};

/**
 * Simple tooltip wrapper for common use cases
 *
 * @example
 * ```tsx
 * <SimpleTooltip content="Save your work">
 *   <Button>Save</Button>
 * </SimpleTooltip>
 * ```
 */
export interface SimpleTooltipProps extends Omit<TooltipProps, 'children'> {
  /**
   * Content to display in the tooltip
   */
  content: React.ReactNode;

  /**
   * The element that triggers the tooltip
   */
  children: React.ReactElement;

  /**
   * Visual variant of the tooltip
   * @default "dark"
   */
  variant?: TooltipVariant;

  /**
   * Whether the tooltip is disabled
   * @default false
   */
  disabled?: boolean;
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  content,
  children,
  variant = 'dark',
  disabled = false,
  ...tooltipProps
}) => {
  if (disabled) {
    return children;
  }

  return (
    <Tooltip {...tooltipProps}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent variant={variant}>{content}</TooltipContent>
    </Tooltip>
  );
};
