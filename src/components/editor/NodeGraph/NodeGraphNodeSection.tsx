'use client';

import React, { useCallback, useMemo } from 'react';
import { useControlledState } from '@/hooks';
import { cx } from '@/utils/cx';
import {
  nodeSectionStyle,
  nodeSectionHeaderStyle,
  nodeSectionChevronRecipe,
  nodeSectionTitleStyle,
  nodeSectionContentStyle,
} from './NodeGraph.css';
import {
  NodeGraphNodeSectionContext,
  type NodeGraphNodeSectionContextValue,
} from './NodeGraphNodeSectionContext';

export interface NodeGraphNodeSectionProps {
  /** Header label shown next to the collapse toggle. */
  title?: React.ReactNode;
  /**
   * Whether the header toggles the section. When false the section is a
   * static labelled group (no chevron, always shown). @default true
   */
  collapsible?: boolean;
  /** Controlled collapsed state. Pair with `onCollapsedChange`. */
  collapsed?: boolean;
  /** Initial collapsed state when uncontrolled. @default false */
  defaultCollapsed?: boolean;
  /** Fires when the user toggles the section. */
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  /** Section body — typically a `<NodeGraph.PinList>` of the extra pins. */
  children?: React.ReactNode;
}

/**
 * A collapsible section inside a node body — the place to tuck "advanced" /
 * overflow pins so the node stays compact. The collapse is **purely visual**:
 * the children never unmount, so their state is preserved and there's no
 * remount cost. `<NodeGraph.Port>` slots inside a collapsed section
 * unregister their position while hidden, so the pins' edges hide with them
 * and reappear on expand — no dangling wires, no manual re-anchoring.
 *
 * @example
 * ```tsx
 * <NodeGraph.NodeBody>
 *   <NodeGraph.NodeHeader title="Make Transform" />
 *   <NodeGraph.PinList>{mainPins}</NodeGraph.PinList>
 *   <NodeGraph.NodeSection title="Advanced" defaultCollapsed>
 *     <NodeGraph.PinList>{advancedPins}</NodeGraph.PinList>
 *   </NodeGraph.NodeSection>
 * </NodeGraph.NodeBody>
 * ```
 */
export function NodeGraphNodeSection({
  title,
  collapsible = true,
  collapsed: collapsedProp,
  defaultCollapsed,
  onCollapsedChange,
  className,
  style,
  children,
}: NodeGraphNodeSectionProps): React.ReactElement {
  const [collapsedState, setCollapsed] = useControlledState<boolean>({
    value: collapsedProp,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
    fallback: false,
  });
  // A non-collapsible section is always expanded regardless of state.
  const collapsed = collapsible ? collapsedState : false;

  const toggle = useCallback(() => {
    if (!collapsible) return;
    setCollapsed(prev => !prev);
  }, [collapsible, setCollapsed]);

  // Toggling the section must not start a node drag / selection.
  const stopPointer = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation();
    },
    []
  );

  const ctxValue = useMemo<NodeGraphNodeSectionContextValue>(
    () => ({ collapsed }),
    [collapsed]
  );

  return (
    <div className={cx(nodeSectionStyle, className)} style={style}>
      <button
        type="button"
        className={nodeSectionHeaderStyle}
        onClick={toggle}
        onPointerDown={stopPointer}
        disabled={!collapsible}
        aria-expanded={collapsible ? !collapsed : undefined}
      >
        {collapsible ? (
          <span
            className={nodeSectionChevronRecipe({ collapsed })}
            aria-hidden="true"
          />
        ) : null}
        {title != null ? (
          <span className={nodeSectionTitleStyle}>{title}</span>
        ) : null}
      </button>
      <div
        className={nodeSectionContentStyle}
        style={collapsed ? { display: 'none' } : undefined}
      >
        <NodeGraphNodeSectionContext.Provider value={ctxValue}>
          {children}
        </NodeGraphNodeSectionContext.Provider>
      </div>
    </div>
  );
}

NodeGraphNodeSection.displayName = 'NodeGraphNodeSection';
