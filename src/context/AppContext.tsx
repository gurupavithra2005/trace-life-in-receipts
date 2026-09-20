/**
 * TRACE Application Context
 * Centralized state provider for global UI states, modals, navigation, and bookmarks.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { TabId } from '../components/navigation/NavigationTabs';
import { StorageService } from '../services/storageService';
import { Receipt } from '../types/receipt';

interface AppContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  selectedReceiptForModal: Receipt | null;
  setSelectedReceiptForModal: (receipt: Receipt | null) => void;
  bookmarkedIds: string[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<TabId>(() => {
    const saved = StorageService.getLastTab();
    return (saved as TabId) || 'overview';
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState<Receipt | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => StorageService.getBookmarks());

  const setActiveTab = (tab: TabId) => {
    setActiveTabState(tab);
    StorageService.setLastTab(tab);
  };

  const toggleBookmark = (id: string) => {
    const { all } = StorageService.toggleBookmark(id);
    setBookmarkedIds([...all]);
  };

  const isBookmarked = (id: string) => bookmarkedIds.includes(id);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isImportModalOpen,
        setIsImportModalOpen,
        isShortcutsOpen,
        setIsShortcutsOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        selectedReceiptForModal,
        setSelectedReceiptForModal,
        bookmarkedIds,
        toggleBookmark,
        isBookmarked,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
