'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Target, DollarSign, Calendar, FileText } from 'lucide-react';

function UpdateGoalForm({ goal, onClose, onGoalUpdated }) {
  const [name, setName] = useState(() => goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(() => goal?.targetAmount?.toString() || '');
  const [deadline, setDeadline] = useState(() => (goal?.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ''));
  const [description, setDescription] = useState(() => goal?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!name.trim() || !targetAmount) {
      toast.error('Goal name and target amount are required');
      return;
    }

    const numericAmount = parseFloat(targetAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('Target amount must be a positive number');
      return;
    }

    if (goal && numericAmount < goal.currentAmount) {
      toast.error(`Target amount cannot be less than current saved amount ($${goal.currentAmount.toFixed(2)})`);
      return;
    }

    const goalData = {
      name: name.trim(),
      targetAmount: numericAmount,
      deadline: deadline || null,
      description: description.trim(),
    };

    setIsSubmitting(true);
    try {
      await onGoalUpdated(goalData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Goal Name
        </label>
        <div className="relative">
          <Target size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emergency Fund"
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Target Amount
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0.00"
            required
            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-sm font-semibold tabular-nums"
          />
        </div>
        {goal && (
          <p className="text-[11px] text-slate-500 mt-1">
            Current balance: <span className="font-semibold text-slate-700 tabular-nums">${goal.currentAmount.toFixed(2)}</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Deadline <span className="text-slate-400 font-normal lowercase">(optional)</span>
        </label>
        <div className="relative">
          <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
        </label>
        <div className="relative">
          <FileText size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes regarding this goal..."
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
          {isSubmitting ? 'Saving...' : 'Update Goal'}
        </button>
      </div>
    </form>
  );
}

export default function UpdateGoalModal({ isOpen, onClose, goal, onGoalUpdated }) {
  if (!isOpen || !goal) return null;

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
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Modify Goal</h2>
            <p className="text-xs text-slate-500">Update parameters for this target</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <UpdateGoalForm 
          key={goal.id} 
          goal={goal} 
          onClose={onClose} 
          onGoalUpdated={onGoalUpdated} 
        />
      </div>
    </div>
  );
}
