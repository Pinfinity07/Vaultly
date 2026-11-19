'use client';

import { useState } from 'react';
import { updateExpense } from '../lib/api';
import toast from 'react-hot-toast';
import Dialog from './ui/Dialog';
import Button from './ui/Button';
import ExpenseForm from './ExpenseForm';
import useCategories from '../lib/useCategories';

export default function UpdateExpenseModal({ isOpen, onClose, onExpenseUpdated, expense }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { suggestions } = useCategories(isOpen);

  const handleSubmit = async ({ amount, categoryId, date, description }) => {
    setIsSubmitting(true);
    try {
      const response = await updateExpense(expense.id, { amount, categoryId, date, description });
      if (response?.error) {
        toast.error(response.error);
        return;
      }
      onExpenseUpdated(response.expense);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={Boolean(isOpen && expense)}
      onClose={onClose}
      title="Edit expense"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="edit-expense-form" loading={isSubmitting}>Save changes</Button>
        </>
      }
    >
      {expense && (
        <ExpenseForm
          key={expense.id}
          formId="edit-expense-form"
          initial={expense}
          categorySuggestions={suggestions}
          onSubmit={handleSubmit}
        />
      )}
    </Dialog>
  );
}
