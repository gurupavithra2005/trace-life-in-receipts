import React from 'react';
import { BookOpen, Calendar, Sparkles } from 'lucide-react';
import { ChapterCard } from '../components/stories/ChapterCard';
import { LifeChapter } from '../types/chapters';
import { Receipt } from '../types/receipt';

interface ChaptersProps {
  chapters: LifeChapter[];
  receipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
}

export const Chapters: React.FC<ChaptersProps> = ({
  chapters,
  receipts,
  onSelectReceipt,
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-stone-800 pb-5">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-1">
          <BookOpen className="h-4 w-4" />
          <span>AUTOBIOGRAPHICAL SYNTHESIS</span>
        </div>
        <h1 className="font-mono text-2xl sm:text-3xl font-black text-stone-100 uppercase tracking-tight">
          LIFE CHAPTERS
        </h1>
        <p className="text-stone-400 text-xs sm:text-sm mt-1 max-w-3xl font-sans">
          A vertical cinematic journey through your digital history. Distinct life epochs partitioned by shifting soundscapes, commerce rhythms, and life milestones.
        </p>
      </div>

      {/* Chapters Vertical Feed */}
      <div className="space-y-8">
        {chapters.map(chapter => (
          <ChapterCard
            key={chapter.id}
            chapter={chapter}
            allReceipts={receipts}
            onSelectReceipt={onSelectReceipt}
          />
        ))}
      </div>
    </div>
  );
};
