/**
 * Safe number parsing and formatting utilities
 */

export function safeNumber(input: unknown, fallback: number = 0): number {
  if (typeof input === 'number') return isNaN(input) ? fallback : input;
  if (!input) return fallback;
  const cleaned = String(input).replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString();
}

export function formatMsToHoursAndMinutes(ms: number): { hours: number; minutes: number; display: string } {
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  let display = '';
  if (hours > 0) {
    display = `${hours.toLocaleString()}h ${minutes}m`;
  } else {
    display = `${minutes}m`;
  }
  return { hours, minutes, display };
}

export function formatCurrency(amount: number, currency: string = '₹'): string {
  const formatted = amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
  return `${currency} ${formatted}`;
}
