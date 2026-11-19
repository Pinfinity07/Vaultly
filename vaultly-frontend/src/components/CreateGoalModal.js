'use client';

import { useState } from 'react';
import Dialog from './ui/Dialog';
import Button from './ui/Button';
import GoalForm from './GoalForm';

export default function CreateGoalModal({ isOpen, onClose, onGoalCreated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Remount the form on every open so it starts empty.
  const [formKey, setFormKey] = useState(0);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setFormKey((k) => k + 1);
  }

  const handleSubmit = async (goalData) => {
    setIsSubmitting(true);
    try {
      await onGoalCreated(goalData);
      onClose();
    } catch {
      // The page already showed the error; keep the dialog open so nothing typed is lost.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="New savings goal"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="create-goal-form" loading={isSubmitting}>Create goal</Button>
        </>
      }
    >
      <GoalForm key={formKey} formId="create-goal-form" onSubmit={handleSubmit} />
    </Dialog>
  );
}
