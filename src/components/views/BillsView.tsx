import React, { useState } from 'react';
import { Receipt, CheckCircle2, Plus, Zap, Wifi, Shield, DollarSign, Smartphone, Home, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BillItem } from '../../types';

interface Props {
  bills: BillItem[];
  onPayBill: (billId: string) => void;
  onAddBill: (bill: BillItem) => void;
}

export const BillsView: React.FC<Props> = ({ bills, onPayBill, onAddBill }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New bill state
  const [billerName, setBillerName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-08-25');
  const [category, setCategory] = useState<any>('Electricity');

  const categories = [
    'All',
    'Electricity',
    'Water',
    'Internet',
    'Mobile',
    'Rent',
    'Insurance',
    'Subscription',
    'Other',
  ];

  const filteredBills = bills.filter((b) => selectedCategory === 'All' || b.category === selectedCategory);

  const totalUnpaid = bills.filter((b) => b.status === 'Unpaid').reduce((sum, b) => sum + b.amount, 0);

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billerName || !amount) return;

    const newBill: BillItem = {
      id: 'bill_' + Date.now(),
      billerName,
      category,
      amount: parseFloat(amount),
      currency: '₹',
      dueDate,
      status: 'Unpaid',
    };

    onAddBill(newBill);
    setBillerName('');
    setAmount('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Bill Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Auto-recognized utilities, broadband, rent, insurance, and subscription payment deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>Add Custom Bill</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Outstanding</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            ₹{totalUnpaid.toLocaleString()}
          </span>
          <p className="text-[10px] text-amber-600 font-medium">Pending user payment approval</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Unpaid Bills</span>
          <span className="text-2xl font-extrabold text-amber-600 block">
            {bills.filter((b) => b.status === 'Unpaid').length}
          </span>
          <p className="text-[10px] text-slate-400">Due within next 30 days</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Paid History</span>
          <span className="text-2xl font-extrabold text-emerald-600 block">
            {bills.filter((b) => b.status === 'Paid').length}
          </span>
          <p className="text-[10px] text-emerald-600 font-medium">Marked completed by user</p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Bill Items Table / List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
            Upcoming Payments Table
          </h3>
          <span className="text-xs text-slate-400">Manual verification required</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredBills.map((bill) => {
            const isPaid = bill.status === 'Paid';

            return (
              <div
                key={bill.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-sm shrink-0">
                    <Receipt className="w-5 h-5 text-indigo-500" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{bill.billerName}</h4>
                      {bill.autoRecognized && (
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold rounded-md">
                          AI Auto-Recognized
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Category: {bill.category} • Due: {bill.dueDate}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">
                    {bill.currency}{bill.amount.toLocaleString()}
                  </span>

                  {isPaid ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Paid</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        confetti({ particleCount: 40, spread: 50 });
                        onPayBill(bill.id);
                      }}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Disclaimer */}
      <p className="text-[10px] text-slate-400 text-center">
        🔒 Life Admin AI tracks payment schedules from uploaded documents and never automatically accesses external banking credentials or executes payments without manual user intervention.
      </p>

      {/* ADD BILL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateBill}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add Custom Bill</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Biller Name</label>
              <input
                type="text"
                required
                value={billerName}
                onChange={(e) => setBillerName(e.target.value)}
                placeholder="e.g. Municipal Water Department"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1250"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Internet">Internet</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Rent">Rent</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Subscription">Subscription</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl"
              >
                Save Bill
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
