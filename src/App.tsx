import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TransactionsList } from './components/TransactionsList';
import { BudgetManager } from './components/BudgetManager';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { WalletsManager } from './components/WalletsManager';
import { RecurringExpenses } from './components/RecurringExpenses';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AiInsightsModal } from './components/AiInsightsModal';
import { CsvImportModal } from './components/CsvImportModal';
import { DailyReminderBanner } from './components/DailyReminderBanner';
import { Transaction, TransactionType } from './types/finance';
import { Plus, RotateCcw, ShieldCheck, Heart } from 'lucide-react';

function FinanceApp() {
  const { resetToDefaults } = useFinance();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('expense');
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [isAiInsightsOpen, setIsAiInsightsOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleOpenAddModal = (type: TransactionType = 'expense') => {
    setEditTransaction(null);
    setModalDefaultType(type);
    setIsAddModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditTransaction(tx);
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={() => handleOpenAddModal('expense')}
        onOpenAiInsights={() => setIsAiInsightsOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Daily Expense Check-in Reminder Banner */}
        <DailyReminderBanner onOpenAddModal={() => handleOpenAddModal('expense')} />

        {/* Tab Routing */}
        {currentTab === 'dashboard' && (
          <Dashboard
            onOpenAddModal={handleOpenAddModal}
            onNavigateTab={setCurrentTab}
            onOpenAiInsights={() => setIsAiInsightsOpen(true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onEditTransaction={handleEditTransaction}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsList
            onOpenAddModal={() => handleOpenAddModal('expense')}
            onEditTransaction={handleEditTransaction}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}

        {currentTab === 'budgets' && <BudgetManager />}

        {currentTab === 'reports' && (
          <ReportsAnalytics onOpenAiInsights={() => setIsAiInsightsOpen(true)} />
        )}

        {currentTab === 'wallets' && <WalletsManager />}

        {currentTab === 'recurring' && <RecurringExpenses />}
      </main>

      {/* Floating Action Button on Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-30">
        <button
          onClick={() => handleOpenAddModal('expense')}
          className="w-14 h-14 rounded-full bg-emerald-600 text-white shadow-xl flex items-center justify-center hover:bg-emerald-500 active:scale-95 transition"
          aria-label="Add transaction"
        >
          <Plus size={26} />
        </button>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditTransaction(null);
        }}
        editTransaction={editTransaction}
        defaultType={modalDefaultType}
      />

      <AiInsightsModal
        isOpen={isAiInsightsOpen}
        onClose={() => setIsAiInsightsOpen(false)}
      />

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900 dark:text-white">RupeeFlow</span>
            <span>•</span>
            <span>Smart Personal Expense & Budget Management Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                if (window.confirm('Reset all demo data to default baseline (₹45,000 Income, ₹22,500 Expenses)?')) {
                  resetToDefaults();
                }
              }}
              className="text-slate-400 hover:text-rose-500 flex items-center space-x-1 cursor-pointer transition"
              title="Reset sample data"
            >
              <RotateCcw size={12} />
              <span>Reset Demo Data</span>
            </button>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>100% Client-side Data Privacy</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <FinanceApp />
    </FinanceProvider>
  );
}
