"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff, Plus } from "lucide-react";
import {
  getCurrentUser,
  getDashboardStats,
  getUserExpenses,
  createExpense
} from "../../lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navigation from "../../components/Navigation";
import AddExpenseModal from "../../components/AddExpenseModal";
import SpendingChart from "../../components/SpendingChart";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import MoneyText, { useFormatMoney } from "../../components/ui/MoneyText";
import useCountUp from "../../hooks/useCountUp";
import { usePreferences } from "../../lib/preferences";
import { categoryColor, formatCategory } from "../../lib/categories";
import { lastSixMonths } from "../../lib/months";

function formatDay(date) {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const hideAmounts = usePreferences((s) => s.hideAmounts);
  const setHideAmounts = usePreferences((s) => s.setHideAmounts);
  const format = useFormatMoney();
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      const userRes = await getCurrentUser();
      if (userRes?.error || !userRes?.user) {
        router.push('/login');
        return;
      }
      setUser(userRes.user);

      const [statsRes, expensesRes] = await Promise.all([
        getDashboardStats(),
        getUserExpenses({ page: 1, limit: 5 })
      ]);

      if (statsRes?.success && statsRes.data) {
        setDashboardData(statsRes.data);
      }
      if (expensesRes?.expenses) {
        setRecentExpenses(expensesRes.expenses);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Could not load your latest numbers');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
    const handleRemoteAdded = () => {
      loadData();
    };
    window.addEventListener("expenseAdded", handleRemoteAdded);
    return () => window.removeEventListener("expenseAdded", handleRemoteAdded);
  }, [loadData]);

  const handleExpenseAdded = async (expenseData) => {
    const res = await createExpense(expenseData);
    if (res?.error) {
      toast.error(res.error || 'Failed to record expense');
      return;
    }
    toast.success('Expense added');
    await loadData();
  };

  const overview = dashboardData?.overview || { totalAmount: 0, totalCount: 0, categoryBreakdown: [] };
  const comparison = dashboardData?.comparison || { current: { amount: 0 }, previous: { amount: 0 }, change: { amount: 0, percentage: 0 } };
  const goalsProgress = dashboardData?.goalsProgress || { totalGoals: 0, completed: 0, totalSaved: 0, totalTarget: 0, overallProgress: 0 };
  const groupAnalytics = dashboardData?.groupAnalytics || [];
  const months = useMemo(() => lastSixMonths(dashboardData?.trends || []), [dashboardData]);

  const thisMonth = comparison.current.amount;
  const shownThisMonth = useCountUp(thisMonth, { enabled: !hideAmounts && !loading });

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main id="main-content" className="mx-auto max-w-6xl space-y-6 px-4 pt-8 sm:px-6 lg:px-8" aria-busy="true">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-52 w-full rounded-surface" />
          <div className="grid gap-6 lg:grid-cols-5">
            <Skeleton className="h-80 rounded-surface lg:col-span-3" />
            <Skeleton className="h-80 rounded-surface lg:col-span-2" />
          </div>
        </main>
      </div>
    );
  }

  const hasExpenses = overview.totalCount > 0 || recentExpenses.length > 0;
  const firstName = (user?.full_name || "").split(" ")[0];
  const previousMonthName = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleDateString("en-US", { month: "long" });
  const percentage = comparison.change.percentage;
  const spendingDown = percentage <= 0;
  const groupShare = groupAnalytics.reduce((s, g) => s + (g.userAmount || 0), 0);

  // Top five categories by amount, everything else folded into "Other".
  const categories = [...overview.categoryBreakdown].sort((a, b) => b.amount - a.amount);
  const topCategories = categories.slice(0, 5);
  const otherAmount = categories.slice(5).reduce((s, c) => s + c.amount, 0);

  return (
    <div className="min-h-screen">
      <Navigation />

      <main id="main-content" className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-h2 font-semibold text-ink">{firstName ? `Hi, ${firstName}` : "Dashboard"}</h1>
            <p className="mt-1 text-body text-ink-3">Here is where your money is going.</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setHideAmounts(!hideAmounts)}
            aria-pressed={hideAmounts}
          >
            {hideAmounts ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}
            {hideAmounts ? "Show amounts" : "Hide amounts"}
          </Button>
        </header>

        {!hasExpenses ? (
          <Card>
            <EmptyState
              title="No expenses yet"
              description="Add your first expense and this page will show where your money goes each month."
              action={
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus size={16} aria-hidden="true" />
                  Add your first expense
                </Button>
              }
            />
          </Card>
        ) : (
          <>
            {/* The one figure that matters most, then a quieter row of supporting numbers. */}
            <section aria-labelledby="this-month-heading" className="rounded-surface border border-line bg-surface">
              <div className="p-5 sm:p-8">
                <h2 id="this-month-heading" className="text-body font-medium text-ink-3">Spent so far this month</h2>
                <p className="mt-2 text-[44px] font-semibold leading-none tracking-tight text-ink tabular-nums sm:text-hero">
                  {hideAmounts ? <MoneyText amount={thisMonth} /> : format(shownThisMonth)}
                </p>
                {comparison.previous.amount > 0 ? (
                  <p className={`mt-3 text-body ${spendingDown ? "text-positive" : "text-negative"}`}>
                    {spendingDown
                      ? <ArrowDownRight size={18} className="mr-1 inline -mt-0.5" aria-hidden="true" />
                      : <ArrowUpRight size={18} className="mr-1 inline -mt-0.5" aria-hidden="true" />}
                    {Math.abs(percentage).toFixed(0)}% {spendingDown ? "less" : "more"} than all of {previousMonthName}
                    <span className="text-ink-3">
                      {" "}(<MoneyText amount={comparison.previous.amount} />)
                    </span>
                  </p>
                ) : (
                  <p className="mt-3 text-body text-ink-3">Nothing logged in {previousMonthName} to compare with.</p>
                )}
              </div>

              <dl className="grid divide-y divide-line border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="px-5 py-4 sm:px-8">
                  <dt className="text-ui text-ink-3">All time</dt>
                  <dd className="mt-1 text-body text-ink">
                    <MoneyText amount={overview.totalAmount} className="font-medium" />
                    <span className="text-ink-3"> · {overview.totalCount} expenses</span>
                  </dd>
                </div>
                <div className="px-5 py-4 sm:px-8">
                  <dt className="text-ui text-ink-3">
                    <Link href="/goals" className="rounded-control hover:text-ink hover:underline">Savings goals</Link>
                  </dt>
                  <dd className="mt-1 text-body text-ink">
                    {goalsProgress.totalGoals > 0 ? (
                      <>
                        <span className="font-medium tabular-nums">{goalsProgress.overallProgress.toFixed(0)}% saved</span>
                        <span className="text-ink-3">
                          {" "}· <MoneyText amount={goalsProgress.totalSaved} /> of <MoneyText amount={goalsProgress.totalTarget} />
                        </span>
                      </>
                    ) : (
                      <span className="text-ink-3">No goals yet</span>
                    )}
                  </dd>
                </div>
                <div className="px-5 py-4 sm:px-8">
                  <dt className="text-ui text-ink-3">
                    <Link href="/groups" className="rounded-control hover:text-ink hover:underline">Shared groups</Link>
                  </dt>
                  <dd className="mt-1 text-body text-ink">
                    {groupAnalytics.length > 0 ? (
                      <>
                        <span className="font-medium">
                          {groupAnalytics.length} {groupAnalytics.length === 1 ? "group" : "groups"}
                        </span>
                        <span className="text-ink-3">
                          {" "}· you paid <MoneyText amount={groupShare} />
                        </span>
                      </>
                    ) : (
                      <span className="text-ink-3">Not in a group yet</span>
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <div className="grid gap-6 lg:grid-cols-5">
              <Card title="Spending by month" description="Last 6 months. Point at or select a bar to see its total." className="lg:col-span-3">
                <SpendingChart data={months} />
              </Card>

              <Card
                title="Where it went"
                description="All time, by category"
                className="lg:col-span-2"
                actions={<Link href="/reports" className="flex h-10 items-center rounded-control px-2 text-ui font-medium text-brand hover:underline">Analytics</Link>}
              >
                {topCategories.length === 0 ? (
                  <p className="text-ui text-ink-3">No categories yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {[...topCategories, ...(otherAmount > 0 ? [{ category: "Other", amount: otherAmount, other: true }] : [])].map((cat) => {
                      const share = overview.totalAmount > 0 ? (cat.amount / overview.totalAmount) * 100 : 0;
                      const color = cat.other ? "#94a3b8" : categoryColor(cat.category);
                      return (
                        <li key={cat.category}>
                          <div className="flex items-baseline justify-between gap-3 text-ui">
                            <span className="flex min-w-0 items-center gap-2 text-ink">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
                              <span className="truncate">{cat.other ? "Other" : formatCategory(cat.category)}</span>
                            </span>
                            <span className="shrink-0 text-ink">
                              <MoneyText amount={cat.amount} mono />
                              <span className="ml-2 inline-block w-10 text-right text-ink-3 tabular-nums">{share.toFixed(0)}%</span>
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas" aria-hidden="true">
                            <div className="h-full rounded-full" style={{ width: `${Math.max(share, 1)}%`, background: color }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            </div>

            <Card
              title="Recent expenses"
              padded={false}
              actions={<Link href="/expenses" className="flex h-10 items-center rounded-control px-2 text-ui font-medium text-brand hover:underline">View all</Link>}
            >
              <ul className="divide-y divide-line">
                {recentExpenses.map((expense) => (
                  <li key={expense.id} className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-body text-ink">{expense.description || formatCategory(expense.category)}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-ui text-ink-3">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: categoryColor(expense.category) }} aria-hidden="true" />
                          {formatCategory(expense.category)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={expense.date}>{formatDay(expense.date)}</time>
                        {expense.groupId && <Badge>Group</Badge>}
                      </p>
                    </div>
                    <MoneyText amount={-parseFloat(expense.amount)} mono className="shrink-0 text-body text-ink" />
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </main>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </div>
  );
}
