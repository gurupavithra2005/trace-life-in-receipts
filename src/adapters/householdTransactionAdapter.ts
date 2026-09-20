/**
 * Household Transaction Adapter for "Daily Household Transactions.csv"
 * "WHERE THE MOMENTS COST SOMETHING"
 * Normalizes spending into 'PURCHASE' receipts with safe category breakdown.
 */

import { Receipt } from '../types/receipt';
import { HouseholdRawRecord, HouseholdTransactionStats } from '../types/transactions';
import { safeParseDate } from '../utils/dates';
import { safeNumber } from '../utils/numbers';
import { createStableReceiptId, normalizeCategory } from '../utils/sanitize';

export function normalizeHouseholdTransactions(
  records: (HouseholdRawRecord | Record<string, unknown>)[],
  sourceName = 'Daily Household Transactions.csv'
): { receipts: Receipt[]; stats: HouseholdTransactionStats; malformedCount: number } {
  const receipts: Receipt[] = [];
  let malformedCount = 0;

  let totalExpenseAmount = 0;
  let totalIncomeAmount = 0;
  let expenseCount = 0;
  let incomeCount = 0;
  let primaryCurrency = '₹';

  const categoryMap = new Map<string, { amount: number; count: number }>();
  const subcategoryMap = new Map<string, number>();
  const monthExpenseMap = new Map<string, number>();

  let foodTotal = 0;
  let foodCount = 0;
  let transportTotal = 0;
  let transportCount = 0;

  for (let i = 0; i < records.length; i++) {
    const raw = records[i] as Record<string, any>;
    const dateStr = String(raw.Date || raw.date || raw.timestamp || '').trim();
    const amountVal = safeNumber(raw.Amount || raw.amount, 0);
    const categoryRaw = String(raw.Category || raw.category || 'General').trim();
    const subcategoryRaw = String(raw.Subcategory || raw.subcategory || '').trim();
    const noteRaw = String(raw.Note || raw.note || '').trim();
    const incExpRaw = String(raw['Income/Expense'] || raw.incomeExpense || raw.Type || 'Expense').trim().toLowerCase();
    const isIncome = incExpRaw.includes('income');
    const currency = String(raw.Currency || raw.currency || '₹').trim();
    if (currency) primaryCurrency = currency;

    if (!dateStr || amountVal <= 0) {
      malformedCount++;
      continue;
    }

    const parsedDate = safeParseDate(dateStr);
    if (!parsedDate) {
      malformedCount++;
      continue;
    }

    const isoTimestamp = parsedDate.toISOString();
    const normCategory = normalizeCategory(categoryRaw);
    const cleanSubcategory = subcategoryRaw || normCategory;
    const mode = String(raw.Mode || raw.mode || 'Electronic').trim();

    const stableId = createStableReceiptId('hh', `${dateStr}_${normCategory}_${amountVal}_${i}`);

    const safeTitle = noteRaw || `${normCategory} Purchase`;
    const safeSubtitle = `${cleanSubcategory} (${mode})`;

    const receipt: Receipt = {
      id: stableId,
      type: 'PURCHASE',
      timestamp: isoTimestamp,
      title: safeTitle,
      subtitle: safeSubtitle,
      description: `Recorded payment of ${primaryCurrency} ${amountVal.toLocaleString()} for ${normCategory.toLowerCase()}.`,
      source: sourceName,
      amount: amountVal,
      currency: primaryCurrency,
      tags: ['Transaction', normCategory, isIncome ? 'Income' : 'Expense'],
      metadata: {
        category: normCategory,
        rawCategory: categoryRaw,
        subcategory: cleanSubcategory,
        paymentMode: mode,
        isIncome,
        amount: amountVal,
        currency: primaryCurrency,
      },
    };

    receipts.push(receipt);

    // Aggregate stats
    if (isIncome) {
      totalIncomeAmount += amountVal;
      incomeCount++;
    } else {
      totalExpenseAmount += amountVal;
      expenseCount++;

      // Category breakdown
      const catExisting = categoryMap.get(normCategory) || { amount: 0, count: 0 };
      catExisting.amount += amountVal;
      catExisting.count++;
      categoryMap.set(normCategory, catExisting);

      // Subcategory breakdown
      subcategoryMap.set(cleanSubcategory, (subcategoryMap.get(cleanSubcategory) || 0) + 1);

      // Food & Transport activity
      const lowerCat = normCategory.toLowerCase() + ' ' + cleanSubcategory.toLowerCase();
      if (lowerCat.includes('food') || lowerCat.includes('grocery') || lowerCat.includes('dining') || lowerCat.includes('cafe')) {
        foodTotal += amountVal;
        foodCount++;
      }
      if (lowerCat.includes('transport') || lowerCat.includes('fuel') || lowerCat.includes('travel') || lowerCat.includes('commute')) {
        transportTotal += amountVal;
        transportCount++;
      }

      // Monthly Trend
      const monthKey = isoTimestamp.slice(0, 7);
      monthExpenseMap.set(monthKey, (monthExpenseMap.get(monthKey) || 0) + amountVal);
    }
  }

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, data]) => ({ category, amount: data.amount, count: data.count }))
    .sort((a, b) => b.amount - a.amount);

  const topSubcategories = Array.from(subcategoryMap.entries())
    .map(([subcategory, count]) => ({ subcategory, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const recurringCategories = topCategories
    .filter(c => c.count >= 3)
    .map(c => c.category)
    .slice(0, 5);

  const monthlyExpenseTrend = Array.from(monthExpenseMap.entries())
    .map(([monthKey, amount]) => ({ monthKey, amount: Math.round(amount) }))
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  const stats: HouseholdTransactionStats = {
    totalTransactions: receipts.length,
    totalExpenseAmount,
    totalIncomeAmount,
    currency: primaryCurrency,
    expenseCount,
    incomeCount,
    topCategories,
    topSubcategories,
    foodSpending: { amount: foodTotal, count: foodCount },
    transportSpending: { amount: transportTotal, count: transportCount },
    recurringCategories,
    monthlyExpenseTrend,
  };

  return { receipts, stats, malformedCount };
}
