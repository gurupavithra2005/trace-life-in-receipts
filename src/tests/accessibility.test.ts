import { describe, expect, it } from 'vitest';
import { sanitizeCardNumber, sanitizeEmail, sanitizeName, maskSensitiveString } from '../utils/sanitize';
import { safeParseDate, formatYear, isLateNight } from '../utils/dates';
import { formatCurrency, formatCompactNumber } from '../utils/numbers';

describe('Sanitization, Privacy & Format Standards', () => {
  it('strictly redacts credit cards, account numbers, and emails', () => {
    expect(sanitizeCardNumber('4111222233334444')).toBe('•••• 4444');
    expect(sanitizeCardNumber('1234')).toBe('•••• 1234');
    expect(sanitizeEmail('testuser@gmail.com')).toBe('t••••••r@gmail.com');
    expect(sanitizeName('Johnathan Doe')).toBe('J•••••••••••e');
    expect(maskSensitiveString('9876543210')).toBe('•••• 3210');
  });

  it('safely parses dates without throwing errors on invalid inputs', () => {
    expect(safeParseDate('2023-05-12 14:30:00')).toBeInstanceOf(Date);
    expect(safeParseDate('invalid-date-string')).toBeNull();
    expect(formatYear('2021-08-01')).toBe('2021');
  });

  it('accurately detects late-night hours between 00:00 and 04:00 UTC', () => {
    expect(isLateNight(0)).toBe(true);
    expect(isLateNight(2)).toBe(true);
    expect(isLateNight(4)).toBe(true);
    expect(isLateNight(5)).toBe(false);
    expect(isLateNight(14)).toBe(false);
    expect(isLateNight(20)).toBe(false);
  });

  it('formats currency and compact numbers reliably', () => {
    expect(formatCurrency(120, '$')).toBe('$ 120');
    expect(formatCurrency(500, '₹')).toBe('₹ 500');
    expect(formatCompactNumber(1500)).toBe('1.5k');
    expect(formatCompactNumber(2500000)).toBe('2.5M');
  });
});
