'use client';

import { useState } from 'react';
import Dialog from './ui/Dialog';
import Button from './ui/Button';
import GoalForm from './GoalForm';

export default function UpdateGoalModal({ isOpen, onClose, goal, onGoalUpdated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (goalData) => {
    setIsSubmitting(true);
    try {
      await onGoalUpdated(goalData);
      onClose();
    } catch {
      // The page already showed the error; keep the dialog open so nothing typed is lost.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={Boolean(isOpen && goal)}
      onClose={onClose}
      title="Edit goal"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="edit-goal-form" loading={isSubmitting}>Save changes</Button>
        </>
      }
    >
      {goal && (
        <GoalForm key={goal.id} formId="edit-goal-form" initial={goal} saved={goal.currentAmount || 0} onSubmit={handleSubmit} />
      )}
    </Dialog>
  );
}
