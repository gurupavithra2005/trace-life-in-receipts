import React, { useMemo, useState } from 'react';
import { Compass, Filter, GitBranch, Info, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { ConnectedCluster, ReceiptConnection } from '../../types/connections';
import { Receipt, ReceiptType } from '../../types/receipt';
import { formatTimeOnly, safeParseDate } from '../../utils/dates';
import { getReceiptTypeIcon } from '../layout/ReceiptDetailModal';

interface LifeMapCanvasProps {
  receipts: Receipt[];
  connections: ReceiptConnection[];
  clusters: ConnectedCluster[];
  onSelectReceipt: (receipt: Receipt) => void;
  selectedReceipt: Receipt | null;
}

interface MapNode {
  id: string;
  receipt: Receipt;
  x: number;
  y: number;
  radius: number;
  color: string;
  type: ReceiptType;
  clusterId?: string;
}

export const LifeMapCanvas: React.FC<LifeMapCanvasProps> = ({
  receipts,
  connections,
  clusters,
  onSelectReceipt,
  selectedReceipt,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);

  // Take a curated, representative subset of meaningful receipts for visual elegance (up to 40 nodes)
  const displayReceipts = useMemo(() => {
    let list = receipts;
    if (filterType === 'MUSIC') list = list.filter(r => r.type === 'MUSIC');
    if (filterType === 'PURCHASE') list = list.filter(r => r.type === 'PURCHASE');
    if (filterType === 'LATE_NIGHT') {
      list = list.filter(r => {
        const d = safeParseDate(r.timestamp);
        const h = d ? d.getUTCHours() : 12;
        return h >= 0 && h <= 4;
      });
    }

    // Keep chronological order and pick up to 36 meaningful nodes
    return list.slice(0, 36);
  }, [receipts, filterType]);

  // Generate node coordinates deterministically in a constellation layout
  const nodes: MapNode[] = useMemo(() => {
    const width = 850;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    const getNodeColor = (type: ReceiptType) => {
      switch (type) {
        case 'MUSIC':
          return '#38bdf8'; // sky-400
        case 'PURCHASE':
          return '#f59e0b'; // amber-500
        case 'PLACE':
          return '#10b981'; // emerald-500
        case 'EVENT':
          return '#ec4899'; // pink-500
        default:
          return '#a8a29e'; // stone-400
      }
    };

    return displayReceipts.map((r, i) => {
      // Group by cluster or spiral position
      const angle = (i / displayReceipts.length) * 2 * Math.PI + (i % 2 === 0 ? 0.3 : -0.2);
      const isLate = (safeParseDate(r.timestamp)?.getUTCHours() ?? 12) <= 4;
      const radiusDist = isLate ? 120 + ((i * 19) % 70) : 170 + ((i * 23) % 90);

      const x = Math.max(40, Math.min(width - 40, centerX + Math.cos(angle) * radiusDist + ((i * 37) % 30)));
      const y = Math.max(40, Math.min(height - 40, centerY + Math.sin(angle) * (radiusDist * 0.75) + ((i * 41) % 25)));

      return {
        id: r.id,
        receipt: r,
        x,
        y,
        radius: isLate ? 9 : 7.5,
        color: getNodeColor(r.type),
        type: r.type,
      };
    });
  }, [displayReceipts]);

  // Filter visible connections
  const visibleConnections = useMemo(() => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    return connections
      .filter(c => nodeMap.has(c.sourceId) && nodeMap.has(c.targetId))
      .map(c => ({
        ...c,
        sourceNode: nodeMap.get(c.sourceId)!,
        targetNode: nodeMap.get(c.targetId)!,
      }));
  }, [connections, nodes]);

  // Connected nodes to the selected node
  const connectedIds = useMemo(() => {
    if (!selectedReceipt) return new Set<string>();
    const set = new Set<string>([selectedReceipt.id]);
    for (const c of connections) {
      if (c.sourceId === selectedReceipt.id) set.add(c.targetId);
      if (c.targetId === selectedReceipt.id) set.add(c.sourceId);
    }
    return set;
  }, [selectedReceipt, connections]);

  return (
    <div className="relative rounded-2xl border border-stone-800 bg-stone-950 overflow-hidden shadow-2xl">
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-800 bg-stone-900/80 px-4 py-3 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-stone-100 flex items-center gap-2">
              <span>LIFE MAP CONSTELLATION</span>
              <span className="text-[10px] font-mono text-stone-400">
                ({nodes.length} mapped nodes • {visibleConnections.length} links)
              </span>
            </h3>
          </div>
        </div>

        {/* View Mode Filters */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
              filterType === 'ALL'
                ? 'bg-amber-400 text-stone-950 font-semibold'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            All Moments
          </button>
          <button
            onClick={() => setFilterType('LATE_NIGHT')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
              filterType === 'LATE_NIGHT'
                ? 'bg-amber-400 text-stone-950 font-semibold'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            Late-Night Window
          </button>
          <button
            onClick={() => setFilterType('MUSIC')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
              filterType === 'MUSIC'
                ? 'bg-amber-400 text-stone-950 font-semibold'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            Music Only
          </button>
          <button
            onClick={() => setFilterType('PURCHASE')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
              filterType === 'PURCHASE'
                ? 'bg-amber-400 text-stone-950 font-semibold'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            Purchases Only
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden bg-radial from-stone-900/60 via-stone-950 to-stone-950 flex items-center justify-center p-2">
        <svg
          viewBox="0 0 850 500"
          className="w-full h-auto max-h-[520px] select-none"
          aria-label="Interactive Life Map Graph"
        >
          {/* Subtle grid background */}
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ambient center atmosphere */}
          <circle cx="425" cy="250" r="230" fill="url(#centerGlow)" />

          {/* Concentric subtle orbit guides */}
          <circle cx="425" cy="250" r="140" fill="none" stroke="#292524" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
          <circle cx="425" cy="250" r="210" fill="none" stroke="#292524" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />

          {/* Connection Lines */}
          {visibleConnections.map(c => {
            const isHighlighted =
              selectedReceipt &&
              (c.sourceId === selectedReceipt.id || c.targetId === selectedReceipt.id);
            const isHovered =
              hoveredNode &&
              (c.sourceId === hoveredNode.id || c.targetId === hoveredNode.id);

            const strokeColor = isHighlighted
              ? '#f59e0b'
              : isHovered
              ? '#38bdf8'
              : c.type === 'CROSS_TYPE'
              ? '#a855f7'
              : '#44403c';

            const strokeOpacity = isHighlighted ? 0.9 : isHovered ? 0.8 : 0.25;
            const strokeWidth = isHighlighted ? 2.5 : isHovered ? 1.8 : 1;

            return (
              <line
                key={c.id}
                x1={c.sourceNode.x}
                y1={c.sourceNode.y}
                x2={c.targetNode.x}
                y2={c.targetNode.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeDasharray={c.type === 'SEQUENCE' ? '2 2' : undefined}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const isSelected = selectedReceipt?.id === node.id;
            const isConnected = connectedIds.has(node.id);
            const isHovered = hoveredNode?.id === node.id;

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => onSelectReceipt(node.receipt)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                tabIndex={0}
                role="button"
                aria-label={`Node: ${node.receipt.title}`}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectReceipt(node.receipt);
                  }
                }}
              >
                {/* Outer focus halo */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 6}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                    className="animate-ping"
                  />
                )}

                {/* Main Node Body */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? node.radius + 4 : isConnected ? node.radius + 2 : node.radius}
                  fill={node.color}
                  filter={isSelected ? 'url(#glow)' : undefined}
                  className="transition-all duration-200"
                />

                {/* Node Center dot */}
                <circle cx={node.x} cy={node.y} r={2.5} fill="#0c0a09" />

                {/* Text Label on hover or selected */}
                {(isSelected || isHovered) && (
                  <g>
                    <rect
                      x={node.x - 75}
                      y={node.y - 32}
                      width="150"
                      height="20"
                      rx="4"
                      fill="#1c1917"
                      stroke="#44403c"
                      strokeWidth="1"
                    />
                    <text
                      x={node.x}
                      y={node.y - 18}
                      textAnchor="middle"
                      fill="#fafaf9"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {node.receipt.title.slice(0, 20)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover / Selection tooltip overlay */}
        {hoveredNode && !selectedReceipt && (
          <div className="absolute bottom-4 left-4 z-20 rounded-lg border border-stone-800 bg-stone-900/90 p-3 shadow-xl backdrop-blur-md max-w-xs text-xs pointer-events-none animate-fadeIn">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] uppercase mb-1">
              <span>{hoveredNode.receipt.type}</span>
              <span>•</span>
              <span>{formatTimeOnly(hoveredNode.receipt.timestamp)} UTC</span>
            </div>
            <p className="font-semibold text-stone-100">{hoveredNode.receipt.title}</p>
            {hoveredNode.receipt.subtitle && (
              <p className="text-stone-400 text-[11px] mt-0.5">{hoveredNode.receipt.subtitle}</p>
            )}
            <p className="text-[10px] text-stone-400 mt-2 font-mono">
              Click node to connect the dots
            </p>
          </div>
        )}
      </div>

      {/* Legend & Instructions Footer */}
      <div className="flex flex-wrap items-center justify-between border-t border-stone-800 bg-stone-900/70 px-4 py-2.5 text-[11px] text-stone-400 gap-3">
        <div className="flex items-center gap-4">
          <span className="font-mono text-stone-400 uppercase text-[10px]">LEGEND:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            <span>Music</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>Purchase</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-pink-500" />
            <span>Late-Night Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-stone-400 font-mono text-[10px]">
          <span>Click any node to reveal connected moments</span>
        </div>
      </div>
    </div>
  );
};
