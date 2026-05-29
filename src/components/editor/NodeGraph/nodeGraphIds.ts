import type { NodeGraphPortRef } from './NodeGraph.types';

// Module-scoped monotonic counter — guarantees uniqueness within a single
// session even when `Date.now()` collides (tight bursts of connections,
// fake timers in tests). Combined with a short random tail it gives a
// near-zero collision risk without pulling in `crypto.randomUUID`, which
// isn't available in every browser / runtime the library targets.
let idCounter = 0;

function uniqueSuffix(): string {
  const t = Date.now().toString(36);
  const c = (idCounter++).toString(36);
  const r = Math.random().toString(36).slice(2, 6);
  return `${t}-${c}-${r}`;
}

/**
 * Generate a unique-enough id for a freshly-spawned node from a template.
 * Format: `${templateId}-${timestamp36}-${counter36}-${random36}`.
 */
export function generateNodeId(templateId: string): string {
  return `${templateId}-${uniqueSuffix()}`;
}

/**
 * Generate a unique edge id from its endpoints. Includes source/target
 * port refs in the id so it's somewhat readable in devtools, plus the
 * standard timestamp + counter + random tail to guarantee uniqueness
 * across rapid back-to-back connections.
 */
export function generateEdgeId(
  source: NodeGraphPortRef,
  target: NodeGraphPortRef
): string {
  return `edge-${source.node}.${source.port}-${target.node}.${target.port}-${uniqueSuffix()}`;
}
