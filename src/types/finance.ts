export type TransactionType = 'expense' | 'income' | 'transfer';

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank' | 'Wallet';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  description: string;
  walletId?: string;
  toWalletId?: string;
  isRecurring?: boolean;
  notes?: string;
}

export interface Budget {
  category: string;
  limit: number;
  icon?: string;
  color?: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'upi' | 'card';
  balance: number;
  accountNumber?: string;
  color: string;
  icon: string;
}

export interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string;
  paymentMethod: PaymentMethod;
  walletId?: string;
  active: boolean;
}

export interface CategoryMeta {
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

export interface AiInsightResponse {
  summary: string;
  score: number;
  highlights: string[];
  leakageAlert: string | null;
  recommendations: string[];
}
