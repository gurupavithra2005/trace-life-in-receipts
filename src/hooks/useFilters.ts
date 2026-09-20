/**
 * Filter and Search Hook for Receipts
 * Supports debounced query, type filter, year filter, category filter, and sorting.
 */

import { useMemo, useState } from 'react';
import { Receipt, ReceiptType } from '../types/receipt';
import { safeParseDate } from '../utils/dates';

export interface FilterState {
  searchQuery: string;
  selectedType: ReceiptType | 'ALL';
  selectedYear: number | 'ALL';
  selectedCategory: string | 'ALL';
  sortBy: 'NEWEST' | 'OLDEST' | 'HIGHEST_AMOUNT' | 'TITLE';
  lateNightOnly?: boolean;
}

export function useFilters(receipts: Receipt[]) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedType: 'ALL',
    selectedYear: 'ALL',
    selectedCategory: 'ALL',
    sortBy: 'NEWEST',
    lateNightOnly: false,
  });

  // Extract unique available years and categories from current dataset
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const r of receipts) {
      const d = safeParseDate(r.timestamp);
      if (d) years.add(d.getUTCFullYear());
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [receipts]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const r of receipts) {
      const cat = (r.metadata?.category as string) || (r.tags && r.tags[0]);
      if (cat) cats.add(cat);
    }
    return Array.from(cats).sort();
  }, [receipts]);

  // Filter and sort receipts
  const filteredReceipts = useMemo(() => {
    let result = receipts;

    // Type filter
    if (filters.selectedType !== 'ALL') {
      result = result.filter(r => r.type === filters.selectedType);
    }

    // Year filter
    if (filters.selectedYear !== 'ALL') {
      result = result.filter(r => {
        const d = safeParseDate(r.timestamp);
        return d && d.getUTCFullYear() === filters.selectedYear;
      });
    }

    // Category filter
    if (filters.selectedCategory !== 'ALL') {
      result = result.filter(r => {
        const cat = (r.metadata?.category as string) || (r.tags && r.tags[0]);
        return cat === filters.selectedCategory;
      });
    }

    // Late night filter (00:00 - 04:59 UTC)
    if (filters.lateNightOnly) {
      result = result.filter(r => {
        const d = safeParseDate(r.timestamp);
        const h = d ? d.getUTCHours() : 12;
        return h >= 0 && h <= 4;
      });
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter(r => {
        const matchTitle = r.title.toLowerCase().includes(query);
        const matchSubtitle = r.subtitle ? r.subtitle.toLowerCase().includes(query) : false;
        const matchDesc = r.description ? r.description.toLowerCase().includes(query) : false;
        const matchCategory = r.metadata?.category ? String(r.metadata.category).toLowerCase().includes(query) : false;
        const matchArtist = r.metadata?.artist_name ? String(r.metadata.artist_name).toLowerCase().includes(query) : false;
        const matchAlbum = r.metadata?.album_name ? String(r.metadata.album_name).toLowerCase().includes(query) : false;
        const matchDate = r.timestamp.includes(query);
        return matchTitle || matchSubtitle || matchDesc || matchCategory || matchArtist || matchAlbum || matchDate;
      });
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (filters.sortBy === 'NEWEST') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (filters.sortBy === 'OLDEST') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (filters.sortBy === 'HIGHEST_AMOUNT') {
        return (b.amount || 0) - (a.amount || 0);
      }
      if (filters.sortBy === 'TITLE') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [receipts, filters]);

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedType: 'ALL',
      selectedYear: 'ALL',
      selectedCategory: 'ALL',
      sortBy: 'NEWEST',
      lateNightOnly: false,
    });
  };

  return {
    filters,
    setFilters,
    updateFilters,
    filteredReceipts,
    availableYears,
    availableCategories,
    resetFilters,
  };
}
