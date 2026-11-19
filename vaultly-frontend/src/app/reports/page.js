'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Download } from 'lucide-react';
import Navigation, { openAddExpense } from '../../components/Navigation';
import SpendingChart from '../../components/SpendingChart';
import {
  getSpendingOverview,
  getMonthlyTrends,
  getTopExpenses,
  getGroupAnalytics,
  getComparisonData
} from '../../lib/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import MoneyText from '../../components/ui/MoneyText';
import { categoryColor, formatCategory } from '../../lib/categories';
import { lastSixMonths } from '../../lib/months';

const PERIODS = [
  { value: 'month', label: 'Month', current: 'This month so far', previous: 'All of last month' },
  { value: 'year', label: 'Year', current: 'This year so far', previous: 'All of last year' },
];

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [category, setCategory] = useState('all');
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  const [groupAnalytics, setGroupAnalytics] = useState([]);
  const [comparison, setComparison] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const [overviewRes, trendsRes, topExpensesRes, groupAnalyticsRes] = await Promise.all([
        getSpendingOverview(),
        getMonthlyTrends(6),
        getTopExpenses(5),
        getGroupAnalytics(),
      ]);
      if (overviewRes?.success) setOverview(overviewRes.data);
      if (trendsRes?.success) setTrends(trendsRes.data);
      if (topExpensesRes?.success) setTopExpenses(topExpensesRes.data);
      if (groupAnalyticsRes?.success) setGroupAnalytics(groupAnalyticsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Could not load your analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // The comparison is the only thing that depends on the period.
  useEffect(() => {
    let active = true;
    getComparisonData(period).then((res) => {
      if (active && res?.success) setComparison(res.data);
    });
    return () => {
      active = false;
    };
  }, [period]);

  const months = useMemo(
    () => lastSixMonths(trends, category === 'all' ? undefined : (t) => t.categories?.[category] || 0),
    [trends, category]
  );

  const exportAnalyticsToCSV = () => {
    if (!overview || overview.totalCount === 0) {
      toast.error('Nothing to export yet');
      return;
    }

    const quote = (v) => `"${String(v).replace(/"/g, '""')}"`;
    let csvContent = 'VAULTLY ANALYTICS EXPORT\n';
    csvContent += `Generated,${new Date().toISOString()}\n\n`;
    csvContent += 'SPENDING BY CATEGORY (ALL TIME)\nCategory,Amount,Percentage\n';
    overview.categoryBreakdown?.forEach((cat) => {
      const pct = overview.totalAmount > 0 ? ((cat.amount / overview.totalAmount) * 100).toFixed(1) : 0;
      csvContent += `${quote(formatCategory(cat.category))},${cat.amount.toFixed(2)},${pct}%\n`;
    });
    csvContent += '\nSPENDING BY MONTH (LAST 6 MONTHS)\nMonth,Amount,Transactions\n';
    trends.forEach((t) => {
      csvContent += `${quote(t.month)},${t.totalAmount.toFixed(2)},${t.count}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vaultly_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const periodInfo = PERIODS.find((p) => p.value === period);
  const categories = [...(overview?.categoryBreakdown || [])].sort((a, b) => b.amount - a.amount);
  const total = overview?.totalAmount || 0;
  const groupShare = groupAnalytics.reduce((s, g) => s + (g.userAmount || 0), 0);
  const personal = Math.max(0, total - groupShare);
  const change = comparison?.change?.percentage ?? 0;
  const hasPrevious = (comparison?.previous?.amount || 0) > 0;

  return (
    <div className="min-h-screen">
      <Navigation />

      <main id="main-content" className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Analytics"
          description="How your spending changes over time and where it goes."
          actions={
            overview?.totalCount > 0 && (
              <div className="flex flex-col items-start gap-1 sm:items-end">
                <Button variant="secondary" onClick={exportAnalyticsToCSV}>
                  <Download size={16} aria-hidden="true" />
                  Export CSV
                </Button>
                <span className="text-ui text-ink-3">All-time categories and the last 6 months</span>
              </div>
            )
          }
        />

        {loading ? (
          <div className="space-y-6" aria-busy="true">
            <Skeleton className="h-32 rounded-surface" />
            <Skeleton className="h-80 rounded-surface" />
          </div>
        ) : !overview || overview.totalCount === 0 ? (
          <div className="rounded-surface border border-line bg-surface">
            <EmptyState
              title="Nothing to analyse yet"
              description="Once you have logged a few expenses, trends and categories show up here."
              action={<Button onClick={openAddExpense}>Add an expense</Button>}
            />
          </div>
        ) : (
          <>
            {/* One comparison strip; the change is the emphasis. */}
            <section aria-labelledby="comparison-heading" className="rounded-surface border border-line bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
                <h2 id="comparison-heading" className="text-h3 font-semibold text-ink">Compared with before</h2>
                <div role="radiogroup" aria-label="Compare by" className="flex rounded-control border border-line-strong p-0.5">
                  {PERIODS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      role="radio"
                      aria-checked={period === p.value}
                      onClick={() => setPeriod(p.value)}
                      className={`h-9 rounded-[6px] px-4 text-ui font-medium transition-colors ${
                        period === p.value ? 'bg-ink text-white' : 'text-ink-2 hover:text-ink'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <dl className="mt-4 grid divide-y divide-line border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="px-5 py-4 sm:px-6">
                  <dt className="text-ui text-ink-3">{periodInfo.current}</dt>
                  <dd className="mt-1 text-h3 font-semibold text-ink"><MoneyText amount={comparison?.current?.amount || 0} /></dd>
                </div>
                <div className="px-5 py-4 sm:px-6">
                  <dt className="text-ui text-ink-3">{periodInfo.previous}</dt>
                  <dd className="mt-1 text-h3 font-semibold text-ink-2"><MoneyText amount={comparison?.previous?.amount || 0} /></dd>
                </div>
                <div className="px-5 py-4 sm:px-6">
                  <dt className="text-ui text-ink-3">Change</dt>
                  <dd className={`mt-1 text-h2 font-semibold tabular-nums ${!hasPrevious ? 'text-ink-3' : change <= 0 ? 'text-positive' : 'text-negative'}`}>
                    {hasPrevious ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : 'No earlier data'}
                  </dd>
                </div>
              </dl>
            </section>

            <div className="grid gap-6 lg:grid-cols-5">
              <Card
                title={category === 'all' ? 'Spending by month' : `${formatCategory(category)} by month`}
                description="Last 6 months"
                className="lg:col-span-3"
                actions={
                  <Select
                    label="Category shown in chart"
                    hideLabel
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={[{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c.category, label: formatCategory(c.category) }))]}
                    className="w-44"
                  />
                }
              >
                <SpendingChart key={category} data={months} />
              </Card>

              <Card title="By category" description="All time. Pick one to chart it." className="lg:col-span-2">
                <ul className="space-y-1">
                  {categories.map((cat) => {
                    const share = total > 0 ? (cat.amount / total) * 100 : 0;
                    const selected = category === cat.category;
                    return (
                      <li key={cat.category}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setCategory(selected ? 'all' : cat.category)}
                          className={`-mx-2 block w-[calc(100%+1rem)] rounded-control px-2 py-2 text-left transition-colors ${selected ? 'bg-brand-soft' : 'hover:bg-canvas'}`}
                        >
                          <span className="flex items-baseline justify-between gap-3 text-ui">
                            <span className="flex min-w-0 items-center gap-2 text-ink">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: categoryColor(cat.category) }} aria-hidden="true" />
                              <span className="truncate">{formatCategory(cat.category)}</span>
                            </span>
                            <span className="shrink-0 text-ink">
                              <MoneyText amount={cat.amount} mono />
                              <span className="ml-2 inline-block w-10 text-right text-ink-3 tabular-nums">{share.toFixed(0)}%</span>
                            </span>
                          </span>
                          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-canvas" aria-hidden="true">
                            <span className="block h-full rounded-full" style={{ width: `${Math.max(share, 1)}%`, background: categoryColor(cat.category) }} />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4">
                  <div>
                    <dt className="text-ui text-ink-3">Personal</dt>
                    <dd className="mt-0.5 text-body font-medium text-ink"><MoneyText amount={personal} /></dd>
                  </div>
                  <div>
                    <dt className="text-ui text-ink-3">You paid in groups</dt>
                    <dd className="mt-0.5 text-body font-medium text-ink"><MoneyText amount={groupShare} /></dd>
                  </div>
                </dl>
              </Card>
            </div>

            <Card title="Largest expenses" description="Your five biggest, all time" padded={false}>
              <table className="w-full text-ui">
                <caption className="sr-only">Your five largest expenses</caption>
                <thead>
                  <tr className="border-b border-line text-left text-meta uppercase tracking-wide text-ink-3">
                    <th scope="col" className="px-5 py-3 font-medium sm:px-6">Description</th>
                    <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">Category</th>
                    <th scope="col" className="hidden px-5 py-3 font-medium md:table-cell">Date</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium sm:px-6">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {topExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="px-5 py-3 text-ink sm:px-6">
                        {expense.description || formatCategory(expense.category)}
                        <span className="mt-0.5 block text-ink-3 sm:hidden">{formatCategory(expense.category)} · {formatDate(expense.date)}</span>
                      </td>
                      <td className="hidden px-5 py-3 text-ink-2 sm:table-cell">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: categoryColor(expense.category) }} aria-hidden="true" />
                          {formatCategory(expense.category)}
                        </span>
                      </td>
                      <td className="hidden whitespace-nowrap px-5 py-3 text-ink-3 md:table-cell">{formatDate(expense.date)}</td>
                      <td className="px-5 py-3 text-right sm:px-6"><MoneyText amount={expense.amount} mono className="text-ink" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
