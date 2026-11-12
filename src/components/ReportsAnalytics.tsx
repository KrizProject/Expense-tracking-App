import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Percent,
  Clock,
  Award,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { HISTORICAL_MONTHS, CATEGORIES_META } from '../data/mockData';
import { CategoryIcon, PaymentMethodBadge } from './CategoryIcon';

export const ReportsAnalytics: React.FC<{ onOpenAiInsights: () => void }> = ({ onOpenAiInsights }) => {
  const {
    totalIncome,
    totalExpenses,
    savings,
    savingsPercentage,
    averageDailySpend,
    highestCategory,
    categorySpendMap,
    filteredTransactions,
    currency,
  } = useFinance();

  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('6m');

  // Month-over-month comparison based on HISTORICAL_MONTHS
  const lastMonth = HISTORICAL_MONTHS[HISTORICAL_MONTHS.length - 2];
  const currentMonthData = HISTORICAL_MONTHS[HISTORICAL_MONTHS.length - 1];

  const momExpenseDelta = lastMonth
    ? Math.round(((totalExpenses - lastMonth.expenses) / lastMonth.expenses) * 100)
    : 0;

  const momIncomeDelta = lastMonth
    ? Math.round(((totalIncome - lastMonth.income) / lastMonth.income) * 100)
    : 0;

  // 50/30/20 Financial Rule Estimation
  // Needs: Housing, Bills, Groceries, Health
  // Wants: Food (dining), Shopping, Entertainment, Travel
  // Savings: Savings & Investments
  let needsSpend = 0;
  let wantsSpend = 0;

  Object.entries(categorySpendMap).forEach(([cat, amt]) => {
    if (['Housing', 'Bills', 'Groceries', 'Health', 'Education'].includes(cat)) {
      needsSpend += amt;
    } else {
      wantsSpend += amt;
    }
  });

  const needsPercent = totalIncome > 0 ? Math.round((needsSpend / totalIncome) * 100) : 0;
  const wantsPercent = totalIncome > 0 ? Math.round((wantsSpend / totalIncome) * 100) : 0;

  // Payment Method Breakdown
  const methodMap: Record<string, number> = {};
  filteredTransactions.forEach((t) => {
    if (t.type === 'expense') {
      methodMap[t.paymentMethod] = (methodMap[t.paymentMethod] || 0) + t.amount;
    }
  });

  const maxHistoricalVal = Math.max(
    ...HISTORICAL_MONTHS.map((m) => Math.max(m.income, m.expenses))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historical comparisons, month-over-month trajectories, and spending efficiency
          </p>
        </div>

        <button
          onClick={onOpenAiInsights}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Sparkles size={16} />
          <span>Generate AI Spending Diagnosis</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Highest Spending Category */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Highest Spending Category</span>
            <Award size={18} className="text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white truncate">
              {highestCategory?.name || 'N/A'}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{highestCategory ? formatCurrency(highestCategory.amount, currency) : '₹0'}</span>
              <span className="text-rose-500 font-bold">{highestCategory?.percentage || 0}% of expenses</span>
            </div>
          </div>
        </div>

        {/* Average Daily Spending */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Average Daily Spend</span>
            <Clock size={18} className="text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(averageDailySpend, currency)}
              <span className="text-xs font-normal text-slate-400"> / day</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Paced across active 30-day billing cycle
            </div>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Savings Percentage</span>
            <Percent size={18} className="text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {savingsPercentage}%
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Target: &gt; 20% of net incoming cashflow
            </div>
          </div>
        </div>

        {/* Month-over-Month Delta */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>MoM Spending Delta</span>
            <BarChart2 size={18} className="text-purple-500" />
          </div>
          <div className="mt-2">
            <div
              className={`text-2xl font-extrabold flex items-center ${
                momExpenseDelta <= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {momExpenseDelta <= 0 ? <ArrowDownRight size={22} /> : <ArrowUpRight size={22} />}
              <span>{Math.abs(momExpenseDelta)}%</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {momExpenseDelta <= 0 ? 'Decreased spend vs last month' : 'Increased spend vs last month'}
            </div>
          </div>
        </div>
      </div>

      {/* Report 1: Monthly Income vs Expenses Comparison Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BarChart2 size={18} className="text-indigo-500" />
              <span>Monthly Income vs Expenses Trend</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-month cash surplus comparison
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-slate-700 dark:text-slate-300">Income</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
              <span className="text-slate-700 dark:text-slate-300">Expenses</span>
            </div>
          </div>
        </div>

        {/* Dual Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-4 pt-8 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
          {HISTORICAL_MONTHS.map((item) => {
            const incHeight = maxHistoricalVal > 0 ? (item.income / maxHistoricalVal) * 100 : 0;
            const expHeight = maxHistoricalVal > 0 ? (item.expenses / maxHistoricalVal) * 100 : 0;

            return (
              <div key={item.month} className="flex-1 flex flex-col items-center group relative">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 px-2 py-1 bg-slate-900 text-white text-[10px] rounded shadow z-10 whitespace-nowrap text-center font-bold">
                  <div>Inc: {formatCurrency(item.income, currency)}</div>
                  <div>Exp: {formatCurrency(item.expenses, currency)}</div>
                </div>

                {/* Bars Pair */}
                <div className="w-full flex items-end justify-center space-x-1.5 h-48">
                  {/* Income Bar */}
                  <div className="w-1/2 max-w-[24px] bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end">
                    <div
                      style={{ height: `${incHeight}%` }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 rounded-t-md transition-all duration-500"
                    />
                  </div>
                  {/* Expense Bar */}
                  <div className="w-1/2 max-w-[24px] bg-slate-100 dark:bg-slate-800 rounded-t-md h-full flex items-end">
                    <div
                      style={{ height: `${expHeight}%` }}
                      className="w-full bg-rose-500 hover:bg-rose-400 rounded-t-md transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Month label */}
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row: 50/30/20 Rule Breakdown & Payment Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 50 / 30 / 20 Rule Analysis */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span>50 / 30 / 20 Financial Health Model</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Classic financial guideline: 50% Needs, 30% Wants, 20% Savings
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Needs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">
                  Needs (Housing, Bills, Groceries, Health)
                </span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {formatCurrency(needsSpend, currency)} ({needsPercent}% vs 50% target)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (needsPercent / 50) * 100)}%` }}
                  className={`h-full rounded-full ${needsPercent <= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                />
              </div>
            </div>

            {/* Wants */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">
                  Wants (Dining, Shopping, Entertainment, Travel)
                </span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {formatCurrency(wantsSpend, currency)} ({wantsPercent}% vs 30% target)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (wantsPercent / 30) * 100)}%` }}
                  className={`h-full rounded-full ${wantsPercent <= 30 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                />
              </div>
            </div>

            {/* Savings */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">
                  Savings & Investments (SIPs, Deposits)
                </span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {formatCurrency(savings, currency)} ({savingsPercentage}% vs 20% target)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (savingsPercentage / 20) * 100)}%` }}
                  className={`h-full rounded-full ${savingsPercentage >= 20 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Payment Method Breakdown
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Where your money exits from
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(methodMap).map(([method, amt]) => {
              const pct = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <PaymentMethodBadge method={method} />
                    <span className="text-slate-900 dark:text-white font-bold">
                      {formatCurrency(amt, currency)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-slate-700 dark:bg-slate-300 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
