import React, { useState } from 'react';
import {
  Wallet as WalletIcon,
  Plus,
  ArrowRightLeft,
  Smartphone,
  Building2,
  Banknote,
  CreditCard,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { Wallet } from '../types/finance';

export const WalletsManager: React.FC = () => {
  const { wallets, addWallet, updateWallet, addTransaction, currency } = useFinance();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // New Wallet form
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'bank' | 'upi' | 'cash' | 'card'>('bank');
  const [newBalance, setNewBalance] = useState('');
  const [newAcc, setNewAcc] = useState('');

  // Transfer form
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferError, setTransferError] = useState('');

  const totalLiquidity = wallets
    .filter((w) => w.type !== 'card')
    .reduce((acc, w) => acc + w.balance, 0);

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(newBalance) || 0;

    let color = 'from-blue-600 to-indigo-700';
    let icon = 'Building2';
    if (newType === 'upi') {
      color = 'from-emerald-500 to-teal-700';
      icon = 'Smartphone';
    } else if (newType === 'cash') {
      color = 'from-amber-500 to-orange-600';
      icon = 'Banknote';
    } else if (newType === 'card') {
      color = 'from-purple-600 to-pink-600';
      icon = 'CreditCard';
    }

    addWallet({
      name: newName,
      type: newType,
      balance: balanceNum,
      accountNumber: newAcc || undefined,
      color,
      icon,
    });

    setNewName('');
    setNewBalance('');
    setNewAcc('');
    setIsAddOpen(false);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    const amt = parseFloat(transferAmount);

    if (!amt || amt <= 0) {
      setTransferError('Please enter a valid transfer amount');
      return;
    }

    if (fromWalletId === toWalletId) {
      setTransferError('Origin and destination wallets must be different');
      return;
    }

    const fromW = wallets.find((w) => w.id === fromWalletId);
    const toW = wallets.find((w) => w.id === toWalletId);

    if (!fromW || !toW) return;

    if (fromW.type !== 'card' && fromW.balance < amt) {
      setTransferError(`Insufficient funds in ${fromW.name}`);
      return;
    }

    // Deduct from origin, add to destination
    updateWallet(fromW.id, { balance: Math.max(0, fromW.balance - amt) });
    updateWallet(toW.id, { balance: toW.balance + amt });

    // Record internal transfer transaction
    addTransaction({
      amount: amt,
      type: 'transfer',
      category: 'General',
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: fromW.type === 'upi' ? 'UPI' : fromW.type === 'bank' ? 'Bank' : 'Cash',
      description: `Internal Transfer: ${fromW.name} ➔ ${toW.name}`,
      walletId: fromW.id,
      toWalletId: toW.id,
    });

    setTransferAmount('');
    setIsTransferOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Accounts & Wallets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track bank accounts, UPI apps, cash balances, and credit cards
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            <ArrowRightLeft size={15} />
            <span>Transfer Funds</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Wallet</span>
          </button>
        </div>
      </div>

      {/* Net Liquid Balance Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-indigo-900/50 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Total Liquid Cash & Bank Reserves
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight text-emerald-400">
              {formatCurrency(totalLiquidity, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Excludes credit card limits • Available for instantaneous transfer or withdrawal
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-200">
              {wallets.length} active payment sources
            </span>
          </div>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {wallets.map((w) => (
          <div
            key={w.id}
            className={`p-5 rounded-2xl bg-gradient-to-br ${w.color} text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[160px]`}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/20 uppercase tracking-wider">
                {w.type}
              </span>
              <span className="text-xs font-mono opacity-90">{w.accountNumber || '•••• 0000'}</span>
            </div>

            <div className="my-3">
              <span className="text-xs opacity-80 block truncate font-medium">{w.name}</span>
              <div className="text-2xl font-black tracking-tight mt-0.5">
                {formatCurrency(w.balance, currency)}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] opacity-80 pt-2 border-t border-white/20">
              <span>{w.type === 'card' ? 'Available Limit' : 'Current Balance'}</span>
              <span>Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Transfer Funds Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <ArrowRightLeft size={18} className="text-emerald-500" />
                <span>Transfer Between Accounts</span>
              </h3>
              <button
                onClick={() => setIsTransferOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  From Account
                </label>
                <select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatCurrency(w.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  To Account
                </label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatCurrency(w.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Transfer Amount ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 2000"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-bold"
                  autoFocus
                />
              </div>

              {transferError && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs">
                  {transferError}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Wallet Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add New Wallet / Account
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SBI Savings, Paytm Wallet"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Account Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm"
                >
                  <option value="bank">Bank Account</option>
                  <option value="upi">UPI / Digital Wallet</option>
                  <option value="card">Credit Card</option>
                  <option value="cash">Physical Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Starting Balance ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Account Identifier / Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. •••• 1234 or UPI ID"
                  value={newAcc}
                  onChange={(e) => setNewAcc(e.target.value)}
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
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
