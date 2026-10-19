'use client';

import { useState } from 'react';
import { updateExpense } from '../lib/api';
import toast from 'react-hot-toast';
import { X, DollarSign, Tag, Calendar, FileText } from 'lucide-react';

const PRESET_CATEGORIES = [
  'food',
  'transport',
  'entertainment',
  'utilities',
  'shopping',
  'healthcare'
];

function UpdateExpenseForm({ expense, onClose, onExpenseUpdated }) {
  const isCustom = expense?.category && !PRESET_CATEGORIES.includes(expense.category.toLowerCase());
  
  const [amount, setAmount] = useState(() => expense?.amount?.toString() || '');
  const [category, setCategory] = useState(() => (isCustom ? 'other' : (expense?.category?.toLowerCase() || '')));
  const [date, setDate] = useState(() => (expense?.date ? expense.date.split('T')[0] : ''));
  const [description, setDescription] = useState(() => expense?.description || '');
  const [customCategory, setCustomCategory] = useState(() => (isCustom ? expense.category : ''));
  const [showCustomCategory, setShowCustomCategory] = useState(isCustom);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !category || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }

    if (category === 'other' && !customCategory.trim()) {
      toast.error('Please enter a custom category name');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateExpense(expense.id, {
        amount: numericAmount,
        categoryId: category === 'other' ? customCategory.trim() : category,
        date,
        description: description.trim(),
      });

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      onExpenseUpdated(response.expense);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-sm font-semibold tabular-nums"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Category
        </label>
        <div className="relative">
          <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setShowCustomCategory(e.target.value === 'other');
            }}
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-sm appearance-none"
          >
            <option value="">Select Category</option>
            <option value="food">Food & Dining</option>
            <option value="transport">Transportation</option>
            <option value="entertainment">Entertainment</option>
            <option value="utilities">Utilities</option>
            <option value="shopping">Shopping</option>
            <option value="healthcare">Healthcare</option>
            <option value="other">Custom Category</option>
          </select>
        </div>
      </div>

      {showCustomCategory && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Custom Category Name
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="e.g. Travel, Books"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Date
        </label>
        <div className="relative">
          <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Description
        </label>
        <div className="relative">
          <FileText size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes regarding this expense..."
            rows={2}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-sm resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
        >
          {isSubmitting ? 'Updating...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default function UpdateExpenseModal({ isOpen, onClose, onExpenseUpdated, expense }) {
  if (!isOpen || !expense) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-md p-6 relative overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Edit Expense</h2>
            <p className="text-xs text-slate-500">Modify details for this entry</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <UpdateExpenseForm 
          key={expense.id} 
          expense={expense} 
          onClose={onClose} 
          onExpenseUpdated={onExpenseUpdated} 
        />
      </div>
    </div>
  );
}
