import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CategoryDonutChart, MonthlyExpenseChart } from './FinanceCharts';
import { CategoryIcon, PaymentMethodBadge } from './CategoryIcon';

interface DashboardProps {
  onOpenAddModal: (type?: 'expense' | 'income') => void;
  onNavigateTab: (tab: string) => void;
  onOpenAiInsights: () => void;
  onOpenImportModal: () => void;
  onEditTransaction: (tx: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenAddModal,
  onNavigateTab,
  onOpenAiInsights,
  onOpenImportModal,
  onEditTransaction,
}) => {
  const {
    totalIncome,
    totalExpenses,
    remainingBalance,
    savings,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    currency,
    budgetUtilizationList,
    filteredTransactions,
    activeAlerts,
    wallets,
    deleteTransaction,
  } = useFinance();

  const recentTransactions = filteredTransactions.slice(0, 5);

  const getMonthDisplayName = (m: string) => {
    if (m === 'all') return 'All Time';
    try {
      const [year, month] = m.split('-');
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    } catch {
      return m;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Month Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Financial Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
              Live Tracker
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time cash flow, category budgets, and liquidity monitoring
          </p>
        </div>

        {/* Month Selector & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <Calendar size={15} className="ml-2 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 py-1.5 px-2 focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {getMonthDisplayName(m)}
                </option>
              ))}
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                All Months
              </option>
            </select>
          </div>

          <button
            onClick={() => onOpenAddModal('expense')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Add Expense</span>
          </button>

          <button
            onClick={onOpenAiInsights}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Sparkles size={15} />
            <span>AI Insights</span>
          </button>
        </div>
      </div>

      {/* Active Alerts Banner if any budget is near limit or exceeded */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.slice(0, 2).map((alert, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-medium ${
                alert.type === 'danger'
                  ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200'
                  : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <AlertTriangle size={18} className="flex-shrink-0" />
                <span>{alert.message}</span>
              </div>
              <button
                onClick={() => onNavigateTab('budgets')}
                className="underline font-bold hover:opacity-80 flex-shrink-0 cursor-pointer"
              >
                Manage Budget
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards (Matching user specification: Total Income, Total Expenses, Remaining Balance, Savings) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Income */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Income
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalIncome, currency)}
            </div>
            <div className="mt-2 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={14} className="mr-0.5" />
              <span>+12.4% vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Expenses
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(totalExpenses, currency)}
            </div>
            <div className="mt-2 flex items-center text-xs font-semibold text-rose-600 dark:text-rose-400">
              <ArrowDownRight size={14} className="mr-0.5" />
              <span>50.0% of total income</span>
            </div>
          </div>
        </div>

        {/* Card 3: Remaining Balance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Remaining Balance
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(remainingBalance, currency)}
            </div>
            <div className="mt-2 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>50.0% retained liquidity</span>
            </div>
          </div>
        </div>

        {/* Card 4: Savings */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Savings
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(savings, currency)}
            </div>
            <div className="mt-2 flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400">
              <span>{totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0}% savings rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Expense Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <MonthlyExpenseChart />
        </div>

        {/* Category-wise Expense Breakdown (Donut) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Category Breakdown
            </h2>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center cursor-pointer"
            >
              Analytics <ChevronRight size={14} />
            </button>
          </div>
          <CategoryDonutChart />
        </div>
      </div>

      {/* Row 3: Budget Utilization & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Budget Utilization Progress */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Budget Utilization
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track category limits and exhaustion alerts
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('budgets')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center cursor-pointer"
              >
                All Budgets <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {budgetUtilizationList.slice(0, 4).map((item) => {
                const isOver = item.percentage >= 100;
                const isWarning = item.percentage >= 80 && !isOver;

                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon category={item.category} size={15} />
                        <span className="text-slate-800 dark:text-slate-200">{item.category}</span>
                        {isOver && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold">
                            Exceeded!
                          </span>
                        )}
                        {isWarning && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
                            Warning
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-900 dark:text-white">
                          {formatCurrency(item.spent, currency)}
                        </strong>{' '}
                        / {formatCurrency(item.budget, currency)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Overall Monthly Budget Usage</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {Math.round((totalExpenses / Math.max(1, budgetUtilizationList.reduce((acc, b) => acc + b.budget, 0))) * 100)}%
            </span>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Transactions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest income and expense entries
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center cursor-pointer"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">No transactions found for this period</p>
              <button
                onClick={() => onOpenAddModal('expense')}
                className="mt-3 text-xs font-bold text-emerald-600 hover:underline"
              >
                + Add your first expense
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition"
                >
                  <div className="flex items-center space-x-3">
                    <CategoryIcon category={tx.category} size={18} withBackground />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{tx.description}</span>
                        {tx.isRecurring && (
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded">
                            Recurring
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-400">
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <PaymentMethodBadge method={tx.paymentMethod} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span
                        className={`text-sm font-extrabold ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="text-xs px-2 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        title="Edit"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Multiple Wallets Strip */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Wallet size={18} className="text-emerald-500" />
              <span>Accounts & Wallets</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Balances across cash, bank, credit card, and UPI
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('wallets')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center cursor-pointer"
          >
            Manage Wallets <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wallets.map((w) => (
            <div
              key={w.id}
              className={`p-4 rounded-xl bg-gradient-to-br ${w.color} text-white shadow-md relative overflow-hidden`}
            >
              <div className="flex items-center justify-between text-xs opacity-90">
                <span className="font-semibold uppercase tracking-wider">{w.type}</span>
                <span className="font-mono text-[11px]">{w.accountNumber || 'Primary'}</span>
              </div>
              <div className="mt-3">
                <span className="text-xs opacity-80 block truncate">{w.name}</span>
                <span className="text-xl font-extrabold tracking-tight">
                  {formatCurrency(w.balance, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
