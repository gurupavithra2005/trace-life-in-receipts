import React from 'react';
import { Database, FileUp, Keyboard, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenImportModal: () => void;
  onOpenShortcuts?: () => void;
  validReceiptCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenImportModal,
  onOpenShortcuts,
  validReceiptCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('overview')}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
            aria-label="Return to TRACE Overview"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 border border-stone-700/60 shadow-inner group-hover:border-amber-500/60 transition-colors">
              <span className="font-mono text-base font-bold tracking-tighter text-amber-400">T</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-semibold tracking-wider text-stone-100 group-hover:text-amber-300 transition-colors">
                  TRACE
                </span>
                <span className="rounded border border-stone-800 bg-stone-900/80 px-1.5 py-0.5 text-[10px] font-mono text-stone-400">
                  v1.0 • LOCAL
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block tracking-wide">
                Your life leaves patterns.
              </p>
            </div>
          </button>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Data counter badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-stone-800 bg-stone-900/60 px-3 py-1 text-xs text-stone-300"
            title="Local browser-parsed verified moments"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono font-medium text-stone-200">{validReceiptCount.toLocaleString()}</span>
            <span className="text-stone-400">moments</span>
          </div>

          {/* Quick dataset import / load button */}
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 rounded-md border border-stone-700/70 bg-stone-900/90 px-3 py-1.5 text-xs font-medium text-stone-200 hover:border-amber-500/50 hover:bg-stone-800/80 hover:text-amber-300 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            aria-label="Manage or upload datasets"
          >
            <FileUp className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden xs:inline">Datasets</span>
          </button>

          {/* Keyboard shortcuts cheatsheet trigger */}
          {onOpenShortcuts && (
            <button
              onClick={onOpenShortcuts}
              className="flex items-center gap-1 rounded-md border border-stone-800 bg-stone-900/80 px-2.5 py-1.5 text-xs font-medium text-stone-300 hover:text-stone-100 hover:border-stone-700 transition-all"
              title="Keyboard Shortcuts (Press ?)"
              aria-label="View keyboard shortcuts"
            >
              <Keyboard className="h-3.5 w-3.5 text-stone-400" />
              <kbd className="hidden sm:inline font-mono text-[10px] text-stone-400 bg-stone-800 px-1 rounded">?</kbd>
            </button>
          )}

          {/* Hero Story Jump button */}
          <button
            onClick={() => onSelectTab('overview')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm shadow-amber-500/20'
                : 'bg-stone-900 border border-stone-800 text-stone-300 hover:text-stone-100 hover:border-stone-700'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Story</span>
          </button>
        </div>
      </div>
    </header>
  );
};
