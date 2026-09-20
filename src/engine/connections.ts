/**
 * Connection Engine for TRACE
 * Deterministic, performance-safe connection discovery.
 * Indexes by temporal proximity and thematic/cross-type correlation.
 * Avoids O(n²) all-pairs comparisons.
 */

import { ConnectedCluster, ConnectionType, ReceiptConnection } from '../types/connections';
import { Receipt } from '../types/receipt';
import { formatTimeOnly, safeParseDate } from '../utils/dates';

export function buildConnections(receipts: Receipt[]): {
  connections: ReceiptConnection[];
  clusters: ConnectedCluster[];
} {
  if (receipts.length < 2) {
    return { connections: [], clusters: [] };
  }

  // Sort receipts chronologically
  const sorted = [...receipts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const connections: ReceiptConnection[] = [];
  const connectionSet = new Set<string>();

  // Use a sliding time window (max 4 hours = 14,400 seconds)
  // Each receipt only compares with a handful of temporal neighbors
  const MAX_WINDOW_MS = 4 * 60 * 60 * 1000;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const currentTime = new Date(current.timestamp).getTime();

    // Look ahead within temporal window only (constant bounded lookahead)
    for (let j = i + 1; j < sorted.length; j++) {
      const neighbor = sorted[j];
      const neighborTime = new Date(neighbor.timestamp).getTime();
      const deltaMs = neighborTime - currentTime;

      if (deltaMs > MAX_WINDOW_MS) {
        break; // Out of sliding window
      }

      const deltaSeconds = Math.round(deltaMs / 1000);
      const pairKey = `${current.id}_${neighbor.id}`;

      let connType: ConnectionType = 'TEMPORAL';
      let strength = 0.5;
      let reason = 'Occurred within the same 4-hour window.';

      const sameDate = current.timestamp.slice(0, 10) === neighbor.timestamp.slice(0, 10);
      const currentHour = safeParseDate(current.timestamp)?.getUTCHours() ?? 12;
      const isLateHours = currentHour >= 0 && currentHour <= 4;

      // Cross-Type Connection (e.g. Music + Purchase)
      if (current.type !== neighbor.type) {
        connType = 'CROSS_TYPE';
        strength = 0.85;
        if (isLateHours) {
          reason = `Cross-activity sequence: listened to "${current.title}" alongside "${neighbor.title}" during late-night hours.`;
        } else {
          reason = `Synchronous routine: ${current.type.toLowerCase()} activity bridged with ${neighbor.type.toLowerCase()} within ${Math.round(deltaSeconds / 60)} minutes.`;
        }
      }
      // Same Type & Same Subtitle/Artist/Merchant
      else if (current.subtitle && neighbor.subtitle && current.subtitle === neighbor.subtitle) {
        connType = 'BEHAVIORAL';
        strength = 0.9;
        reason = `Continuous listening session featuring ${current.subtitle}.`;
      }
      // Sequence in tight window (< 15 mins)
      else if (deltaSeconds <= 900) {
        connType = 'SEQUENCE';
        strength = 0.75;
        reason = `Sequential moments happening within ${Math.round(deltaSeconds / 60)} minutes of each other.`;
      }
      // Late night thematic connection
      else if (isLateHours && sameDate) {
        connType = 'BEHAVIORAL';
        strength = 0.8;
        reason = 'Late-night nocturnal focus window (00:00 - 05:00).';
      }

      if (!connectionSet.has(pairKey)) {
        connectionSet.add(pairKey);
        connections.push({
          id: `conn_${pairKey}`,
          sourceId: current.id,
          targetId: neighbor.id,
          type: connType,
          strength,
          reason,
          timestampDeltaSeconds: deltaSeconds,
        });
      }
    }
  }

  // Derive Connected Clusters from high-density connection groups
  const clusters: ConnectedCluster[] = [];
  const visitedReceipts = new Set<string>();

  // Find tight groups of connected receipts
  const adjacency = new Map<string, string[]>();
  for (const c of connections) {
    if (!adjacency.has(c.sourceId)) adjacency.set(c.sourceId, []);
    if (!adjacency.has(c.targetId)) adjacency.set(c.targetId, []);
    adjacency.get(c.sourceId)!.push(c.targetId);
    adjacency.get(c.targetId)!.push(c.sourceId);
  }

  for (const r of sorted) {
    if (visitedReceipts.has(r.id)) continue;
    const neighbors = adjacency.get(r.id) || [];
    if (neighbors.length >= 2) {
      // Form a cluster
      const clusterMembers = [r.id, ...neighbors.slice(0, 4)];
      clusterMembers.forEach(id => visitedReceipts.add(id));

      const memberReceipts = clusterMembers
        .map(id => sorted.find(x => x.id === id))
        .filter((x): x is Receipt => !!x);

      const d = safeParseDate(r.timestamp);
      const hour = d ? d.getUTCHours() : 0;
      const isLate = hour >= 0 && hour <= 4;

      const dateLabel = r.timestamp.slice(0, 10);
      const title = isLate ? `Nocturnal Convergence (${dateLabel})` : `Activity Flow on ${dateLabel}`;
      const timeSpan = `${formatTimeOnly(memberReceipts[0].timestamp)} – ${formatTimeOnly(memberReceipts[memberReceipts.length - 1].timestamp)}`;

      const clusterConnections = connections.filter(
        c => clusterMembers.includes(c.sourceId) && clusterMembers.includes(c.targetId)
      );

      clusters.push({
        id: `cluster_${r.id}`,
        title,
        summary: `${memberReceipts.length} interconnected moments clustered across a single activity window.`,
        timeWindowDescription: `${dateLabel} (${timeSpan} UTC)`,
        receiptIds: clusterMembers,
        primaryType: r.type,
        connections: clusterConnections,
        significance: isLate
          ? 'Late-night flow where musical immersion intersects with daily habits.'
          : 'Daytime continuity showing repeated personal rituals.',
      });
    }
  }

  return { connections, clusters };
}
