/**
 * Safe, robust date parsing and formatting utilities
 */

export function safeParseDate(input: unknown): Date | null {
  if (!input) return null;
  if (input instanceof Date && !isNaN(input.getTime())) return input;

  const str = String(input).trim();
  if (!str) return null;

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 12;
    const min = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const sec = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
    const parsed = new Date(Date.UTC(year, month, day, hour, min, sec));
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // Handle "YYYY-MM-DD HH:mm:ss" or ISO strings
  const standardIso = str.replace(' ', 'T');
  const d = new Date(standardIso.endsWith('Z') || standardIso.includes('+') ? standardIso : `${standardIso}Z`);
  if (!isNaN(d.getTime())) return d;

  // Fallback to standard Date parse
  const direct = new Date(str);
  if (!isNaN(direct.getTime())) return direct;

  return null;
}

export function formatSafeTimestamp(isoStr: string): string {
  const d = safeParseDate(isoStr);
  if (!d) return 'Unknown Date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(d);
}

export function formatShortDate(isoStr: string): string {
  const d = safeParseDate(isoStr);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

export function formatTimeOnly(isoStr: string): string {
  const d = safeParseDate(isoStr);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(d);
}

export function getYearFromTimestamp(isoStr: string): number | null {
  const d = safeParseDate(isoStr);
  return d ? d.getUTCFullYear() : null;
}

export function getHourFromTimestamp(isoStr: string): number {
  const d = safeParseDate(isoStr);
  return d ? d.getUTCHours() : 0;
}

export function getDayOfWeekFromTimestamp(isoStr: string): string {
  const d = safeParseDate(isoStr);
  if (!d) return 'Unknown';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getUTCDay()];
}

export function isLateNight(hour: number): boolean {
  return hour >= 0 && hour <= 4;
}

export function getTimeOfDayBucket(hour: number): 'Late Night' | 'Morning' | 'Afternoon' | 'Evening' {
  if (hour >= 0 && hour < 5) return 'Late Night';
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  return 'Evening';
}
