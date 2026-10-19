"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Eye, 
  EyeOff, 
  UtensilsCrossed, 
  Car, 
  Clapperboard, 
  Lightbulb, 
  ShoppingCart, 
  Stethoscope, 
  DollarSign,
  ArrowUpRight,
  Target,
  Users2,
  Receipt,
  Calendar,
  Sparkles,
  PieChart
} from "lucide-react";
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

function getCategoryIcon(category) {
  const normalized = category?.toLowerCase() || '';
  if (normalized.includes('food') || normalized.includes('dining')) {
    return <UtensilsCrossed size={16} className="text-amber-600" />;
  }
  if (normalized.includes('transport')) {
    return <Car size={16} className="text-sky-600" />;
  }
  if (normalized.includes('entertainment')) {
    return <Clapperboard size={16} className="text-purple-600" />;
  }
  if (normalized.includes('utilities') || normalized.includes('bill')) {
    return <Lightbulb size={16} className="text-yellow-600" />;
  }
  if (normalized.includes('shopping')) {
    return <ShoppingCart size={16} className="text-rose-600" />;
  }
  if (normalized.includes('health')) {
    return <Stethoscope size={16} className="text-emerald-600" />;
  }
  return <DollarSign size={16} className="text-teal-600" />;
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
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
      toast.error('Unable to fetch latest metrics');
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
    toast.success('Expense recorded successfully');
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/70">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
          <div className="h-32 bg-slate-200/80 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-28 bg-slate-200/80 rounded-2xl" />
            <div className="h-28 bg-slate-200/80 rounded-2xl" />
            <div className="h-28 bg-slate-200/80 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72 bg-slate-200/80 rounded-2xl" />
            <div className="h-72 bg-slate-200/80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const overview = dashboardData?.overview || { totalAmount: 0, totalCount: 0, categoryBreakdown: [] };
  const comparison = dashboardData?.comparison || { current: { amount: 0 }, previous: { amount: 0 }, change: { amount: 0, percentage: 0 } };
  const trends = dashboardData?.trends || [];
  const goalsProgress = dashboardData?.goalsProgress || { totalGoals: 0, completed: 0, totalSaved: 0, totalTarget: 0, overallProgress: 0 };
  const groupAnalytics = dashboardData?.groupAnalytics || [];

  const maxTrend = Math.max(...trends.map((t) => t.totalAmount || 0), 1);
  const hasExpenses = overview.totalCount > 0 || recentExpenses.length > 0;
  const isSpendingDown = comparison.change.percentage <= 0;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Financial performance & expense distribution for {user?.full_name || 'your account'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
            >
              <Plus size={16} strokeWidth={2.2} />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {!hasExpenses ? (
          /* Clean, Professional Empty State (Zero Emojis) */
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
              <Sparkles size={28} strokeWidth={1.8} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Welcome to Vaultly</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Begin managing your personal and shared group finances. Log your first expense or establish a savings target to populate your analytics.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <Receipt className="text-teal-600 mb-2" size={20} />
                <h3 className="text-xs font-bold text-slate-900">Track Outlays</h3>
                <p className="text-[11px] text-slate-500 mt-1">Categorize individual spending and monitor monthly budgets.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <Users2 className="text-sky-600 mb-2" size={20} />
                <h3 className="text-xs font-bold text-slate-900">Shared Groups</h3>
                <p className="text-[11px] text-slate-500 mt-1">Split rent, vacations, or household utilities seamlessly.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <Target className="text-purple-600 mb-2" size={20} />
                <h3 className="text-xs font-bold text-slate-900">Savings Goals</h3>
                <p className="text-[11px] text-slate-500 mt-1">Set progressive milestones and log contributions toward targets.</p>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                <Plus size={16} />
                <span>Log Your First Transaction</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Card 1: Total Spending */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    <span>Total Outflow</span>
                    <button
                      onClick={() => setHideBalance(!hideBalance)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 transition"
                      aria-label="Toggle amount visibility"
                    >
                      {hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
                    {hideBalance ? "••••••" : `$${overview.totalAmount.toFixed(2)}`}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-3">
                  <span>Logged entries</span>
                  <span className="font-semibold text-slate-800 tabular-nums">{overview.totalCount} transactions</span>
                </div>
              </div>

              {/* Card 2: Current Month Spending */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    <span>This Month</span>
                    <div className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isSpendingDown 
                        ? 'text-teal-700 bg-teal-50 border border-teal-100' 
                        : 'text-amber-700 bg-amber-50 border border-amber-100'
                    }`}>
                      {isSpendingDown ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                      <span>{Math.abs(comparison.change.percentage).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
                    ${comparison.current.amount.toFixed(2)}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-3">
                  <span>Previous month</span>
                  <span className="font-semibold text-slate-800 tabular-nums">${comparison.previous.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Card 3: Goals Summary */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    <span>Goal Progress</span>
                    <Link href="/goals" className="text-teal-700 hover:text-teal-800 text-[11px] font-semibold flex items-center gap-0.5">
                      <span>View</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
                    {goalsProgress.overallProgress.toFixed(0)}%
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-3">
                  <span>Saved</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    ${goalsProgress.totalSaved.toFixed(0)} / ${goalsProgress.totalTarget.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Card 4: Active Groups */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    <span>Shared Groups</span>
                    <Link href="/groups" className="text-teal-700 hover:text-teal-800 text-[11px] font-semibold flex items-center gap-0.5">
                      <span>View</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
                    {groupAnalytics.length}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-3">
                  <span>Total group share</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    ${groupAnalytics.reduce((s, g) => s + (g.userAmount || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Mid Grid: Spending Trends Bar Graph & Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trends Bar Graph (2 columns) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Monthly Trajectory</h2>
                    <p className="text-xs text-slate-500">Expenditure overview over the past 6 months</p>
                  </div>
                  <span className="text-xs font-medium text-slate-500">Aggregated server data</span>
                </div>

                {trends.length === 0 ? (
                  <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                    No trend history available yet
                  </div>
                ) : (
                  <div className="flex items-end justify-between h-56 gap-3 pt-6 border-b border-slate-100 pb-2">
                    {trends.map((item, idx) => {
                      const heightPercent = maxTrend > 0 ? (item.totalAmount / maxTrend) * 100 : 0;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          <div className="relative w-full flex justify-center items-end h-full">
                            <div 
                              className="w-full max-w-[42px] rounded-t-lg bg-slate-900 group-hover:bg-teal-600 transition-all duration-300 relative"
                              style={{ 
                                height: `${Math.max(6, heightPercent)}%` 
                              }}
                            >
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-slate-900 text-white text-[10px] font-semibold tabular-nums whitespace-nowrap transition-opacity pointer-events-none shadow-md z-10">
                                ${item.totalAmount.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category Breakdown (1 column) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Category Split</h2>
                    <PieChart size={16} className="text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500 mb-5">Top spending categories by proportion</p>

                  {overview.categoryBreakdown.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400">
                      No categorical data logged
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {overview.categoryBreakdown.slice(0, 5).map((cat, i) => {
                        const proportion = overview.totalAmount > 0 
                          ? ((cat.amount / overview.totalAmount) * 100) 
                          : 0;
                        return (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-800">{cat.category}</span>
                              <div className="flex items-center gap-1.5 tabular-nums">
                                <span className="font-bold text-slate-900">${cat.amount.toFixed(2)}</span>
                                <span className="text-[10px] text-slate-400">({proportion.toFixed(0)}%)</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${proportion}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 text-center">
                  <Link href="/reports" className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1">
                    <span>Open Detailed Analytics</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Section: Recent Transactions */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Activity</h2>
                  <p className="text-xs text-slate-500">Latest entries posted to your account</p>
                </div>
                <Link
                  href="/expenses"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 hover:underline"
                >
                  <span>View All Records</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              {recentExpenses.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No recent activity found
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentExpenses.map((expense) => {
                    const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <div key={expense.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            {getCategoryIcon(expense.category)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 leading-tight">
                              {expense.description || expense.category}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-slate-500 font-medium">{formattedDate}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium uppercase tracking-wider">
                                {expense.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900 tabular-nums">
                            -${parseFloat(expense.amount).toFixed(2)}
                          </p>
                          {expense.groupId && (
                            <span className="text-[10px] text-teal-700 font-medium">Shared</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
