'use client';

import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { controlClasses } from './Field';

/**
 * Native select styled like Field.
 * <Select label="Category" value onChange options={[{ value, label }]} placeholder="All categories" />
 * Pass a list id via `list` on a Field instead when the options should be searchable.
 */
export default function Select({ label, options = [], placeholder, error, hint, id, className = '', hideLabel = false, ...props }) {
  const autoId = useId();
  const selectId = id || autoId;
  const errorId = error ? `${selectId}-error` : undefined;
  const hintId = hint ? `${selectId}-hint` : undefined;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={selectId} className={hideLabel ? 'sr-only' : 'block text-ui font-medium text-ink'}>
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
          className={`${controlClasses(error)} appearance-none pr-9`}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
      </div>
      {error && <p id={errorId} className="text-ui text-negative">{error}</p>}
      {hint && <p id={hintId} className="text-ui text-ink-3">{hint}</p>}
    </div>
  );
}
