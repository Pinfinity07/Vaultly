'use client';

import { useState } from 'react';
import Field from './ui/Field';
import { usePreferences } from '../lib/preferences';
import { currencySymbol, formatMoney } from '../lib/money';

const today = () => new Date().toISOString().split('T')[0];

/**
 * Fields shared by the create and edit goal dialogs. Validates inline and calls
 * onSubmit({ name, targetAmount, deadline, description }). `saved` is the amount already
 * put toward the goal; the target cannot go below it.
 */
export default function GoalForm({ formId, initial, saved = 0, onSubmit }) {
  const currency = usePreferences((s) => s.currency);
  const [name, setName] = useState(() => initial?.name || '');
  const [targetAmount, setTargetAmount] = useState(() => (initial?.targetAmount != null ? String(initial.targetAmount) : ''));
  const [deadline, setDeadline] = useState(() => (initial?.deadline ? new Date(initial.deadline).toISOString().split('T')[0] : ''));
  const [description, setDescription] = useState(() => initial?.description || '');
  const [errors, setErrors] = useState({});

  const clear = (field) => errors[field] && setErrors({ ...errors, [field]: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(targetAmount);
    const next = {};
    if (!name.trim()) next.name = 'Give the goal a name';
    if (!targetAmount) next.targetAmount = 'Enter a target amount';
    else if (!Number.isFinite(amount) || amount <= 0) next.targetAmount = 'Enter an amount above zero';
    else if (amount < saved) next.targetAmount = `You have already saved ${formatMoney(saved, { currency })}, so the target can't be lower`;
    setErrors(next);
    if (Object.keys(next).length) return;

    onSubmit({ name: name.trim(), targetAmount: amount, deadline: deadline || null, description: description.trim() });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        label="Goal"
        placeholder="Goa trip, emergency fund…"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          clear('name');
        }}
        error={errors.name}
        data-autofocus
        required
      />
      <Field
        label="Target amount"
        prefix={currencySymbol(currency)}
        inputMode="decimal"
        placeholder="0.00"
        className="[&_input]:font-mono [&_input]:tabular-nums"
        value={targetAmount}
        onChange={(e) => {
          setTargetAmount(e.target.value);
          clear('targetAmount');
        }}
        error={errors.targetAmount}
        required
      />
      <Field
        label="Deadline"
        type="date"
        optional
        min={initial ? undefined : today()}
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <Field
        label="Notes"
        as="textarea"
        rows={2}
        optional
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </form>
  );
}
