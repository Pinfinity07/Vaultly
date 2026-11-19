'use client';

import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const controlClasses = (error) => [
  'w-full h-10 px-3 rounded-control border bg-surface text-ui text-ink',
  'placeholder:text-ink-4 transition-colors',
  'focus:outline-none focus-visible:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
  'disabled:bg-canvas disabled:text-ink-3',
  error ? 'border-negative' : 'border-line-strong',
].join(' ');

/**
 * Label, control, hint and inline error, wired together for screen readers.
 * <Field label="Email" type="email" value onChange error hint />
 * <Field label="Notes" as="textarea" rows={3} />
 * type="password" adds a show/hide button. Extra props go to the control.
 */
export default function Field({
  label,
  hint,
  error,
  as = 'input',
  type = 'text',
  required = false,
  optional = false,
  id,
  className = '',
  prefix,
  ...props
}) {
  const autoId = useId();
  const fieldId = id || autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const Control = as;
  const controlProps = {
    id: fieldId,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [errorId, hintId].filter(Boolean).join(' ') || undefined,
    className: [
      controlClasses(error),
      as === 'textarea' ? 'h-auto py-2 resize-y' : '',
      isPassword ? 'pr-11' : '',
      prefix ? 'pl-8' : '',
    ].join(' '),
    ...(as === 'input' && { type: isPassword && showPassword ? 'text' : type }),
    ...props,
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={fieldId} className="flex items-baseline justify-between text-ui font-medium text-ink">
        {label}
        {optional && <span className="text-meta font-normal text-ink-3">Optional</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ui text-ink-3">
            {prefix}
          </span>
        )}
        <Control {...controlProps} />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-control text-ink-3 hover:text-ink"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-ui text-negative">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-ui text-ink-3">
          {hint}
        </p>
      )}
    </div>
  );
}
