'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from '../../components/Navigation';
import { 
  getSpendingOverview, 
  getMonthlyTrends, 
  getTopExpenses,
  getGroupAnalytics,
  getGoalsProgressAnalytics,
  getComparisonData 
} from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  PieChart,
  BarChart3,
  Target,
  Users2,
  Download,
  FileSpreadsheet
} from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  const [groupAnalytics, setGroupAnalytics] = useState([]);
  const [goalsProgress, setGoalsProgress] = useState(null);
  const [comparison, setComparison] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, trendsRes, topExpensesRes, groupAnalyticsRes, goalsRes, comparisonRes] = await Promise.all([
        getSpendingOverview(),
        getMonthlyTrends(6),
        getTopExpenses(5),
        getGroupAnalytics(),
        getGoalsProgressAnalytics(),
        getComparisonData(timeRange)
      ]);

      if (overviewRes?.success) setOverview(overviewRes.data);
      if (trendsRes?.success) setTrends(trendsRes.data);
      if (topExpensesRes?.success) setTopExpenses(topExpensesRes.data);
      if (groupAnalyticsRes?.success) setGroupAnalytics(groupAnalyticsRes.data);
      if (goalsRes?.success) setGoalsProgress(goalsRes.data);
      if (comparisonRes?.success) setComparison(comparisonRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Unable to fetch analytics dataset');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const exportAnalyticsToCSV = () => {
    if (!overview || overview.totalCount === 0) {
      toast.error('No analytics data available to export');
      return;
    }

    let csvContent = 'VAULTLY ANALYTICS EXPORT\n';
    csvContent += `Generated,${new Date().toISOString()}\n`;
    csvContent += `Period,${timeRange}\n\n`;
    
    csvContent += 'CATEGORY BREAKDOWN\nCategory,Amount,Percentage\n';
    if (overview.categoryBreakdown && overview.categoryBreakdown.length > 0) {
      overview.categoryBreakdown.forEach((cat) => {
        const pct = overview.totalAmount > 0 ? ((cat.amount / overview.totalAmount) * 100).toFixed(1) : 0;
        csvContent += `"${cat.category}",${cat.amount.toFixed(2)},${pct}%\n`;
      });
    }

    csvContent += '\nMONTHLY TRENDS\nMonth,Amount,Transactions\n';
    if (trends && trends.length > 0) {
      trends.forEach((t) => {
        csvContent += `"${t.month}",${t.totalAmount.toFixed(2)},${t.count}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vaultly_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Analytics exported to CSV');
  };

  const maxTrend = Math.max(...trends.map((m) => m.totalAmount || 0), 1);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Financial Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Period-over-period comparisons, category shares, and spending velocity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportAnalyticsToCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-xs"
            >
              <FileSpreadsheet size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl w-fit">
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              timeRange === 'month'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Period
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              timeRange === 'year'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annual Period
          </button>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-slate-200/80 rounded-2xl" />
              <div className="h-32 bg-slate-200/80 rounded-2xl" />
              <div className="h-32 bg-slate-200/80 rounded-2xl" />
            </div>
            <div className="h-72 bg-slate-200/80 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Comparison Cards */}
            {comparison && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Current {comparison.period === 'month' ? 'Month' : 'Year'}
                  </span>
                  <p className="text-3xl font-bold text-slate-900 tabular-nums">
                    ${comparison.current.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-medium">{comparison.current.count} logged items</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Previous {comparison.period === 'month' ? 'Month' : 'Year'}
                  </span>
                  <p className="text-3xl font-bold text-slate-900 tabular-nums">
                    ${comparison.previous.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-medium">{comparison.previous.count} logged items</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Period Variance
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      comparison.change.percentage <= 0 
                        ? 'text-teal-700 bg-teal-50 border border-teal-100' 
                        : 'text-amber-700 bg-amber-50 border border-amber-100'
                    }`}>
                      {comparison.change.percentage <= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                      <span>{Math.abs(comparison.change.percentage).toFixed(1)}%</span>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 tabular-nums">
                    {comparison.change.amount >= 0 ? '+' : '-'}${Math.abs(comparison.change.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    {comparison.change.amount >= 0 ? 'Increase compared to prior cycle' : 'Savings compared to prior cycle'}
                  </p>
                </div>
              </div>
            )}

            {/* Middle Grid: Category Distribution & Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Category Breakdown</h2>
                    <p className="text-xs text-slate-500">Distribution across active categories</p>
                  </div>
                  <PieChart size={16} className="text-slate-400" />
                </div>

                {!overview || overview.categoryBreakdown.length === 0 ? (
                  <p className="text-center py-12 text-xs text-slate-400">No category data recorded</p>
                ) : (
                  <div className="space-y-4">
                    {overview.categoryBreakdown.map((cat, index) => {
                      const percentage = overview.totalAmount > 0 
                        ? (cat.amount / overview.totalAmount) * 100 
                        : 0;

                      return (
                        <div key={index} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">{cat.category}</span>
                            <div className="flex items-center gap-1.5 tabular-nums">
                              <span className="font-bold text-slate-900">${cat.amount.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-400">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full bg-slate-900 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Monthly Trend Bars */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Monthly Trajectory</h2>
                    <p className="text-xs text-slate-500">Total volume logged per calendar month</p>
                  </div>
                  <BarChart3 size={16} className="text-slate-400" />
                </div>

                {trends.length === 0 ? (
                  <p className="text-center py-12 text-xs text-slate-400">No trend history available</p>
                ) : (
                  <div className="space-y-4">
                    {trends.map((m, idx) => {
                      const percentage = maxTrend > 0 ? (m.totalAmount / maxTrend) * 100 : 0;
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">{m.month}</span>
                            <div className="flex items-center gap-2 tabular-nums">
                              <span className="font-bold text-slate-900">${m.totalAmount.toFixed(2)}</span>
                              <span className="text-[10px] text-slate-400">({m.count} items)</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full bg-teal-600 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Top 5 Expenses Table */}
            {topExpenses.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
                <div className="mb-4">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">Largest Single Outlays</h2>
                  <p className="text-xs text-slate-500">Highest value transactions on record</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topExpenses.map((exp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {exp.description}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 font-medium">
                            {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                            ${exp.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
