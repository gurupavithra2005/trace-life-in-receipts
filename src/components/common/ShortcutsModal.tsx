import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1 – 8', action: 'Switch Views (Overview, Life Map, Timeline, Receipts, Connections, Patterns, Chapters, Insights)' },
    { key: 'I', action: 'Open Import Data Modal' },
    { key: '?', action: 'Open Keyboard Shortcuts Guide' },
    { key: 'Esc', action: 'Close any open modal' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2 text-stone-900 font-semibold">
            <Keyboard className="w-5 h-5 text-indigo-600" />
            <h2 id="shortcuts-title" className="text-base">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close keyboard shortcuts dialog"
            className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-sm"
            >
              <span className="text-stone-700 font-medium">{s.action}</span>
              <kbd className="px-2.5 py-1 bg-white border border-stone-200 rounded text-xs font-mono font-semibold text-stone-800 shadow-2xs whitespace-nowrap ml-3">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
