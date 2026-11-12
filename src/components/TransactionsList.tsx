import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  ArrowUpDown,
  FileSpreadsheet,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';
import { Transaction, PaymentMethod } from '../types/finance';
import { CategoryIcon, PaymentMethodBadge } from './CategoryIcon';
import { CATEGORIES_META } from '../data/mockData';

interface TransactionsListProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenImportModal: () => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  onOpenAddModal,
  onEditTransaction,
  onOpenImportModal,
}) => {
  const { transactions, deleteTransaction, currency, selectedMonth, setSelectedMonth, availableMonths } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categoriesList = ['All', ...Object.keys(CATEGORIES_META)];
  const paymentMethodsList = ['All', 'UPI', 'Card', 'Bank', 'Cash', 'Wallet'];

  // Filter and sort transactions
  const filteredList = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = t.description?.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          const matchAmount = t.amount.toString().includes(q);
          const matchMethod = t.paymentMethod.toLowerCase().includes(q);
          if (!matchDesc && !matchCat && !matchAmount && !matchMethod) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && t.category !== selectedCategory) {
          return false;
        }

        // Type filter
        if (selectedType !== 'all' && t.type !== selectedType) {
          return false;
        }

        // Payment method filter
        if (selectedMethod !== 'All' && t.paymentMethod !== selectedMethod) {
          return false;
        }

        // Month filter
        if (selectedMonth !== 'all' && !t.date.startsWith(selectedMonth)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, searchQuery, selectedCategory, selectedType, selectedMethod, selectedMonth, sortBy]);

  // Aggregate stats of filtered transactions
  const { totalFilteredExpense, totalFilteredIncome } = useMemo(() => {
    let exp = 0;
    let inc = 0;
    filteredList.forEach((t) => {
      if (t.type === 'expense') exp += t.amount;
      else if (t.type === 'income') inc += t.amount;
    });
    return { totalFilteredExpense: exp, totalFilteredIncome: inc };
  }, [filteredList]);

  const handleExport = () => {
    exportToCSV(filteredList, `rupeeflow_export_${selectedMonth || 'all'}.csv`);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transactions Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, categorize, filter, edit, and export your personal finance records
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={onOpenImportModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
          >
            <Download size={15} />
            <span>Export to Excel</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Search Input & Month */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by note, description, merchant, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2">
              <Calendar size={15} className="text-slate-400 mr-2" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all">All Months</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 px-2 py-2">
              <ArrowUpDown size={15} className="text-slate-400 mr-1" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Type filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg mr-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                selectedType === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                selectedType === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Filter dropdown */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
            <Tag size={13} className="text-slate-400 mr-1.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              {categoriesList.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method dropdown */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
            <span className="text-slate-400 mr-1.5 font-medium">Method:</span>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              {paymentMethodsList.map((m) => (
                <option key={m} value={m}>
                  {m === 'All' ? 'All Payment Methods' : m}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters button */}
          {(searchQuery || selectedCategory !== 'All' || selectedType !== 'all' || selectedMethod !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedType('all');
                setSelectedMethod('All');
              }}
              className="flex items-center space-x-1 text-slate-400 hover:text-rose-500 font-semibold px-2 py-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtered Summary Strip */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
        <div>
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredList.length}</span> transactions
        </div>
        <div className="flex items-center space-x-4">
          <span>
            Income:{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(totalFilteredIncome, currency)}
            </strong>
          </span>
          <span>
            Spent:{' '}
            <strong className="text-rose-600 dark:text-rose-400">
              -{formatCurrency(totalFilteredExpense, currency)}
            </strong>
          </span>
        </div>
      </div>

      {/* Transactions Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <p className="text-base font-semibold">No transactions match your search or filter</p>
            <p className="text-xs">Try clearing some filters or add a new transaction record.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500"
            >
              <Plus size={14} />
              <span>Add Expense</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {filteredList.map((tx) => (
                  <tr
                    key={tx.id}
                    className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon category={tx.category} size={15} />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {tx.category}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {tx.description}
                      </div>
                      {tx.isRecurring && (
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.2 rounded">
                          Recurring
                        </span>
                      )}
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PaymentMethodBadge method={tx.paymentMethod} />
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-extrabold ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {deleteConfirmId === tx.id ? (
                        <div className="inline-flex items-center space-x-2">
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="px-2 py-1 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-500"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center space-x-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
