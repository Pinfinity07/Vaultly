'use client';

import { useState } from 'react';
import { addGroupMember } from '../lib/api';
import toast from 'react-hot-toast';
import { X, Mail, ShieldCheck } from 'lucide-react';

export default function AddMemberModal({ isOpen, onClose, onMemberAdded, group }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Member email is required');
      return;
    }

    if (!group?.id) {
      toast.error('Invalid group');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await addGroupMember(group.id, { email: email.trim(), role });

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      onMemberAdded(response.member);
      toast.success('Member invited successfully');
      onClose();
      setEmail('');
      setRole('member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('member');
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
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Invite Group Member</h2>
            {group?.name && (
              <p className="text-xs text-slate-500">to {group.name}</p>
            )}
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
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@domain.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-sm"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              User must have a registered account on Vaultly.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Access Role
            </label>
            <div className="relative">
              <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition-all text-sm appearance-none"
              >
                <option value="member">Member (Can add & view expenses)</option>
                <option value="admin">Admin (Can manage members & settings)</option>
              </select>
            </div>
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
              {isSubmitting ? 'Inviting...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
