/**
 * TRACE Browser Storage Service
 * Handles zero-backend local persistence, bookmarking, and custom configuration
 * with graceful memory fallback in test/node environments and privacy guarantees.
 */

const STORAGE_KEYS = {
  BOOKMARKS: 'trace_bookmarks_v1',
  PREFERENCES: 'trace_prefs_v1',
  CUSTOM_RECEIPTS: 'trace_custom_receipts_v1',
  LAST_TAB: 'trace_last_tab_v1',
} as const;

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  autoPlayAudioStory: boolean;
  timeFormat: '12h' | '24h';
  soundEnabled: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  autoPlayAudioStory: false,
  timeFormat: '24h',
  soundEnabled: false,
};

export class StorageService {
  private static memoryStore = new Map<string, string>();

  private static isLocalStorageAvailable(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      const test = '__trace_storage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private static getItem(key: string): string | null {
    if (this.isLocalStorageAvailable()) {
      return window.localStorage.getItem(key);
    }
    return this.memoryStore.get(key) || null;
  }

  private static setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fallback to memory
      }
    }
    this.memoryStore.set(key, value);
  }

  private static removeItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Fallback
      }
    }
    this.memoryStore.delete(key);
  }

  // --- Bookmarks Management ---
  public static getBookmarks(): string[] {
    try {
      const data = this.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static toggleBookmark(receiptId: string): { bookmarked: boolean; all: string[] } {
    const current = this.getBookmarks();
    const index = current.indexOf(receiptId);
    let updated: string[];
    let bookmarked: boolean;

    if (index >= 0) {
      updated = current.filter(id => id !== receiptId);
      bookmarked = false;
    } else {
      updated = [...current, receiptId];
      bookmarked = true;
    }

    try {
      this.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage error for bookmarks', e);
    }
    return { bookmarked, all: updated };
  }

  public static isBookmarked(receiptId: string): boolean {
    return this.getBookmarks().includes(receiptId);
  }

  // --- Preferences Management ---
  public static getPreferences(): UserPreferences {
    try {
      const raw = this.getItem(STORAGE_KEYS.PREFERENCES);
      return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  public static savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const updated = { ...this.getPreferences(), ...prefs };
    try {
      this.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Unable to persist preferences', e);
    }
    return updated;
  }

  // --- Active Session Tab ---
  public static getLastTab(): string | null {
    return this.getItem(STORAGE_KEYS.LAST_TAB);
  }

  public static setLastTab(tabId: string): void {
    this.setItem(STORAGE_KEYS.LAST_TAB, tabId);
  }

  // --- Clear Storage ---
  public static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(k => this.removeItem(k));
    this.memoryStore.clear();
  }
}
