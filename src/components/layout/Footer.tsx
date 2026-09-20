import React from 'react';
import { ShieldCheck, Cpu, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-stone-800/80 bg-stone-950/80 py-10 px-4 sm:px-6 lg:px-8 text-stone-400">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-stone-800/60">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-base font-bold text-stone-200">TRACE</span>
              <span className="text-xs text-amber-400 font-mono tracking-wider">YOUR LIFE, IN RECEIPTS 🧾</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              An interactive digital-life story experience. Every song, purchase, place and tiny moment becomes part of a bigger story.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-stone-200 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Privacy & Security Architecture</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              TRACE analyzes the supplied datasets locally in your browser. Sensitive source fields are filtered before they reach the story interface.
              Zero credentials, zero card numbers, and zero private identifiers are stored or rendered.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-stone-200 text-xs font-semibold uppercase tracking-wider mb-3">
              <Cpu className="h-4 w-4 text-amber-400" />
              <span>Frontend-Only Execution</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              This project is frontend-only. No backend or external database is required. All pattern detection, narrative synthesis, and connection engines execute deterministically in the client runtime.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© 2024 TRACE — Your life leaves patterns.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Spotify CSV</span>
            <span>•</span>
            <span>Household Transactions</span>
            <span>•</span>
            <span>India MultiFacet (JSON/CSV/TSV/XML)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
