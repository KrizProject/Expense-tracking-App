import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  X,
  Check,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { parseCSVTransactions, formatCurrency } from '../utils/formatters';
import { Transaction } from '../types/finance';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_CSV = `Date,Description,Amount,Category,PaymentMethod
2026-11-09,Swiggy Gourmet Order,420,Food,UPI
2026-11-08,Uber Ride to Indiranagar,240,Travel,UPI
2026-11-07,Blinkit Fresh Dairy,310,Groceries,UPI
2026-11-06,Amazon Kindle Book,199,Shopping,Card
2026-11-05,Apollo Pharmacy Vitamins,550,Health,Card
2026-11-04,Starbucks Cold Brew & Croissant,380,Food,UPI
2026-11-03,Fuel Station Shell,1200,Travel,Card`;

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importTransactions, currency } = useFinance();

  const [csvContent, setCsvContent] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Partial<Transaction>[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setCsvContent(text);
    setError(null);
    if (!text.trim()) {
      setParsedPreview([]);
      return;
    }
    try {
      const parsed = parseCSVTransactions(text);
      setParsedPreview(parsed);
      if (parsed.length === 0) {
        setError('No valid transactions found in CSV. Please verify column headers (Date, Description, Amount).');
      }
    } catch (err: any) {
      setError('Error parsing CSV content: ' + err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleTextChange(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    handleTextChange(SAMPLE_CSV);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;
    const count = importTransactions(parsedPreview);
    setSuccessCount(count);
    setTimeout(() => {
      setSuccessCount(null);
      setCsvContent('');
      setParsedPreview([]);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Import Bank & Card Statements
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload CSV or paste bank exports from HDFC, ICICI, SBI, or credit cards
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* File input & Sample loader */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer transition border border-dashed border-slate-300 dark:border-slate-700">
              <Upload size={14} />
              <span>Choose CSV File</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleLoadSample}
              className="flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Load Sample Indian Statement</span>
            </button>
          </div>

          {/* Text Area for raw CSV */}
          <div>
            <textarea
              rows={5}
              placeholder="Paste raw CSV text here (e.g., Date, Description, Amount, Category...)"
              value={csvContent}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Preview */}
          {parsedPreview.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Preview ({parsedPreview.length} items parsed)</span>
                <span className="text-emerald-600 font-bold">Ready to import</span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                {parsedPreview.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {item.description}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.date} • {item.category} • {item.paymentMethod}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount || 0, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {parsedPreview.length > 0
              ? `${parsedPreview.length} records ready`
              : 'Select a CSV file or paste data'}
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={parsedPreview.length === 0 || successCount !== null}
              className={`px-5 py-2 text-xs font-bold rounded-xl text-white transition flex items-center space-x-1.5 ${
                successCount !== null
                  ? 'bg-emerald-600'
                  : parsedPreview.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 cursor-pointer'
                  : 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-400'
              }`}
            >
              {successCount !== null ? (
                <>
                  <Check size={14} />
                  <span>Imported {successCount} Transactions!</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Import {parsedPreview.length} Transactions</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
