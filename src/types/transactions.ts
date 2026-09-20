/**
 * Transaction and spending types for Household and India Transact datasets
 * Strictly strips sensitive personal data: cc_num, customer_id, full street, dob, etc.
 */

export interface HouseholdRawRecord {
  Date?: string;
  Mode?: string;
  Category?: string;
  Subcategory?: string;
  Note?: string;
  Amount?: number | string;
  'Income/Expense'?: string;
  Currency?: string;
}

export interface IndiaTransactRawRecord {
  trans_id?: string;
  trans_date_trans_time?: string;
  cc_num?: string | number; // NEVER to be saved or rendered
  merchant?: string;
  category?: string;
  amt?: number | string;
  first?: string; // sensitive
  last?: string; // sensitive
  gender?: string;
  street?: string; // sensitive
  city?: string;
  state?: string;
  lat?: number | string;
  long?: number | string;
  city_pop?: number | string;
  job?: string;
  dob?: string; // sensitive
  merch_lat?: number | string;
  merch_long?: number | string;
  is_fraud?: number | string | boolean;
  customer_id?: string | number; // sensitive
}

export interface HouseholdTransactionStats {
  totalTransactions: number;
  totalExpenseAmount: number;
  totalIncomeAmount: number;
  currency: string;
  expenseCount: number;
  incomeCount: number;
  topCategories: { category: string; amount: number; count: number }[];
  topSubcategories: { subcategory: string; count: number }[];
  foodSpending: { amount: number; count: number };
  transportSpending: { amount: number; count: number };
  recurringCategories: string[];
  monthlyExpenseTrend: { monthKey: string; amount: number }[];
}

export interface IndiaTransactionSafeStats {
  totalTransactions: number;
  totalVolume: number;
  averageAmount: number;
  topCategories: { category: string; count: number; volume: number }[];
  topRegions: { state: string; count: number }[];
  topMerchantTypes: { merchant: string; count: number }[];
  aggregateUnusualActivityCount: number; // Aggregate safe count from is_fraud
  unusualActivityRate: number; // Percentage
  timeOfTransPeakHour: number;
}
