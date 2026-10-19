'use client';

import { useState } from 'react';
import { createGroup } from '../lib/api';
import toast from 'react-hot-toast';
import { X, Users2 } from 'lucide-react';

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createGroup({ name: name.trim() });

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      onGroupCreated(response.group);
      toast.success('Group created successfully');
      onClose();
      setName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  if (!isOpen) return null;

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
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create Shared Group</h2>
            <p className="text-xs text-slate-500">Track shared expenses with friends or family</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Group Name
            </label>
            <div className="relative">
              <Users2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apartment 4B, Tokyo Trip, Family Budget"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              All invited members will be able to review shared expenditures in this space.
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
