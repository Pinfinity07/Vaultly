'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { X, TrendingUp } from 'lucide-react';

export default function ContributeGoalModal({ isOpen, onClose, goal, onContribute }) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const numericAmount = parseFloat(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('Contribution amount must be a positive number');
      return;
    }

    const newTotal = (goal.currentAmount || 0) + numericAmount;
    if (newTotal > goal.targetAmount) {
      const overage = newTotal - goal.targetAmount;
      if (!confirm(`This contribution will exceed your target by $${overage.toFixed(2)}. Do you wish to continue?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onContribute(numericAmount);
      onClose();
      setAmount('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - (goal.currentAmount || 0));

  return (
    <div 
      className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-md p-6 relative overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Add Contribution</h2>
            <p className="text-xs text-slate-500">{goal.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Goal Summary Card */}
        <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-500 font-medium">Progress</span>
            <span className="text-slate-900 font-semibold tabular-nums">
              ${(goal.currentAmount || 0).toFixed(2)} of ${goal.targetAmount.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, goal.targetAmount > 0 ? ((goal.currentAmount || 0) / goal.targetAmount) * 100 : 0)}%` }}
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-[11px] text-teal-700 font-medium tabular-nums">
              ${remaining.toFixed(2)} left to target
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Contribution Amount
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
                autoFocus
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-sm font-semibold tabular-nums"
              />
            </div>
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => setAmount(remaining.toFixed(2))}
                className="mt-2 text-xs text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1 hover:underline"
              >
                <TrendingUp size={13} />
                Fill remaining balance (${remaining.toFixed(2)})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
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
              {isSubmitting ? 'Recording...' : 'Contribute Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
