/**
 * High-priority security and data sanitization utilities.
 * Ensures zero sensitive personal identifiers, cards, or raw coordinates reach UI.
 */

// Simple deterministic string hash to generate opaque stable IDs
export function createStableReceiptId(prefix: string, seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const positive = Math.abs(hash).toString(36);
  return `rcpt_${prefix}_${positive.padStart(6, '0')}`;
}

/**
 * Mask any sensitive text safely
 */
export function sanitizeDisplayValue(val: unknown, fallback: string = '—'): string {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  if (!str) return fallback;

  // Never leak credit card lookalikes
  if (/\b\d{13,19}\b/.test(str)) {
    return 'Card •••• ' + str.slice(-4);
  }
  return str;
}

/**
 * Clean and generalize merchant names
 */
export function sanitizeMerchantName(rawMerchant: string | undefined): string {
  if (!rawMerchant) return 'Merchant Transaction';
  let cleaned = rawMerchant.trim();
  // Strip "fraud_" prefix if present in the raw synthetic dataset
  if (cleaned.toLowerCase().startsWith('fraud_')) {
    cleaned = cleaned.slice(6);
  }
  // Remove technical prefixes or numbers
  cleaned = cleaned.replace(/^[0-9_\-\s]+/, '');
  // Capitalize neatly
  return cleaned
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ') || 'Merchant Transaction';
}

/**
 * Sanitize categories into clean, human-readable labels
 */
export function normalizeCategory(rawCat: string | undefined): string {
  if (!rawCat) return 'General';
  const c = rawCat.trim().toLowerCase();
  if (c.includes('grocery') || c.includes('food') || c.includes('dining') || c.includes('restaurant')) return 'Food & Dining';
  if (c.includes('shopping') || c.includes('net') || c.includes('pos')) return 'Shopping & Retail';
  if (c.includes('gas') || c.includes('transport') || c.includes('travel')) return 'Travel & Commute';
  if (c.includes('entertainment') || c.includes('movie') || c.includes('music')) return 'Entertainment';
  if (c.includes('health') || c.includes('fitness') || c.includes('medical')) return 'Health & Wellness';
  if (c.includes('bill') || c.includes('utilities') || c.includes('home')) return 'Home & Bills';
  if (c.includes('personal') || c.includes('care')) return 'Personal Care';
  if (c.includes('salary') || c.includes('income')) return 'Income';
  return rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
}

/**
 * Coarse-grain geographic coordinate protection (approximate region only)
 */
export function safeCoarseLocation(city?: string, state?: string): { city?: string; region?: string; safeArea: string } {
  const cleanCity = city && city !== 'null' ? city.trim() : undefined;
  const cleanState = state && state !== 'null' ? state.trim() : undefined;

  let safeArea = 'Unknown Location';
  if (cleanCity && cleanState) {
    safeArea = `${cleanCity}, ${cleanState}`;
  } else if (cleanState) {
    safeArea = cleanState;
  } else if (cleanCity) {
    safeArea = cleanCity;
  }

  return {
    city: cleanCity,
    region: cleanState,
    safeArea,
  };
}

/**
 * Mask raw credit card numbers to keep only last 4 digits
 */
export function sanitizeCardNumber(card: string | undefined): string {
  if (!card) return '••••';
  const clean = String(card).replace(/\s+/g, '');
  if (clean.length <= 4) return `•••• ${clean}`;
  return `•••• ${clean.slice(-4)}`;
}

/**
 * Mask email addresses safely (e.g., testuser@gmail.com -> t••••••r@gmail.com)
 */
export function sanitizeEmail(email: string | undefined): string {
  if (!email) return '••••@••••.com';
  const parts = email.split('@');
  if (parts.length !== 2) return '••••@••••.com';
  const user = parts[0];
  const domain = parts[1];
  if (user.length <= 2) return `${user[0]}•@${domain}`;
  const masked = user[0] + '•'.repeat(Math.max(1, user.length - 2)) + user[user.length - 1];
  return `${masked}@${domain}`;
}

/**
 * Mask personal names safely (e.g., Johnathan Doe -> J•••••••••e)
 */
export function sanitizeName(name: string | undefined): string {
  if (!name) return 'Anonymous';
  const clean = name.trim();
  if (clean.length <= 2) return clean;
  return clean[0] + '•'.repeat(Math.max(1, clean.length - 2)) + clean[clean.length - 1];
}

/**
 * General mask for any sensitive identifier string
 */
export function maskSensitiveString(str: string | undefined): string {
  if (!str) return '••••';
  const s = String(str).trim();
  if (s.length <= 4) return '•••• ' + s;
  return '•••• ' + s.slice(-4);
}

