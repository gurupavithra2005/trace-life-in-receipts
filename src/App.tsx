import React, { useMemo, useState } from 'react';
import { DataImportModal } from './components/layout/DataImportModal';
import { DataQualityBanner } from './components/layout/DataQualityBanner';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { ReceiptDetailModal } from './components/layout/ReceiptDetailModal';
import { NavigationTabs, TabId } from './components/navigation/NavigationTabs';
import { useFilters } from './hooks/useFilters';
import { useReceipts } from './hooks/useReceipts';
import { useStoryEngine } from './hooks/useStoryEngine';
import { Chapters } from './pages/Chapters';
import { Connections } from './pages/Connections';
import { Insights } from './pages/Insights';
import { LifeMap } from './pages/LifeMap';
import { Overview } from './pages/Overview';
import { Patterns } from './pages/Patterns';
import { Receipts } from './pages/Receipts';
import { Timeline } from './pages/Timeline';
import { Receipt } from './types/receipt';

export default function App() {
  // Tab State
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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

  // Extract 24-hour distribution counts from index
  const hourlyCounts = useMemo(() => {
    const counts = new Array(24).fill(0);
    if (index && index.byHour) {
      for (let h = 0; h < 24; h++) {
        counts[h] = (index.byHour.get(h) || []).length;
      }
    }
    return counts;
  }, [index]);

  // Filters Hook
  const {
    filters,
    updateFilters,
    resetFilters,
    filteredReceipts,
    availableYears,
    availableCategories,
  } = useFilters(receipts);

  // Derive connected receipts for the modal inspection
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
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab as TabId)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
