/**
 * Hook to execute and memoize the TRACE Engines:
 * - Connection Engine (connections + clusters)
 * - Pattern Engine (evidence-based patterns)
 * - Story Engine (life chapters)
 * - Insight Engine (signals + What Does It All Mean)
 */

import { useMemo } from 'react';
import { buildConnections } from '../engine/connections';
import { generateInsights } from '../engine/insights';
import { detectPatterns } from '../engine/patterns';
import { generateChapters } from '../engine/stories';
import { Receipt } from '../types/receipt';

export function useStoryEngine(receipts: Receipt[]) {
  const { connections, clusters } = useMemo(() => {
    return buildConnections(receipts);
  }, [receipts]);

  const patterns = useMemo(() => {
    return detectPatterns(receipts);
  }, [receipts]);

  const chapters = useMemo(() => {
    return generateChapters(receipts);
  }, [receipts]);

  const { insights, narrative } = useMemo(() => {
    return generateInsights(receipts);
  }, [receipts]);

  return {
    connections,
    clusters,
    patterns,
    chapters,
    insights,
    narrative,
  };
}
