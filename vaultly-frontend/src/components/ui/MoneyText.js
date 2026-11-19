'use client';

import { formatMoney } from '../../lib/money';
import { usePreferences } from '../../lib/preferences';

/**
 * An amount in the user's display currency, hidden when the privacy toggle is on.
 * <MoneyText amount={-120} signed mono className="text-ink" />
 */
export default function MoneyText({ amount, signed = false, compact = false, mono = false, className = '' }) {
  const currency = usePreferences((s) => s.currency);
  const masked = usePreferences((s) => s.hideAmounts);

  return (
    <span className={`tabular-nums ${mono ? 'font-mono' : ''} ${className}`}>
      {masked && <span className="sr-only">Amount hidden</span>}
      <span aria-hidden={masked || undefined}>{formatMoney(amount, { currency, signed, compact, masked })}</span>
    </span>
  );
}

/** For text that is not JSX, such as toasts and aria labels. */
export function useFormatMoney() {
  const currency = usePreferences((s) => s.currency);
  const masked = usePreferences((s) => s.hideAmounts);
  return (amount, options = {}) => formatMoney(amount, { currency, masked, ...options });
}
