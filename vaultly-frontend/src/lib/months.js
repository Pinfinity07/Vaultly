// The trends API labels months like "Nov 2026" and skips months with no spending. This
// fills the last six calendar months so gaps show as empty bars instead of disappearing.
// `pick` chooses the value per month, e.g. one category's total.
export function lastSixMonths(trends, pick = (t) => t.totalAmount || 0) {
  const byMonth = new Map(trends.map((t) => [t.month, t]));
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    const month = byMonth.get(key);
    return {
      key,
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      longLabel: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      amount: month ? pick(month) : 0,
    };
  });
}
