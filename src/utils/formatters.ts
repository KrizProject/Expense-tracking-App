import { Transaction } from '../types/finance';

/**
 * Format amount to Indian Rupee (or chosen symbol) with Indian numbering format (e.g., 45,000 or 1,25,000)
 */
export function formatCurrency(amount: number, symbol = '₹'): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  
  // Format with en-IN locale for Indian numbering standard (Lakhs/Crores)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(absVal);

  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Format date string (YYYY-MM-DD) into readable label
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(date);
}

/**
 * Download transactions as Excel-compatible CSV file
 */
export function exportToCSV(transactions: Transaction[], filename = 'rupeeflow_transactions.csv') {
  const headers = ['Date', 'Type', 'Category', 'Description', 'Payment Method', 'Amount (INR)', 'ID'];
  
  const rows = transactions.map((t) => [
    t.date,
    t.type.toUpperCase(),
    `"${t.category.replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.paymentMethod,
    t.type === 'expense' ? `-${t.amount}` : `${t.amount}`,
    t.id,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parse uploaded CSV text into transactions
 */
export function parseCSVTransactions(csvText: string): Partial<Transaction>[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const dateIdx = headers.findIndex((h) => h.includes('date'));
  const descIdx = headers.findIndex((h) => h.includes('desc') || h.includes('particulars') || h.includes('note') || h.includes('memo'));
  const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('inr') || h.includes('debit') || h.includes('price'));
  const catIdx = headers.findIndex((h) => h.includes('cat'));
  const typeIdx = headers.findIndex((h) => h.includes('type'));
  const methodIdx = headers.findIndex((h) => h.includes('method') || h.includes('mode') || h.includes('payment'));

  const parsed: Partial<Transaction>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Basic regex split respecting quoted strings
    const cols = rawLine.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || rawLine.split(',');
    const cleanCols = cols.map((c) => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

    const rawDate = dateIdx >= 0 ? cleanCols[dateIdx] : new Date().toISOString().slice(0, 10);
    const rawDesc = descIdx >= 0 ? cleanCols[descIdx] : 'Imported expense';
    let rawAmount = amountIdx >= 0 ? parseFloat(cleanCols[amountIdx].replace(/[^\d.-]/g, '')) : 0;
    
    if (isNaN(rawAmount) || rawAmount === 0) continue;

    let type: 'expense' | 'income' = rawAmount < 0 ? 'expense' : 'expense';
    if (typeIdx >= 0 && cleanCols[typeIdx]) {
      const t = cleanCols[typeIdx].toLowerCase();
      if (t.includes('income') || t.includes('credit')) type = 'income';
      else type = 'expense';
    } else if (rawAmount > 0 && descIdx >= 0 && /salary|dividend|interest|credit|refund/i.test(rawDesc)) {
      type = 'income';
    }

    const absAmount = Math.abs(rawAmount);
    const category = catIdx >= 0 && cleanCols[catIdx] ? cleanCols[catIdx] : guessCategory(rawDesc);
    const paymentMethod = methodIdx >= 0 && cleanCols[methodIdx] ? (cleanCols[methodIdx] as any) : 'UPI';

    parsed.push({
      id: `import_${Date.now()}_${i}`,
      date: formatParsedDate(rawDate),
      description: rawDesc,
      amount: absAmount,
      type,
      category,
      paymentMethod: ['Cash', 'UPI', 'Card', 'Bank', 'Wallet'].includes(paymentMethod) ? paymentMethod : 'UPI',
    });
  }

  return parsed;
}

function guessCategory(desc: string): string {
  const d = desc.toLowerCase();
  if (/swiggy|zomato|starbucks|mcdonald|food|dinner|lunch|cafe|restaurant|tea/i.test(d)) return 'Food';
  if (/amazon|flipkart|myntra|zara|h&m|clothing|shoes|shopping/i.test(d)) return 'Shopping';
  if (/uber|ola|metro|rapido|fuel|petrol|diesel|flight|irctc|train|travel/i.test(d)) return 'Travel';
  if (/electricity|water|wifi|broadband|recharge|jio|airtel|bill|bescom/i.test(d)) return 'Bills';
  if (/blinkit|zepto|instamart|bigbasket|supermarket|grocery|milk/i.test(d)) return 'Groceries';
  if (/netflix|spotify|prime|hotstar|cinema|pvr|movie|game|entertainment/i.test(d)) return 'Entertainment';
  if (/pharmacy|hospital|apollo|doctor|medicine|health|gym|cult/i.test(d)) return 'Health';
  if (/rent|maintenance|housing|landlord/i.test(d)) return 'Housing';
  if (/salary|payroll|stipend|freelance|client/i.test(d)) return 'Salary';
  if (/sip|zerodha|groww|mutual fund|stock|dividend|gold/i.test(d)) return 'Investment';
  return 'General';
}

function formatParsedDate(raw: string): string {
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch {
    // fallback
  }
  return new Date().toISOString().slice(0, 10);
}
