'use client';

import { useState } from 'react';
import Dialog from './ui/Dialog';
import Button from './ui/Button';
import Field from './ui/Field';
import { useFormatMoney } from './ui/MoneyText';
import { usePreferences } from '../lib/preferences';
import { currencySymbol } from '../lib/money';

export default function ContributeGoalModal({ isOpen, onClose, goal, onContribute }) {
  const currency = usePreferences((s) => s.currency);
  const format = useFormatMoney();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saved = goal?.currentAmount || 0;
  const remaining = Math.max(0, (goal?.targetAmount || 0) - saved);
  const numericAmount = parseFloat(amount);
  // Going over the target is allowed, but said plainly here instead of in a confirm().
  const overBy = Number.isFinite(numericAmount) ? saved + numericAmount - (goal?.targetAmount || 0) : 0;

  const handleClose = () => {
    setAmount('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter an amount above zero');
      return;
    }

    setIsSubmitting(true);
    try {
      await onContribute(numericAmount);
      handleClose();
    } catch {
      // The page already showed the error; keep the dialog open so nothing typed is lost.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={Boolean(isOpen && goal)}
      onClose={handleClose}
      title={goal ? `Add to ${goal.name}` : 'Add money'}
      description={goal ? `${format(saved)} saved of ${format(goal.targetAmount)}. ${format(remaining)} to go.` : undefined}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="contribute-form" loading={isSubmitting}>
            {overBy > 0 ? 'Add anyway' : 'Add money'}
          </Button>
        </>
      }
    >
      <form id="contribute-form" onSubmit={handleSubmit} className="space-y-3" noValidate>
        <Field
          label="Amount"
          prefix={currencySymbol(currency)}
          inputMode="decimal"
          placeholder="0.00"
          className="[&_input]:font-mono [&_input]:tabular-nums"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError('');
          }}
          error={error}
          data-autofocus
          required
        />
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => setAmount(String(Math.round(remaining * 100) / 100))}
            className="h-10 rounded-control px-2 -ml-2 text-ui font-medium text-brand hover:underline"
          >
            Add the remaining {format(remaining)}
          </button>
        )}
        {overBy > 0 && (
          <p role="status" className="text-ui text-warning">
            This puts you {format(overBy)} over your target. You can still add it.
          </p>
        )}
      </form>
    </Dialog>
  );
}
