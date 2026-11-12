import React, { useState } from 'react';
import {
  RotateCcw,
  Plus,
  Calendar,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  X,
  CreditCard,
  Zap,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CategoryIcon, PaymentMethodBadge } from './CategoryIcon';
import { PaymentMethod } from '../types/finance';

export const RecurringExpenses: React.FC = () => {
  const { recurring, toggleRecurring, addRecurring, deleteRecurring, executeRecurringItem, currency, wallets } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Bills');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');

  const totalMonthlyCommitment = recurring
    .filter((r) => r.active)
    .reduce((acc, r) => acc + (r.frequency === 'monthly' ? r.amount : r.frequency === 'yearly' ? r.amount / 12 : r.amount * 4), 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !title.trim()) return;

    addRecurring({
      title: title.trim(),
      amount: amt,
      category,
      frequency,
      nextDueDate,
      paymentMethod,
      walletId: walletId || undefined,
      active: true,
    });

    setTitle('');
    setAmount('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recurring Expenses & Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track fixed overheads, apartment rent, streaming subscriptions, and utility bills
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Recurring Item</span>
        </button>
      </div>

      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-900/50 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Total Monthly Fixed Overhead
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight text-white">
              {formatCurrency(totalMonthlyCommitment, currency)}
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              Committed outgoings across {recurring.filter((r) => r.active).length} active subscriptions & bills
            </p>
          </div>

          <div className="text-xs text-indigo-200 flex items-center space-x-2">
            <RotateCcw size={16} className="text-indigo-400" />
            <span>Auto-reminders active</span>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recurring.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition shadow-sm flex flex-col justify-between ${
              item.active
                ? 'border-slate-200/80 dark:border-slate-800'
                : 'border-slate-100 dark:border-slate-800/40 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2.5">
                  <CategoryIcon category={item.category} size={18} withBackground />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                      <span className="capitalize">{item.frequency}</span>
                      <span>•</span>
                      <span>Due: {formatDate(item.nextDueDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-slate-900 dark:text-white block">
                    {formatCurrency(item.amount, currency)}
                  </span>
                  <PaymentMethodBadge method={item.paymentMethod} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => executeRecurringItem(item.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 transition flex items-center space-x-1 cursor-pointer"
                title="Record this expense for today"
              >
                <Zap size={13} />
                <span>Quick Record Now</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleRecurring(item.id)}
                  className={`p-1.5 rounded-lg transition ${
                    item.active
                      ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                      : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={item.active ? 'Pause Subscription' : 'Activate Subscription'}
                >
                  {item.active ? <PauseCircle size={17} /> : <PlayCircle size={17} />}
                </button>

                <button
                  onClick={() => deleteRecurring(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Recurring Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add Recurring Expense
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Title / Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WiFi Fiber, Rent, Gym"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 999"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Bills">Bills & Utilities</option>
                    <option value="Housing">Housing / Rent</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Health">Health & Fitness</option>
                    <option value="Education">Education</option>
                    <option value="General">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank">Bank Netbanking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Next Due Date
                </label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
