import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { AiInsightResponse } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface AiInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiInsightsModal: React.FC<AiInsightsModalProps> = ({ isOpen, onClose }) => {
  const {
    totalIncome,
    totalExpenses,
    savings,
    categorySpendMap,
    budgetUtilizationList,
    filteredTransactions,
    selectedMonth,
    currency,
  } = useFinance();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AiInsightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    const topCategories = Object.entries(categorySpendMap).map(([name, amount]) => ({
      name,
      amount,
    }));

    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalIncome,
          totalExpenses,
          savings,
          topCategories,
          budgetData: budgetUtilizationList,
          recentTransactions: filteredTransactions.slice(0, 10),
          month: selectedMonth,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate insights');
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError('Unable to fetch AI insights at this moment. You can retry anytime.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !data) {
      fetchInsights();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/30 rounded-xl">
              <Sparkles size={20} className="text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">AI Financial Insights</h3>
              <p className="text-xs text-indigo-200">
                Powered by Gemini • Spending patterns & actionable diagnosis
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={fetchInsights}
              disabled={loading}
              className="p-2 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition"
              title="Refresh Analysis"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Analyzing cash flow & budget patterns...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Synthesizing category allocations and evaluating savings rate
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-700 dark:text-rose-300 text-xs text-center space-y-2">
              <p>{error}</p>
              <button
                onClick={fetchInsights}
                className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg text-xs"
              >
                Try Again
              </button>
            </div>
          ) : data ? (
            <div className="space-y-5">
              {/* Score & Summary Card */}
              <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Health Diagnosis
                  </span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {data.summary}
                  </p>
                </div>

                <div className="flex-shrink-0 text-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm min-w-[70px]">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {data.score}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-bold">/ 100</span>
                </div>
              </div>

              {/* Leakage Alert if any */}
              {data.leakageAlert && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start space-x-3 text-xs">
                  <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 dark:text-amber-300">
                      Spending Leak Detected
                    </h4>
                    <p className="text-amber-800 dark:text-amber-200 mt-0.5">
                      {data.leakageAlert}
                    </p>
                  </div>
                </div>
              )}

              {/* Highlights */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span>Key Spending Observations</span>
                </h4>
                <div className="space-y-2">
                  {data.highlights?.map((h, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 font-medium border border-slate-100 dark:border-slate-800"
                    >
                      • {h}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Lightbulb size={14} className="text-amber-500" />
                  <span>Actionable Optimization Tips</span>
                </h4>
                <div className="space-y-2">
                  {data.recommendations?.map((r, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-900 dark:text-emerald-200 font-medium border border-emerald-100 dark:border-emerald-900/40 flex items-start space-x-2"
                    >
                      <span className="font-bold text-emerald-600 flex-shrink-0">{i + 1}.</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
          <span className="text-slate-400">Analysis reflects selected month data</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
