/**
 * Score how well `query` matches `target`. Higher = better. Zero = no match.
 *
 * Heuristics, in priority order:
 *   1. Exact case-insensitive match (1000).
 *   2. Target starts with the query (800 + length bonus).
 *   3. Target contains the query as a contiguous substring (500 + position bonus).
 *   4. Subsequence match: every query char appears in target in order; bonuses
 *      for consecutive matches, word-boundary matches, and earlier positions.
 *
 * @example
 * ```ts
 * fuzzyScore('opn', 'open file')  // > 0, subsequence match
 * fuzzyScore('zzz', 'open file')  // 0
 * ```
 */
export function fuzzyScore(query: string, target: string): number {
  if (query === '') return 1;
  if (target === '') return 0;

  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (q === t) return 1000;
  if (t.startsWith(q)) return 800 + Math.max(0, 50 - target.length);
  const containsAt = t.indexOf(q);
  if (containsAt !== -1)
    return 500 - containsAt + Math.max(0, 30 - target.length);

  let score = 0;
  let qi = 0;
  let lastMatch = -2;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    const ch = t[ti];
    if (ch === q[qi]) {
      // Earlier matches contribute more.
      score += Math.max(1, 30 - ti);
      if (lastMatch === ti - 1) {
        score += 25;
      }
      // Bonus when the match begins a "word" (after space/-/_/.)
      const prev = ti > 0 ? t[ti - 1] : '';
      if (
        ti === 0 ||
        prev === ' ' ||
        prev === '-' ||
        prev === '_' ||
        prev === '.'
      ) {
        score += 20;
      }
      lastMatch = ti;
      qi++;
    }
  }

  if (qi !== q.length) return 0;
  return score;
}

export interface FuzzyMatch<T> {
  item: T;
  score: number;
}

/**
 * Score a list of items against a query. Items with score 0 are dropped, the
 * rest are sorted by descending score. The `getStrings` accessor returns one
 * or more strings per item to score against; the highest-scoring string wins.
 */
export function fuzzyFilter<T>(
  query: string,
  items: readonly T[],
  getStrings: (item: T) => readonly string[]
): FuzzyMatch<T>[] {
  if (query === '') {
    return items.map(item => ({ item, score: 1 }));
  }
  const result: FuzzyMatch<T>[] = [];
  for (const item of items) {
    const strings = getStrings(item);
    let best = 0;
    for (const s of strings) {
      const score = fuzzyScore(query, s);
      if (score > best) best = score;
    }
    if (best > 0) {
      result.push({ item, score: best });
    }
  }
  result.sort((a, b) => b.score - a.score);
  return result;
}
