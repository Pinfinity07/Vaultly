// The API records who paid each group bill but not how it was split, so balances are an
// estimate that assumes every bill is shared equally by the group's current members.
// Pages must say so wherever these numbers appear.

/**
 * groupBalances(group) -> {
 *   members: [{ userId, name, paid, share, net }]   net > 0: is owed, net < 0: owes
 *   settlements: [{ from, to, amount }]             fewest payments that settle up
 * }
 */
export function groupBalances(group) {
  const members = (group?.members || []).map((m) => ({
    userId: m.user?.id,
    name: m.user?.fullName || m.user?.email || 'Member',
    paid: 0,
  }));
  if (members.length === 0) return { members: [], settlements: [] };

  const byId = new Map(members.map((m) => [m.userId, m]));
  let total = 0;
  for (const expense of group.expenses || []) {
    total += expense.amount;
    const payer = byId.get(expense.user?.id);
    // Bills from people who have since left still count toward the total.
    if (payer) payer.paid += expense.amount;
  }

  const share = total / members.length;
  for (const m of members) {
    m.share = share;
    m.net = round(m.paid - share);
  }

  // Greedy matching of the largest debtor with the largest creditor.
  const debtors = members.filter((m) => m.net < 0).map((m) => ({ ...m, left: -m.net }));
  const creditors = members.filter((m) => m.net > 0).map((m) => ({ ...m, left: m.net }));
  const settlements = [];
  debtors.sort((a, b) => b.left - a.left);
  creditors.sort((a, b) => b.left - a.left);
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = round(Math.min(debtors[i].left, creditors[j].left));
    if (amount > 0) settlements.push({ from: debtors[i], to: creditors[j], amount });
    debtors[i].left = round(debtors[i].left - amount);
    creditors[j].left = round(creditors[j].left - amount);
    if (debtors[i].left <= 0) i++;
    if (creditors[j].left <= 0) j++;
  }

  return { members, settlements };
}

function round(value) {
  return Math.round(value * 100) / 100;
}
