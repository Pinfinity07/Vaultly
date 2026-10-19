'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '../../components/Navigation';
import CreateGoalModal from '../../components/CreateGoalModal';
import UpdateGoalModal from '../../components/UpdateGoalModal';
import ContributeGoalModal from '../../components/ContributeGoalModal';
import { getUserGoals, createGoal, updateGoal, deleteGoal, contributeToGoal } from '../../lib/api';
import toast from 'react-hot-toast';
import { Target, Plus, Calendar, Edit3, Trash2, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUserGoals();
      if (result?.error) {
        toast.error(result.error);
      } else {
        setGoals(result?.goals || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleCreateGoal = async (goalData) => {
    const result = await createGoal(goalData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Savings target established');
      await fetchGoals();
    }
  };

  const handleUpdateGoal = async (goalData) => {
    const result = await updateGoal(selectedGoal.id, goalData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Goal updated');
      await fetchGoals();
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!confirm('Permanently delete this financial goal?')) return;
    
    const result = await deleteGoal(goalId);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Goal deleted');
      await fetchGoals();
    }
  };

  const handleContribute = async (amount) => {
    const result = await contributeToGoal(selectedGoal.id, amount);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Contribution recorded');
      await fetchGoals();
    }
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null;
    const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { text: 'Overdue', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200/60' };
    if (daysLeft <= 7) return { text: `${daysLeft} days left`, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200/60' };
    if (daysLeft <= 30) return { text: `${daysLeft} days left`, color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200/60' };
    return { text: `${daysLeft} days left`, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200/60' };
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Savings Targets
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Set personal milestones and allocate funds toward your objectives
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs self-start sm:self-auto"
          >
            <Plus size={16} strokeWidth={2.2} />
            <span>New Target</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="h-56 bg-slate-200/80 rounded-2xl" />
            <div className="h-56 bg-slate-200/80 rounded-2xl" />
            <div className="h-56 bg-slate-200/80 rounded-2xl" />
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-10 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-100">
              <Target size={26} strokeWidth={1.8} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">No active savings targets</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Define a goal like an Emergency Fund or tech upgrade to start accumulating funds.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
            >
              <Plus size={16} />
              <span>Establish Your First Target</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const deadlineStatus = getDeadlineStatus(goal.deadline);
              const isCompleted = goal.progress >= 100;
              
              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Strip */}
                    <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 leading-tight">{goal.name}</h2>
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                              <CheckCircle2 size={11} />
                              <span>Complete</span>
                            </span>
                          )}
                        </div>
                        {goal.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-1">{goal.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedGoal(goal);
                            setShowUpdateModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Edit Goal"
                          aria-label="Edit Goal"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Goal"
                          aria-label="Delete Goal"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Amounts */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-xl font-bold text-slate-900 tabular-nums">
                          ${goal.currentAmount.toFixed(2)}
                        </span>
                        <span className="text-slate-500 font-medium tabular-nums">
                          Target: ${goal.targetAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-teal-600' : 'bg-slate-900'
                          }`}
                          style={{ width: `${Math.min(goal.progress, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 tabular-nums">{goal.progress.toFixed(1)}% funded</span>
                        <span className="tabular-nums">
                          ${Math.max(0, goal.targetAmount - goal.currentAmount).toFixed(2)} remaining
                        </span>
                      </div>
                    </div>

                    {/* Deadline Badge */}
                    {deadlineStatus && (
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border mb-4 ${deadlineStatus.bg} ${deadlineStatus.color}`}>
                        <Clock size={13} />
                        <span>{deadlineStatus.text}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Strip */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowContributeModal(true);
                      }}
                      disabled={isCompleted}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition inline-flex items-center justify-center gap-2 ${
                        isCompleted
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                      }`}
                    >
                      <TrendingUp size={14} />
                      <span>{isCompleted ? 'Target Achieved' : 'Contribute Funds'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGoalCreated={handleCreateGoal}
      />
      <UpdateGoalModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedGoal(null);
        }}
        goal={selectedGoal}
        onGoalUpdated={handleUpdateGoal}
      />
      <ContributeGoalModal
        isOpen={showContributeModal}
        onClose={() => {
          setShowContributeModal(false);
          setSelectedGoal(null);
        }}
        goal={selectedGoal}
        onContribute={handleContribute}
      />
    </div>
  );
}
