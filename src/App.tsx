import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ExportModal } from './components/common/ExportModal';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { SkeletonLoader } from './components/common/SkeletonLoader';
import { SkipToContent } from './components/common/SkipToContent';
import { DataImportModal } from './components/layout/DataImportModal';
import { DataQualityBanner } from './components/layout/DataQualityBanner';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { ReceiptDetailModal } from './components/layout/ReceiptDetailModal';
import { NavigationTabs, TabId } from './components/navigation/NavigationTabs';
import { useFilters } from './hooks/useFilters';
import { useReceipts } from './hooks/useReceipts';
import { useStoryEngine } from './hooks/useStoryEngine';
import { StorageService } from './services/storageService';
import { Receipt } from './types/receipt';

// Code-split dynamic page loading with React.lazy
const Overview = lazy(() => import('./pages/Overview').then(m => ({ default: m.Overview })));
const LifeMap = lazy(() => import('./pages/LifeMap').then(m => ({ default: m.LifeMap })));
const Timeline = lazy(() => import('./pages/Timeline').then(m => ({ default: m.Timeline })));
const Receipts = lazy(() => import('./pages/Receipts').then(m => ({ default: m.Receipts })));
const Connections = lazy(() => import('./pages/Connections').then(m => ({ default: m.Connections })));
const Patterns = lazy(() => import('./pages/Patterns').then(m => ({ default: m.Patterns })));
const Chapters = lazy(() => import('./pages/Chapters').then(m => ({ default: m.Chapters })));
const Insights = lazy(() => import('./pages/Insights').then(m => ({ default: m.Insights })));

export default function App() {
  // Tab State with Local Persistence
  const [activeTab, setActiveTabState] = useState<TabId>(() => {
    const saved = StorageService.getLastTab();
    return (saved as TabId) || 'overview';
  });

  const setActiveTab = (tab: TabId) => {
    setActiveTabState(tab);
    StorageService.setLastTab(tab);
  };

  // Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState<Receipt | null>(null);

  // Map state
  const [selectedReceiptOnMap, setSelectedReceiptOnMap] = useState<Receipt | null>(null);

  // Data Loading & Normalization Hook
  const {
    receipts,
    dataQuality,
    errorNotice,
    isLoading,
    spotifyStats,
    spotifyYearsData,
    householdStats,
    indiaStats,
    index,
    overviewMetrics,
    importUserFile,
    loadDefaultData,
  } = useReceipts();

  // Story & Pattern Engine Hook
  const {
    connections,
    clusters,
    patterns,
    chapters,
    insights,
    narrative,
  } = useStoryEngine(receipts);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when focused inside form inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        setIsImportModalOpen(false);
        setIsShortcutsOpen(false);
        setIsExportModalOpen(false);
        setSelectedReceiptForModal(null);
        return;
      }

      if (e.key === '?' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        if (!selectedReceiptForModal && !isShortcutsOpen && !isImportModalOpen) {
          e.preventDefault();
          setIsExportModalOpen((prev) => !prev);
        }
        return;
      }

      if (e.key === 'i' || e.key === 'I') {
        if (!selectedReceiptForModal && !isShortcutsOpen && !isExportModalOpen) {
          e.preventDefault();
          setIsImportModalOpen((prev) => !prev);
        }
        return;
      }

      const tabMap: Record<string, TabId> = {
        '1': 'overview',
        '2': 'life-map',
        '3': 'timeline',
        '4': 'receipts',
        '5': 'connections',
        '6': 'patterns',
        '7': 'chapters',
        '8': 'insights',
      };

      if (tabMap[e.key]) {
        setActiveTab(tabMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedReceiptForModal, isShortcutsOpen, isExportModalOpen, isImportModalOpen]);

  // Extract 24-hour distribution counts from index
  const hourlyCounts = useMemo(() => {
    const counts = new Array(24).fill(0);
    if (index && index.byHour) {
      for (let h = 0; h < 24; h++) {
        counts[h] = (index.byHour.get(h) || []).length;
      }
      return counts;
    }
    receipts.forEach(r => {
      const d = new Date(r.timestamp);
      if (!isNaN(d.getTime())) {
        counts[d.getUTCHours()]++;
      }
    });
    return counts;
  }, [receipts, index]);

  // Filter Engine Hook
  const {
    filters,
    updateFilters,
    resetFilters,
    filteredReceipts,
    availableYears,
    availableCategories,
  } = useFilters(receipts);

  // Derive connected receipts for modal inspection
  const connectedReceiptsForModal = useMemo(() => {
    if (!selectedReceiptForModal) return [];
    const id = selectedReceiptForModal.id;
    const direct = connections.filter(c => c.sourceId === id || c.targetId === id);
    const receiptMap = new Map(receipts.map(r => [r.id, r]));

    return direct
      .map(c => {
        const otherId = c.sourceId === id ? c.targetId : c.sourceId;
        const otherReceipt = receiptMap.get(otherId);
        if (!otherReceipt) return null;
        return {
          receipt: otherReceipt,
          reason: c.reason,
          strength: c.strength,
        };
      })
      .filter((item): item is { receipt: Receipt; reason: string; strength: number } => !!item);
  }, [selectedReceiptForModal, connections, receipts]);

  // Featured Hero Cluster for the Overview
  const featuredCluster = clusters.length > 0 ? clusters[0] : null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
        {/* WCAG Accessible Skip Link */}
        <SkipToContent />

        {/* Header */}
        <Header
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab as TabId)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onOpenExport={() => setIsExportModalOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          validReceiptCount={receipts.length}
        />

        {/* Data Quality Non-Blocking Diagnostic Banner */}
        <DataQualityBanner report={dataQuality} errorNotice={errorNotice} />

        {/* Sticky Tab Navigation */}
        <NavigationTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          receiptsCount={receipts.length}
          connectionsCount={connections.length}
          patternsCount={patterns.length}
          chaptersCount={chapters.length}
        />

        {/* Main Content Area */}
        <main
          id="main-content"
          role="main"
          tabIndex={-1}
          aria-label="TRACE Life Story Workspace"
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none"
        >
          <Suspense fallback={<SkeletonLoader />}>
            {activeTab === 'overview' && (
              <Overview
                receipts={receipts}
                overviewMetrics={overviewMetrics}
                hourlyCounts={hourlyCounts}
                featuredCluster={featuredCluster}
                connectionsCount={connections.length}
                patternsCount={patterns.length}
                chaptersCount={chapters.length}
                onSelectReceipt={setSelectedReceiptForModal}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'life-map' && (
              <LifeMap
                receipts={receipts}
                connections={connections}
                clusters={clusters}
                onSelectReceipt={r => {
                  setSelectedReceiptOnMap(r);
                  setSelectedReceiptForModal(r);
                }}
                selectedReceipt={selectedReceiptOnMap}
                onClearSelection={() => setSelectedReceiptOnMap(null)}
              />
            )}

            {activeTab === 'timeline' && (
              <Timeline
                receipts={receipts}
                onSelectReceipt={setSelectedReceiptForModal}
                selectedReceiptId={selectedReceiptForModal?.id}
              />
            )}

            {activeTab === 'receipts' && (
              <Receipts
                receipts={receipts}
                filteredReceipts={filteredReceipts}
                filters={filters}
                onUpdateFilters={updateFilters}
                onResetFilters={resetFilters}
                availableYears={availableYears}
                availableCategories={availableCategories}
                onSelectReceipt={setSelectedReceiptForModal}
                selectedReceiptId={selectedReceiptForModal?.id}
              />
            )}

            {activeTab === 'connections' && (
              <Connections
                connections={connections}
                clusters={clusters}
                receipts={receipts}
                onSelectReceipt={setSelectedReceiptForModal}
              />
            )}

            {activeTab === 'patterns' && (
              <Patterns
                patterns={patterns}
                receipts={receipts}
                onSelectReceipt={setSelectedReceiptForModal}
              />
            )}

            {activeTab === 'chapters' && (
              <Chapters
                chapters={chapters}
                receipts={receipts}
                onSelectReceipt={setSelectedReceiptForModal}
              />
            )}

            {activeTab === 'insights' && (
              <Insights
                insights={insights}
                narrative={narrative}
                spotifyStats={spotifyStats}
                spotifyYearsData={spotifyYearsData}
                householdStats={householdStats}
                indiaStats={indiaStats}
                receipts={receipts}
                onSelectReceipt={setSelectedReceiptForModal}
              />
            )}
          </Suspense>
        </main>

        {/* Modals */}
        <DataImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportFile={importUserFile}
          onResetToDefault={loadDefaultData}
        />

        <ReceiptDetailModal
          receipt={selectedReceiptForModal}
          onClose={() => setSelectedReceiptForModal(null)}
          connectedReceipts={connectedReceiptsForModal}
          onSelectConnectedReceipt={setSelectedReceiptForModal}
        />

        <ShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          receipts={receipts}
          chapters={chapters}
          patterns={patterns}
          clusters={clusters}
        />

        {/* Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
