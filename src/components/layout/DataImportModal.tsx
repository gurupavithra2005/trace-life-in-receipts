import React, { useRef, useState } from 'react';
import { AlertCircle, Check, Database, FileCode, FileSpreadsheet, FileText, FileUp, Info, ShieldCheck, X } from 'lucide-react';
import { SPOTIFY_DATA_DICTIONARY } from '../../data/dataDictionary';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFile: (file: File) => Promise<void>;
  onResetToDefault: () => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onImportFile,
  onResetToDefault,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'schemas'>('upload');

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setStatusMessage(`Parsing and sanitizing "${file.name}" locally in your browser...`);
    await onImportFile(file);
    setStatusMessage(`Successfully loaded and normalized "${file.name}".`);
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn"
      onKeyDown={e => e.key === 'Escape' && onClose()}
    >
      <div className="relative w-full max-w-2xl rounded-xl border border-stone-800 bg-stone-900 shadow-2xl overflow-hidden text-stone-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4 bg-stone-950/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h2 id="import-modal-title" className="text-sm font-semibold text-stone-100">
                Dataset Management & Import
              </h2>
              <p className="text-xs text-stone-400">
                Processed 100% locally in your browser with automatic sanitization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-800 bg-stone-950/30 px-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2.5 text-xs font-medium border-b-2 mr-6 transition-all ${
              activeTab === 'upload'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-300'
            }`}
          >
            Upload / Drag & Drop
          </button>
          <button
            onClick={() => setActiveTab('schemas')}
            className={`py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'schemas'
                ? 'border-amber-400 text-amber-400 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-300'
            }`}
          >
            Supported Dataset Schemas
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'upload' ? (
            <div className="space-y-5">
              {/* Drag and drop zone */}
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-stone-700/80 bg-stone-950/40 hover:border-stone-600 hover:bg-stone-950/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.json,.xml"
                  className="hidden"
                  onChange={e => handleFiles(e.target.files)}
                />
                <FileUp className="h-10 w-10 text-amber-400/80 mb-3 animate-bounce" />
                <p className="text-sm font-medium text-stone-200 mb-1">
                  Drag and drop your dataset file here, or <span className="text-amber-400 underline">browse</span>
                </p>
                <p className="text-xs text-stone-400">
                  Accepts <code className="font-mono text-stone-300">.csv</code>, <code className="font-mono text-stone-300">.tsv</code>, <code className="font-mono text-stone-300">.json</code>, and <code className="font-mono text-stone-300">.xml</code>
                </p>
                <p className="text-[11px] text-stone-400 mt-2 font-mono">
                  (spotify_history.csv, Daily Household Transactions.csv, Augmented_IndiaTransactMultiFacet2024.*)
                </p>
              </div>

              {statusMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Reset to defaults button */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                <div className="text-xs text-stone-400">
                  <span>Using bundled authentic sample datasets (2013–2024)?</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onResetToDefault();
                    onClose();
                  }}
                  className="rounded-md border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-800 hover:text-stone-100 transition-colors"
                >
                  Reload Default Datasets
                </button>
              </div>

              {/* Privacy badge */}
              <div className="flex items-start gap-2.5 rounded-lg bg-stone-950/60 p-3 border border-stone-800 text-xs text-stone-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-300 block mb-0.5">Privacy & Security Guarantee:</strong>
                  Your files never leave your computer. Parsing, normalization, and pattern discovery occur entirely inside your browser tab memory. Sensitive identifiers (credit card numbers, customer IDs, street addresses, and dates of birth) are automatically stripped at the adapter layer.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="rounded-lg bg-stone-950/60 p-4 border border-stone-800">
                <h3 className="font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  1. Spotify Listening History (spotify_history.csv)
                </h3>
                <p className="text-stone-400 mb-3">
                  Based on the official Spotify Extended Streaming History data dictionary:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                  {Object.entries(SPOTIFY_DATA_DICTIONARY).map(([key, item]) => (
                    <div key={key} className="p-2 rounded bg-stone-900 border border-stone-800/80">
                      <span className="text-amber-300 font-semibold block">{item.field}</span>
                      <span className="text-stone-400 font-sans text-[10px] leading-tight block mt-0.5">
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-stone-950/60 p-4 border border-stone-800">
                <h3 className="font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  2. Daily Household Transactions (Daily Household Transactions.csv)
                </h3>
                <p className="text-stone-400 mb-2">
                  Recognized fields: <code className="text-stone-200">Date, Mode, Category, Subcategory, Note, Amount, Income/Expense, Currency</code>.
                </p>
              </div>

              <div className="rounded-lg bg-stone-950/60 p-4 border border-stone-800">
                <h3 className="font-semibold text-sky-400 mb-2 flex items-center gap-1.5">
                  <FileCode className="h-3.5 w-3.5" />
                  3. India MultiFacet 2024 (.json / .csv / .tsv / .xml)
                </h3>
                <p className="text-stone-400 mb-2">
                  Recognized fields: <code className="text-stone-200">trans_date_trans_time, merchant, category, amt, city, state, is_fraud</code>.
                  Sensitive fields (<code className="text-rose-400 font-mono">cc_num, customer_id, street, dob, first, last</code>) are discarded immediately on intake.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
