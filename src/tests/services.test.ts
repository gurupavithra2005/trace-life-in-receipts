import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/storageService';
import { ExportService } from '../services/exportService';
import { AnalyticsService } from '../services/analyticsService';
import { ReceiptService } from '../services/receiptService';
import { Receipt } from '../types/receipt';

describe('StorageService', () => {
  beforeEach(() => {
    StorageService.clearAllData();
  });

  it('should toggle and retrieve bookmarks', () => {
    expect(StorageService.getBookmarks()).toEqual([]);
    expect(StorageService.isBookmarked('rcpt-123')).toBe(false);

    const res1 = StorageService.toggleBookmark('rcpt-123');
    expect(res1.bookmarked).toBe(true);
    expect(StorageService.isBookmarked('rcpt-123')).toBe(true);
    expect(StorageService.getBookmarks()).toContain('rcpt-123');

    const res2 = StorageService.toggleBookmark('rcpt-123');
    expect(res2.bookmarked).toBe(false);
    expect(StorageService.isBookmarked('rcpt-123')).toBe(false);
  });

  it('should save and retrieve preferences', () => {
    const defaultPrefs = StorageService.getPreferences();
    expect(defaultPrefs.theme).toBe('dark');

    StorageService.savePreferences({ timeFormat: '12h' });
    const updated = StorageService.getPreferences();
    expect(updated.timeFormat).toBe('12h');
  });

  it('should remember last active tab', () => {
    StorageService.setLastTab('timeline');
    expect(StorageService.getLastTab()).toBe('timeline');
  });
});

describe('ExportService', () => {
  const sampleReceipts: Receipt[] = [
    {
      id: 'test-1',
      source: 'spotify',
      type: 'MUSIC',
      timestamp: '2024-05-10T14:30:00Z',
      title: 'Midnight City',
      subtitle: 'M83',
    },
    {
      id: 'test-2',
      source: 'household',
      type: 'PURCHASE',
      timestamp: '2024-05-10T15:00:00Z',
      title: 'Espresso Bar',
      subtitle: 'Dining',
      amount: 4.5,
      currency: 'USD',
    },
  ];

  it('should generate valid JSON string', () => {
    const json = ExportService.generateJSON(sampleReceipts);
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].title).toBe('Midnight City');
  });

  it('should generate valid CSV format with header', () => {
    const csv = ExportService.generateCSV(sampleReceipts);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('id,timestamp,type,source,title,subtitle,amount,currency,city');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('Midnight City');
    expect(lines[2]).toContain('Espresso Bar');
  });

  it('should generate structured Markdown report', () => {
    const md = ExportService.generateMarkdownStory(sampleReceipts, [], [], []);
    expect(md).toContain('# 🧾 TRACE — Your Life, In Receipts: Story Report');
    expect(md).toContain('Total Tracked Moments');
    expect(md).toContain('Listening Traces:');
    expect(md).toContain('Transactional Traces:');
  });
});

describe('AnalyticsService', () => {
  const receipts: Receipt[] = [
    {
      id: 'r1',
      source: 'spotify',
      type: 'MUSIC',
      timestamp: '2024-01-01T10:00:00Z',
      title: 'Song A',
    },
    {
      id: 'r2',
      source: 'household',
      type: 'PURCHASE',
      timestamp: '2024-01-02T12:00:00Z',
      title: 'Lunch',
      amount: 25,
      currency: 'USD',
    },
    {
      id: 'r3',
      source: 'household',
      type: 'PURCHASE',
      timestamp: '2024-01-05T18:00:00Z',
      title: 'Groceries',
      amount: 75,
      currency: 'USD',
    },
  ];

  it('should calculate accurate metrics and category breakdowns', () => {
    const summary = AnalyticsService.computeSummary(receipts);
    expect(summary.totalReceipts).toBe(3);
    expect(summary.timespanDays).toBeGreaterThan(0);
    expect(summary.diversityIndex).toBeGreaterThanOrEqual(0);
    expect(summary.categoryBreakdown.length).toBeGreaterThan(0);
  });
});

describe('ReceiptService', () => {
  it('should load default datasets with valid indices and overview metrics', () => {
    const data = ReceiptService.loadDefaultDatasets();
    expect(data.receipts.length).toBeGreaterThan(40);
    expect(data.dataQuality.validReceipts).toBe(data.receipts.length);
    expect(data.index.sortedByTimestamp.length).toBe(data.receipts.length);
    expect(data.overviewMetrics.totalReceipts).toBe(data.receipts.length);
  });
});
