import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Edit3,
  Trash2,
  X,
  Check,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { CATEGORIES_META } from '../data/mockData';

export const BudgetManager: React.FC = () => {
  const {
    budgets,
    budgetUtilizationList,
    updateBudget,
    addBudget,
    deleteBudget,
    currency,
    totalExpenses,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingLimit, setEditingLimit] = useState<string>('');

  // New budget form state
  const [newCategory, setNewCategory] = useState('Groceries');
  const [newLimit, setNewLimit] = useState('');

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpentInBudgets = budgetUtilizationList.reduce((acc, b) => acc + b.spent, 0);
  const overallPercentage = totalBudgeted > 0 ? Math.round((totalSpentInBudgets / totalBudgeted) * 100) : 0;

  const handleStartEdit = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setEditingLimit(currentLimit.toString());
  };

  const handleSaveEdit = (category: string) => {
    const parsed = parseFloat(editingLimit);
    if (!isNaN(parsed) && parsed > 0) {
      updateBudget(category, parsed);
    }
    setEditingCategory(null);
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newLimit);
    if (!parsed || parsed <= 0) return;

    addBudget({
      category: newCategory,
      limit: parsed,
      color: CATEGORIES_META[newCategory]?.color || '#3b82f6',
    });
    setNewLimit('');
    setIsAddModalOpen(false);
  };

  // Categories available for new budget (excluding those already budgeted)
  const existingCategories = new Set(budgets.map((b) => b.category));
  const availableToAdd = Object.keys(CATEGORIES_META).filter(
    (c) => CATEGORIES_META[c].type === 'expense' && !existingCategories.has(c)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Budget Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set spending guardrails, monitor category depletion, and prevent overdrafts
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Set New Budget</span>
        </button>
      </div>

      {/* High-level Budget Utilization Metric Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-2xl shadow-lg border border-slate-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Total Budget Allocated
            </span>
            <div className="text-3xl font-extrabold mt-1 tracking-tight">
              {formatCurrency(totalBudgeted, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active across {budgets.length} expense categories
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Total Budget Spent
            </span>
            <div className="text-3xl font-extrabold mt-1 tracking-tight text-emerald-400">
              {formatCurrency(totalSpentInBudgets, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Remaining capacity: {formatCurrency(Math.max(0, totalBudgeted - totalSpentInBudgets), currency)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Overall Utilization</span>
              <span className={overallPercentage >= 90 ? 'text-rose-400' : 'text-emerald-400'}>
                {overallPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercentage >= 100
                    ? 'bg-rose-500'
                    : overallPercentage >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgetUtilizationList.map((item) => {
          const isOver = item.percentage >= 100;
          const isWarning = item.percentage >= 80 && !isOver;
          const isEditing = editingCategory === item.category;

          return (
            <div
              key={item.category}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-sm relative flex flex-col justify-between ${
                isOver
                  ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20'
                  : isWarning
                  ? 'border-amber-300 dark:border-amber-900/60 ring-1 ring-amber-500/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Top Category Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <CategoryIcon category={item.category} size={18} withBackground />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {item.category}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Monthly Allowance
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div>
                    {isOver ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                        <AlertOctagon size={12} />
                        <span>Over Budget!</span>
                      </span>
                    ) : isWarning ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                        <AlertTriangle size={12} />
                        <span>Near Limit</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 size={12} />
                        <span>On Track</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Numbers */}
                <div className="my-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Spent</span>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(item.spent, currency)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Limit</span>
                    {isEditing ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={editingLimit}
                          onChange={(e) => setEditingLimit(e.target.value)}
                          className="w-20 px-1.5 py-0.5 text-xs font-bold border border-emerald-500 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(item.category)}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="p-1 bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-1 group/edit">
                        <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                          {formatCurrency(item.budget, currency)}
                        </span>
                        <button
                          onClick={() => handleStartEdit(item.category, item.budget)}
                          className="opacity-0 group-hover/edit:opacity-100 text-slate-400 hover:text-emerald-500 transition p-0.5"
                          title="Adjust Limit"
                        >
                          <Edit3 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mt-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>Utilization</span>
                    <span
                      className={`font-bold ${
                        isOver
                          ? 'text-rose-600 dark:text-rose-400'
                          : isWarning
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </div>
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
              </div>

              {/* Bottom footer & warning notice */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {item.remaining >= 0 ? (
                    <>
                      Left:{' '}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {formatCurrency(item.remaining, currency)}
                      </strong>
                    </>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      Exceeded by {formatCurrency(Math.abs(item.remaining), currency)}
                    </span>
                  )}
                </span>

                <button
                  onClick={() => deleteBudget(item.category)}
                  className="text-slate-400 hover:text-rose-500 transition p-1"
                  title="Remove Budget"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Budget Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Set Category Budget
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Category
                </label>
                {availableToAdd.length > 0 ? (
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                  >
                    {availableToAdd.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="e.g. Subscriptions, Fitness"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Monthly Limit ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 5000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-bold"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
