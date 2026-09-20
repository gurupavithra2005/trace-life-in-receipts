import React, { useState } from 'react';
import { Download, FileCode, FileSpreadsheet, FileText, Check, X, ShieldCheck } from 'lucide-react';
import { ExportService } from '../../services/exportService';
import { LifeChapter } from '../../types/chapters';
import { ConnectedCluster } from '../../types/connections';
import { DetectedPattern } from '../../types/patterns';
import { Receipt } from '../../types/receipt';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipts: Receipt[];
  chapters: LifeChapter[];
  patterns: DetectedPattern[];
  clusters: ConnectedCluster[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  receipts,
  chapters,
  patterns,
  clusters,
}) => {
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportMarkdown = () => {
    const md = ExportService.generateMarkdownStory(receipts, chapters, patterns, clusters);
    ExportService.downloadFile(md, `TRACE_Life_Story_${new Date().toISOString().slice(0, 10)}.md`, 'text/markdown');
    markDownloaded('md');
  };

  const handleExportJSON = () => {
    const json = ExportService.generateJSON(receipts);
    ExportService.downloadFile(json, `TRACE_Receipts_Normalized_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    markDownloaded('json');
  };

  const handleExportCSV = () => {
    const csv = ExportService.generateCSV(receipts);
    ExportService.downloadFile(csv, `TRACE_Receipts_Export_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    markDownloaded('csv');
  };

  const markDownloaded = (format: string) => {
    setDownloadedFormat(format);
    setTimeout(() => setDownloadedFormat(null), 3500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-stone-800 bg-stone-900 p-6 shadow-2xl text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 id="export-dialog-title" className="text-lg font-semibold tracking-tight text-stone-100">
                Export Life Story & Data
              </h2>
              <p className="text-xs text-stone-400">Download your personal story report or raw records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            aria-label="Close export dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content options */}
        <div className="mt-5 space-y-3">
          {/* Markdown Story Report */}
          <button
            onClick={handleExportMarkdown}
            className="w-full flex items-start gap-3.5 p-3.5 rounded-lg border border-stone-800 hover:border-amber-500/50 bg-stone-950/60 hover:bg-stone-950 transition-all text-left group"
          >
            <div className="p-2 rounded-md bg-stone-800 text-amber-400 group-hover:bg-amber-500/20 transition-colors shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-200 group-hover:text-amber-300">
                  Full Story Report (.MD)
                </span>
                {downloadedFormat === 'md' && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
                    <Check className="h-3.5 w-3.5" /> Downloaded
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Formatted Markdown with chapter narrative, behavioral patterns, and metrics.
              </p>
            </div>
          </button>

          {/* JSON Export */}
          <button
            onClick={handleExportJSON}
            className="w-full flex items-start gap-3.5 p-3.5 rounded-lg border border-stone-800 hover:border-amber-500/50 bg-stone-950/60 hover:bg-stone-950 transition-all text-left group"
          >
            <div className="p-2 rounded-md bg-stone-800 text-blue-400 group-hover:bg-blue-500/20 transition-colors shrink-0">
              <FileCode className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-200 group-hover:text-blue-300">
                  Normalized Dataset (.JSON)
                </span>
                {downloadedFormat === 'json' && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
                    <Check className="h-3.5 w-3.5" /> Downloaded
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Structured array of all {receipts.length} sanitized moments for developers.
              </p>
            </div>
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="w-full flex items-start gap-3.5 p-3.5 rounded-lg border border-stone-800 hover:border-amber-500/50 bg-stone-950/60 hover:bg-stone-950 transition-all text-left group"
          >
            <div className="p-2 rounded-md bg-stone-800 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-200 group-hover:text-emerald-300">
                  Tabular Spreadsheet (.CSV)
                </span>
                {downloadedFormat === 'csv' && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
                    <Check className="h-3.5 w-3.5" /> Downloaded
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Compatible with Excel, Google Sheets, or Numbers.
              </p>
            </div>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="mt-5 flex items-center gap-2 p-3 rounded-lg bg-stone-950/80 border border-stone-800/80 text-xs text-stone-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>All files are synthesized in-memory. Zero network requests or telemetry.</span>
        </div>
      </div>
    </div>
  );
};
