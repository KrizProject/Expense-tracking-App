import React, { useState } from 'react';
import { Sparkles, Clock, X, PlusCircle, Check } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface DailyReminderBannerProps {
  onOpenAddModal: (prefill?: any) => void;
}

export const DailyReminderBanner: React.FC<DailyReminderBannerProps> = ({ onOpenAddModal }) => {
  const { addTransaction, currency } = useFinance();
  const [dismissed, setDismissed] = useState(false);
  const [quickLogged, setQuickLogged] = useState<string | null>(null);

  if (dismissed) return null;

  const quickShortcuts = [
    { label: 'Tea / Coffee', amount: 80, category: 'Food', method: 'UPI' },
    { label: 'Lunch / Snacks', amount: 250, category: 'Food', method: 'UPI' },
    { label: 'Auto / Metro', amount: 120, category: 'Travel', method: 'UPI' },
    { label: 'Daily Groceries', amount: 350, category: 'Groceries', method: 'UPI' },
  ];

  const handleQuickLog = (item: typeof quickShortcuts[0]) => {
    addTransaction({
      amount: item.amount,
      type: 'expense',
      category: item.category,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: item.method as any,
      description: item.label,
    });
    setQuickLogged(item.label);
    setTimeout(() => setQuickLogged(null), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-blue-950/20 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl p-4 shadow-2xs relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-600 text-white flex-shrink-0 shadow-xs">
            <Clock size={16} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Daily Expense Reminder
              </h4>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-200/60 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                Today
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Did you spend on transport, tea, or groceries today? Record now to keep budgets accurate.
            </p>
          </div>
        </div>

        {/* Quick Log Chips */}
        <div className="flex items-center flex-wrap gap-1.5 self-start sm:self-auto">
          {quickShortcuts.map((sc) => (
            <button
              key={sc.label}
              onClick={() => handleQuickLog(sc)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-2xs border border-slate-200/80 dark:border-slate-700 transition flex items-center space-x-1 cursor-pointer"
            >
              <PlusCircle size={12} />
              <span>
                {sc.label} ({currency}{sc.amount})
              </span>
            </button>
          ))}
        </div>
      </div>

      {quickLogged && (
        <div className="absolute top-2 right-12 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1 animate-fade-in">
          <Check size={13} />
          <span>Recorded {quickLogged}!</span>
        </div>
      )}

      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
        title="Dismiss reminder"
      >
        <X size={15} />
      </button>
    </div>
  );
};
