'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Navigation from '../../components/Navigation';
import CreateGoalModal from '../../components/CreateGoalModal';
import UpdateGoalModal from '../../components/UpdateGoalModal';
import ContributeGoalModal from '../../components/ContributeGoalModal';
import GoalCard from '../../components/GoalCard';
import { getUserGoals, createGoal, updateGoal, deleteGoal, contributeToGoal } from '../../lib/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { useConfirm } from '../../components/ui/ConfirmDialog';

const progressOf = (goal) => (goal.targetAmount > 0 ? (goal.currentAmount || 0) / goal.targetAmount : 0);

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributingGoal, setContributingGoal] = useState(null);
  const confirm = useConfirm();

  const fetchGoals = useCallback(async () => {
    try {
      const result = await getUserGoals();
      if (result?.error) {
        toast.error(result.error);
      } else {
        setGoals(result?.goals || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load your goals');
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
      throw new Error(result.error);
    }
    toast.success('Goal created');
    await fetchGoals();
  };

  const handleUpdateGoal = async (goalData) => {
    const result = await updateGoal(editingGoal.id, goalData);
    if (result?.error) {
      toast.error(result.error);
      throw new Error(result.error);
    }
    toast.success('Goal updated');
    await fetchGoals();
  };

  const handleDeleteGoal = async (goal) => {
    const ok = await confirm({
      title: `Delete ${goal.name}?`,
      description: 'The goal and the record of what you put toward it are removed. This cannot be undone.',
      confirmLabel: 'Delete goal',
    });
    if (!ok) return;

    const result = await deleteGoal(goal.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Goal deleted');
      await fetchGoals();
    }
  };

  const handleContribute = async (amount) => {
    const goal = contributingGoal;
    const result = await contributeToGoal(goal.id, amount);
    if (result?.error) {
      toast.error(result.error);
      throw new Error(result.error);
    }
    const reached = (goal.currentAmount || 0) + amount >= goal.targetAmount;
    toast.success(reached ? `${goal.name}: target reached` : 'Added');
    await fetchGoals();
  };

  // In-progress goals first, closest to done leading (and featured); reached goals last.
  const inProgress = goals.filter((g) => progressOf(g) < 1).sort((a, b) => progressOf(b) - progressOf(a));
  const reached = goals.filter((g) => progressOf(g) >= 1);

  const cardProps = {
    onContribute: setContributingGoal,
    onEdit: setEditingGoal,
    onDelete: handleDeleteGoal,
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main id="main-content" className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Goals"
          description="Money you are setting aside for something specific."
          actions={
            goals.length > 0 && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus size={16} aria-hidden="true" />
                New goal
              </Button>
            )
          }
        />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
            <Skeleton className="h-56 rounded-surface md:col-span-2" />
            <Skeleton className="h-48 rounded-surface" />
            <Skeleton className="h-48 rounded-surface" />
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-surface border border-line bg-surface">
            <EmptyState
              title="No goals yet"
              description="Set a target and a deadline, then add money as you save it."
              action={
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus size={16} aria-hidden="true" />
                  Create a goal
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {inProgress.length > 0 && (
              <section aria-label="In progress" className="grid gap-4 md:grid-cols-2">
                {inProgress.map((goal, i) => (
                  <GoalCard key={goal.id} goal={goal} featured={i === 0} {...cardProps} />
                ))}
              </section>
            )}
            {reached.length > 0 && (
              <section aria-labelledby="reached-heading" className="space-y-3">
                <h2 id="reached-heading" className="text-body font-medium text-ink-3">Reached</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {reached.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} {...cardProps} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <CreateGoalModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onGoalCreated={handleCreateGoal} />
      <UpdateGoalModal isOpen={Boolean(editingGoal)} goal={editingGoal} onClose={() => setEditingGoal(null)} onGoalUpdated={handleUpdateGoal} />
      <ContributeGoalModal isOpen={Boolean(contributingGoal)} goal={contributingGoal} onClose={() => setContributingGoal(null)} onContribute={handleContribute} />
    </div>
  );
}
