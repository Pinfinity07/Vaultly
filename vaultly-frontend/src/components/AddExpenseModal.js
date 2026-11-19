'use client';

import { useEffect, useState } from 'react';
import { getUserGroups } from '../lib/api';
import Dialog from './ui/Dialog';
import Button from './ui/Button';
import ExpenseForm from './ExpenseForm';
import useCategories from '../lib/useCategories';

export default function AddExpenseModal({ isOpen, onClose, onExpenseAdded }) {
  const [groups, setGroups] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Remount the form on every open so it starts empty.
  const [formKey, setFormKey] = useState(0);
  const { suggestions } = useCategories(isOpen);

  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setFormKey((k) => k + 1);
  }

  useEffect(() => {
    if (!isOpen) return;
    getUserGroups()
      .then((data) => data?.success && setGroups(data.groups || []))
      .catch((err) => console.error('Error fetching groups:', err));
  }, [isOpen]);

  const handleSubmit = async (expenseData) => {
    setIsSubmitting(true);
    try {
      await onExpenseAdded(expenseData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Add expense"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="add-expense-form" loading={isSubmitting}>Save expense</Button>
        </>
      }
    >
      <ExpenseForm
        key={formKey}
        formId="add-expense-form"
        groups={groups}
        categorySuggestions={suggestions}
        onSubmit={handleSubmit}
      />
    </Dialog>
  );
}
