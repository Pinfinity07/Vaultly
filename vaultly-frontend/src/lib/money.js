// Display formatting only: amounts are never converted between currencies.
export const CURRENCIES = [
  { code: 'INR', label: 'Indian rupee', locale: 'en-IN' },
  { code: 'USD', label: 'US dollar', locale: 'en-US' },
  { code: 'EUR', label: 'Euro', locale: 'en-IE' },
  { code: 'GBP', label: 'British pound', locale: 'en-GB' },
  { code: 'AUD', label: 'Australian dollar', locale: 'en-AU' },
  { code: 'CAD', label: 'Canadian dollar', locale: 'en-CA' },
  { code: 'SGD', label: 'Singapore dollar', locale: 'en-SG' },
  { code: 'AED', label: 'UAE dirham', locale: 'en-AE' },
  { code: 'JPY', label: 'Japanese yen', locale: 'ja-JP' },
];

export const MASK = '••••';

const formatters = new Map();

function getFormatter(currency, compact) {
  const key = `${currency}:${compact}`;
  if (!formatters.has(key)) {
    const { locale } = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
    formatters.set(key, new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      ...(compact && { notation: 'compact', maximumFractionDigits: 1 }),
    }));
  }
  return formatters.get(key);
}

/**
 * formatMoney(1234.5, { currency: 'INR' }) -> "₹1,234.50"
 * Options: currency, compact (axis labels), signed (prefix "+" or "-"), masked (privacy toggle).
 */
export function formatMoney(amount, { currency = 'INR', compact = false, signed = false, masked = false } = {}) {
  if (masked) return MASK;
  const value = Number(amount) || 0;
  const text = getFormatter(currency, compact).format(Math.abs(value));
  if (value < 0) return `-${text}`;
  return signed && value > 0 ? `+${text}` : text;
}
