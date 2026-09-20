import React from 'react';
import { Compass, FileText, Quote, Sparkles } from 'lucide-react';
import { WhatDoesItMeanNarrative } from '../../types/insights';

interface WhatDoesItMeanProps {
  narrative: WhatDoesItMeanNarrative;
}

export const WhatDoesItMean: React.FC<WhatDoesItMeanProps> = ({ narrative }) => {
  return (
    <div className="relative rounded-2xl border border-stone-800 bg-stone-900/90 p-6 sm:p-10 shadow-2xl space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-stone-800 pb-5">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
          <Sparkles className="h-4 w-4" />
          <span>SYNTHESIS & REFLECTION</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 tracking-tight">
          {narrative.headline}
        </h3>
      </div>

      {/* Narrative Prose */}
      <div className="space-y-4 text-sm sm:text-base text-stone-300 leading-relaxed font-sans">
        {narrative.narrativeParagraphs.map((para, i) => (
          <p key={i} className="text-stone-300 leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {/* Key Discoveries Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-800">
        {narrative.keyDiscoveries.map((d, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-stone-800 bg-stone-950/70 p-4 space-y-2"
          >
            <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase block">
              0{idx + 1} • {d.evidenceStat}
            </span>
            <h4 className="text-sm font-semibold text-stone-200">
              {d.title}
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              {d.description}
            </p>
          </div>
        ))}
      </div>

      {/* Concluding Thought Callout */}
      <div className="rounded-xl bg-stone-950 border border-amber-500/30 p-5 sm:p-6 flex items-start gap-4">
        <Quote className="h-6 w-6 text-amber-400 shrink-0 mt-1" />
        <div>
          <span className="font-mono text-[10px] tracking-wider uppercase text-amber-400 font-bold block mb-1">
            CORE DISCOVERY
          </span>
          <p className="text-stone-200 font-serif text-sm sm:text-base italic leading-relaxed">
            "{narrative.concludingThought}"
          </p>
        </div>
      </div>
    </div>
  );
};
