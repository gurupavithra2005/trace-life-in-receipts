import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Database, Shield } from 'lucide-react';
import { DataQualityReport } from '../../types/receipt';

interface DataQualityBannerProps {
  report: DataQualityReport;
  errorNotice?: string | null;
}

export const DataQualityBanner: React.FC<DataQualityBannerProps> = ({ report, errorNotice }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full bg-stone-900/60 border-b border-stone-800/80 text-xs text-stone-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="font-mono text-emerald-300">
                {report.validReceipts.toLocaleString()}
              </strong>{' '}
              moments interpreted successfully.
            </span>
            {errorNotice && (
              <span className="text-amber-400 ml-2 hidden md:inline">
                ({errorNotice})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-stone-400">
              <Shield className="h-3.5 w-3.5 text-stone-400" />
              <span className="text-[11px]">
                {report.sensitiveFieldsRemoved.toLocaleString()} sensitive fields scrubbed
              </span>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-[11px] text-amber-400/90 hover:text-amber-300 font-medium focus:outline-none"
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? 'Hide Diagnostics' : 'Data Quality'}</span>
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-400 text-[11px] pb-1 animate-fadeIn">
            <div>
              <span className="block text-stone-400">Total Raw Records</span>
              <span className="font-mono font-medium text-stone-200">
                {report.totalRawRecords.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-stone-400">Skipped / Malformed</span>
              <span className="font-mono font-medium text-stone-200">
                {report.skippedMalformedRecords.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-stone-400">Duplicates Filtered</span>
              <span className="font-mono font-medium text-stone-200">
                {report.duplicateRecordsFiltered.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-stone-400">Active Sources</span>
              <span className="font-mono font-medium text-stone-200">
                {report.sources.length} datasets
              </span>
            </div>

            <div className="col-span-2 sm:col-span-4 mt-2 bg-stone-950/60 p-2.5 rounded border border-stone-800">
              <span className="block text-stone-400 mb-1 font-semibold uppercase text-[10px] tracking-wider">
                Loaded Data Sources:
              </span>
              <div className="flex flex-wrap gap-2">
                {report.sources.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-mono text-[10px]"
                  >
                    <Database className="h-2.5 w-2.5 text-amber-400" />
                    {s.sourceName} ({s.count.toLocaleString()} moments)
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
