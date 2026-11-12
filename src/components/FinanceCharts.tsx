import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { CATEGORIES_META } from '../data/mockData';
import { CategoryIcon } from './CategoryIcon';
import { TrendingUp, PieChart as PieIcon, BarChart2 } from 'lucide-react';

export const CategoryDonutChart: React.FC = () => {
  const { categorySpendMap, totalExpenses, currency } = useFinance();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const categories = Object.entries(categorySpendMap)
    .map(([cat, amount]) => ({
      name: cat,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      color: CATEGORIES_META[cat]?.color || '#64748b',
    }))
    .sort((a, b) => b.amount - a.amount);

  if (categories.length === 0 || totalExpenses === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <PieIcon size={40} className="mb-2 stroke-1 opacity-50" />
        <p className="text-sm">No expenses recorded for this month</p>
      </div>
    );
  }

  // Calculate SVG stroke dashes for donut chart
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
      {/* SVG Donut */}
      <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="18"
            fill="transparent"
          />
          {categories.map((cat) => {
            const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += cat.percentage;
            const isHovered = hoveredCategory === cat.name;

            return (
              <circle
                key={cat.name}
                cx="80"
                cy="80"
                r={radius}
                stroke={cat.color}
                strokeWidth={isHovered ? '22' : '18'}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredCategory(cat.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            );
          })}
        </svg>

        {/* Center Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {hoveredCategory || 'Total Spend'}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {hoveredCategory
              ? formatCurrency(categorySpendMap[hoveredCategory] || 0, currency)
              : formatCurrency(totalExpenses, currency)}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {hoveredCategory
              ? `${Math.round(((categorySpendMap[hoveredCategory] || 0) / (totalExpenses || 1)) * 100)}% of total`
              : `${categories.length} categories`}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="w-full space-y-2 max-h-56 overflow-y-auto pr-1">
        {categories.map((cat) => {
          const isHovered = hoveredCategory === cat.name;
          return (
            <div
              key={cat.name}
              onMouseEnter={() => setHoveredCategory(cat.name)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer ${
                isHovered
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(cat.amount, currency)}
                </span>
                <span className="text-[11px] text-slate-400 w-10 text-right font-medium">
                  {Math.round(cat.percentage)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MonthlyExpenseChart: React.FC = () => {
  const { filteredTransactions, currency } = useFinance();
  const [hoveredBar, setHoveredBar] = useState<{ label: string; amount: number; count: number } | null>(null);

  // Group expenses by week or 5-day intervals
  const daysInPeriod = [
    { label: 'Day 1-5', start: 1, end: 5 },
    { label: 'Day 6-10', start: 6, end: 10 },
    { label: 'Day 11-15', start: 11, end: 15 },
    { label: 'Day 16-20', start: 16, end: 20 },
    { label: 'Day 21-25', start: 21, end: 25 },
    { label: 'Day 26-31', start: 26, end: 31 },
  ];

  const intervals = daysInPeriod.map((period) => {
    let total = 0;
    let count = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'expense' && t.date) {
        const day = parseInt(t.date.split('-')[2], 10);
        if (day >= period.start && day <= period.end) {
          total += t.amount;
          count++;
        }
      }
    });
    return { ...period, amount: total, count };
  });

  const maxAmount = Math.max(...intervals.map((i) => i.amount), 5000);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BarChart2 size={18} className="text-emerald-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Spending Cadence (Across Month)
          </span>
        </div>
        {hoveredBar && (
          <div className="text-xs px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 font-medium">
            {hoveredBar.label}: <span className="font-bold">{formatCurrency(hoveredBar.amount, currency)}</span> ({hoveredBar.count} spends)
          </div>
        )}
      </div>

      <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
        {intervals.map((item) => {
          const heightPercent = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
          const isHighest = item.amount === maxAmount && item.amount > 0;

          return (
            <div
              key={item.label}
              className="flex-1 flex flex-col items-center group cursor-pointer relative"
              onMouseEnter={() => setHoveredBar(item)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Value on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 bg-slate-900 text-white text-[10px] rounded shadow whitespace-nowrap z-10 font-bold">
                {formatCurrency(item.amount, currency)}
              </div>

              {/* Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-t-lg h-36 flex items-end justify-center p-0.5">
                <div
                  style={{ height: `${Math.max(6, heightPercent)}%` }}
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    isHighest
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                      : 'bg-gradient-to-t from-emerald-500/70 to-emerald-400/80 group-hover:from-emerald-600 group-hover:to-teal-400'
                  }`}
                />
              </div>

              {/* Label */}
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
