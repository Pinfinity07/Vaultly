'use client';

import { useId, useState } from 'react';
import Field from './ui/Field';
import Select from './ui/Select';
import { usePreferences } from '../lib/preferences';
import { currencySymbol } from '../lib/money';
import { formatCategory } from '../lib/categories';

const today = () => new Date().toISOString().split('T')[0];

/**
 * Shared fields for adding and editing an expense. Validates inline and calls
 * onSubmit({ amount, categoryId, date, description, groupId? }). The category input
 * suggests the user's own categories but accepts any new name.
 * Render the submit button outside with form={formId}.
 */
export default function ExpenseForm({ formId, initial, groups, categorySuggestions = [], onSubmit }) {
  const currency = usePreferences((s) => s.currency);
  const listId = useId();
  const [amount, setAmount] = useState(() => (initial?.amount != null ? String(initial.amount) : ''));
  const [category, setCategory] = useState(() => (initial?.category ? formatCategory(initial.category) : ''));
  const [date, setDate] = useState(() => (initial?.date ? initial.date.split('T')[0] : today()));
  const [description, setDescription] = useState(() => initial?.description || '');
  const [groupId, setGroupId] = useState('');
  const [errors, setErrors] = useState({});

  const clear = (field) => errors[field] && setErrors({ ...errors, [field]: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    const next = {};
    if (!amount) next.amount = 'Enter an amount';
    else if (!Number.isFinite(numericAmount) || numericAmount <= 0) next.amount = 'Enter an amount above zero';
    if (!category.trim()) next.category = 'Pick a category or type a new one';
    if (!date) next.date = 'Pick a date';
    setErrors(next);
    if (Object.keys(next).length) return;

    onSubmit({
      amount: numericAmount,
      categoryId: category.trim(),
      date,
      description: description.trim(),
      ...(groupId && { groupId }),
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        label="Amount"
        prefix={currencySymbol(currency)}
        inputMode="decimal"
        placeholder="0.00"
        className="[&_input]:font-mono [&_input]:tabular-nums"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          clear('amount');
        }}
        error={errors.amount}
        data-autofocus
        required
      />

      <Field
        label="Category"
        list={listId}
        autoComplete="off"
        placeholder="Groceries, Rent, Transport…"
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          clear('category');
        }}
        error={errors.category}
        required
      />
      <datalist id={listId}>
        {categorySuggestions.map((name) => (
          <option key={name} value={formatCategory(name)} />
        ))}
      </datalist>

      <Field
        label="Date"
        type="date"
        value={date}
        max={today()}
        onChange={(e) => {
          setDate(e.target.value);
          clear('date');
        }}
        error={errors.date}
        required
      />

      <Field
        label="Description"
        optional
        placeholder="What was it for?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {groups && groups.length > 0 && (
        <Select
          label="Shared with"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          placeholder="Just me"
          options={groups.map((g) => ({ value: g.id, label: g.name }))}
          hint="Group expenses show up for everyone in the group."
        />
      )}
    </form>
  );
}
