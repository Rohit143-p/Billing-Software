import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Expense } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  currency: string;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  currency
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cloud Infrastructure');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    onAddExpense({
      title: title.trim(),
      category: category.trim(),
      amount: numAmount,
      date: new Date().toISOString().split('T')[0],
      vendor: vendor.trim() || undefined,
      note: note.trim() || undefined
    });

    setTitle('');
    setAmount('');
    setVendor('');
    setNote('');
    onClose();
  };

  const categories = [
    'Cloud Infrastructure',
    'Contractors',
    'Marketing Spend',
    'Office Lease',
    'Hardware & Inventory',
    'Software Licenses',
    'Travel & Operations'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 block">
              Capital Outflow Entry
            </span>
            <h3 className="font-editorial text-2xl font-bold text-slate-900 mt-0.5">
              Record New Expense
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Expense Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AWS Server Bandwidth"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Vendor / Recipient
            </label>
            <input
              type="text"
              placeholder="e.g. Amazon Web Services Inc"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Internal Note
            </label>
            <textarea
              rows={2}
              placeholder="Optional billing remarks..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 placeholder:text-slate-400"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
