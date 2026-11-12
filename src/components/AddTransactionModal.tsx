import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Calendar,
  Wallet as WalletIcon,
  Check,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Tag,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType, PaymentMethod } from '../types/finance';
import { CATEGORIES_META } from '../data/mockData';
import { CategoryIcon } from './CategoryIcon';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
  defaultType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  editTransaction,
  defaultType = 'expense',
}) => {
  const { addTransaction, updateTransaction, wallets, currency } = useFinance();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [walletId, setWalletId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSavedAnimation, setIsSavedAnimation] = useState<boolean>(false);

  // Initialize or reset when editing
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setCategory(editTransaction.category);
      setDate(editTransaction.date);
      setPaymentMethod(editTransaction.paymentMethod);
      setWalletId(editTransaction.walletId || '');
      setDescription(editTransaction.description || '');
      setIsRecurring(Boolean(editTransaction.isRecurring));
    } else {
      setType(defaultType);
      setAmount('');
      setCategory(defaultType === 'income' ? 'Salary' : 'Food');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('UPI');
      setWalletId(wallets[0]?.id || '');
      setDescription('');
      setIsRecurring(false);
    }
    setError('');
    setIsSavedAnimation(false);
  }, [editTransaction, isOpen, defaultType, wallets]);

  if (!isOpen) return null;

  // Filter categories by type
  const availableCategories = Object.keys(CATEGORIES_META).filter((cat) => {
    const meta = CATEGORIES_META[cat];
    if (type === 'income') return meta.type === 'income';
    return meta.type === 'expense';
  });

  const handleQuickAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a short description');
      return;
    }

    if (editTransaction) {
      updateTransaction(editTransaction.id, {
        amount: parsedAmount,
        type,
        category,
        date,
        paymentMethod,
        walletId: walletId || undefined,
        description: description.trim(),
        isRecurring,
      });
    } else {
      addTransaction({
        amount: parsedAmount,
        type,
        category,
        date,
        paymentMethod,
        walletId: walletId || undefined,
        description: description.trim(),
        isRecurring,
      });
    }

    setIsSavedAnimation(true);
    setTimeout(() => {
      setIsSavedAnimation(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`p-2 rounded-xl ${
                type === 'income'
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
              }`}
            >
              {type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editTransaction ? 'Edit Transaction' : type === 'income' ? 'Record Income' : 'Add Expense'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {type === 'income' ? 'Add salary, freelance, or credits' : 'Track your spending in one tap'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Transaction Type Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (category === 'Salary' || category === 'Freelance' || category === 'Investment') {
                  setCategory('Food');
                }
              }}
              className={`py-2 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TrendingDown size={16} />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salary');
              }}
              className={`py-2 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition ${
                type === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TrendingUp size={16} />
              <span>Income</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Amount
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-2xl font-bold text-slate-400">
                {currency}
              </div>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className="w-full pl-12 pr-4 py-3.5 text-2xl font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                autoFocus
              />
            </div>

            {/* Quick Denomination Chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 text-xs mr-1 font-medium">Quick add:</span>
              {[100, 200, 500, 1000, 2000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition"
                >
                  +{currency}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
              {availableCategories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium transition border ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CategoryIcon category={cat} size={18} className="mb-1" />
                    <span className="truncate w-full text-center">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Description / Notes
            </label>
            <input
              type="text"
              required
              placeholder={type === 'income' ? 'e.g. Salary, Client payment' : 'e.g. Groceries at supermarket, Dinner with friends'}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center">
                <Calendar size={13} className="mr-1" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center">
                <WalletIcon size={13} className="mr-1" /> Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Card">Card (Credit / Debit)</option>
                <option value="Bank">Bank Netbanking</option>
                <option value="Cash">Cash</option>
                <option value="Wallet">Digital Wallet</option>
              </select>
            </div>
          </div>

          {/* Account/Wallet Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Wallet / Account
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Default Account</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({currency}{w.balance.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Recurring option toggle */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurringCheck"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="isRecurringCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Mark as recurring (repeats monthly)
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavedAnimation}
              className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all flex items-center space-x-2 ${
                isSavedAnimation
                  ? 'bg-emerald-600 scale-95'
                  : type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 active:scale-95'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20 active:scale-95'
              }`}
            >
              {isSavedAnimation ? (
                <>
                  <Check size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>{editTransaction ? 'Update Transaction' : 'Save Transaction'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
