'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '../../components/Navigation';
import CreateGroupModal from '../../components/CreateGroupModal';
import AddMemberModal from '../../components/AddMemberModal';
import {
  Users2,
  Plus,
  UserPlus,
  Trash2,
  Crown,
  ShieldCheck,
  X,
  Receipt
} from 'lucide-react';
import {
  getUserGroups,
  removeGroupMember,
  deleteGroup,
} from '../../lib/api';
import toast from 'react-hot-toast';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await getUserGroups();
      if (data?.success) {
        setGroups(data.groups || []);
      } else {
        toast.error(data?.error || data?.message || 'Failed to load groups');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleGroupCreated = () => {
    fetchGroups();
  };

  const handleMemberAdded = () => {
    fetchGroups();
  };

  const handleRemoveMember = async (groupId, memberId) => {
    if (!confirm('Remove this member from the group?')) return;

    try {
      const data = await removeGroupMember(groupId, memberId);
      if (data?.success) {
        toast.success('Member removed');
        fetchGroups();
      } else {
        toast.error(data?.error || data?.message || 'Failed to remove member');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove member');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Delete this group? Associated group expense tags will be unlinked.')) return;

    try {
      const data = await deleteGroup(groupId);
      if (data?.success) {
        toast.success('Group deleted');
        fetchGroups();
      } else {
        toast.error(data?.error || data?.message || 'Failed to delete group');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete group');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Shared Groups
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Split bills, manage shared living expenses, and coordinate joint spending
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs self-start sm:self-auto"
          >
            <Plus size={16} strokeWidth={2.2} />
            <span>Create Group</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            <div className="h-64 bg-slate-200/80 rounded-2xl" />
            <div className="h-64 bg-slate-200/80 rounded-2xl" />
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-10 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-100">
              <Users2 size={26} strokeWidth={1.8} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">No active groups yet</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a space for your roommates, trip buddies, or family to log shared expenditures together.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
            >
              <Plus size={16} />
              <span>Create Your First Group</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groups.map((group) => (
              <div 
                key={group.id} 
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                        <Users2 size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">{group.name}</h2>
                        <p className="text-[11px] text-slate-500">
                          Created by {group.creator?.fullName || 'Owner'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete Group"
                      aria-label="Delete Group"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 gap-3 my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Members</span>
                      <span className="text-lg font-bold text-slate-900 tabular-nums">{group.memberCount}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Group Spend</span>
                      <span className="text-lg font-bold text-teal-700 tabular-nums">${group.totalExpenses.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Members Section */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Members</h3>
                      <button
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowAddMemberModal(true);
                        }}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 hover:underline"
                      >
                        <UserPlus size={13} />
                        <span>Invite Member</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {group.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 border border-slate-100 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center">
                              {member.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 leading-none">{member.user?.fullName}</p>
                              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{member.user?.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {member.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                                <Crown size={11} />
                                <span>Admin</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                <ShieldCheck size={11} />
                                <span>Member</span>
                              </span>
                            )}

                            {member.user?.id !== group.createdBy && (
                              <button
                                onClick={() => handleRemoveMember(group.id, member.id)}
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Remove member"
                                aria-label="Remove member"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Group Expenses */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Recent Group Charges</h3>
                  {group.expenses.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No group expenses recorded yet</p>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {group.expenses.slice(0, 4).map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Receipt size={14} className="text-slate-400 shrink-0" />
                            <div className="truncate max-w-[180px]">
                              <p className="font-medium text-slate-900 leading-tight truncate">{expense.description || expense.category?.name}</p>
                              <p className="text-[10px] text-slate-400">by {expense.user?.fullName}</p>
                            </div>
                          </div>
                          <div className="text-right tabular-nums">
                            <span className="font-bold text-slate-900">${expense.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateGroupModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={handleGroupCreated}
      />

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setSelectedGroup(null);
        }}
        onMemberAdded={handleMemberAdded}
        group={selectedGroup}
      />
    </div>
  );
}
