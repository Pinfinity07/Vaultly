'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Edit3, 
  Trash2, 
  RotateCcw,
  UtensilsCrossed,
  Car,
  Clapperboard,
  Lightbulb,
  ShoppingCart,
  Stethoscope,
  DollarSign
} from 'lucide-react';
import { getUserExpenses, deleteExpense, createExpense } from '../../lib/api';
import toast from 'react-hot-toast';
import AddExpenseModal from '../../components/AddExpenseModal';
import UpdateExpenseModal from '../../components/UpdateExpenseModal';
import Navigation from '../../components/Navigation';

function getCategoryIcon(category) {
  const normalized = category?.toLowerCase() || '';
  if (normalized.includes('food')) return <UtensilsCrossed size={14} className="text-amber-600" />;
  if (normalized.includes('transport')) return <Car size={14} className="text-sky-600" />;
  if (normalized.includes('entertainment')) return <Clapperboard size={14} className="text-purple-600" />;
  if (normalized.includes('utilities')) return <Lightbulb size={14} className="text-yellow-600" />;
  if (normalized.includes('shopping')) return <ShoppingCart size={14} className="text-rose-600" />;
  if (normalized.includes('health')) return <Stethoscope size={14} className="text-emerald-600" />;
  return <DollarSign size={14} className="text-teal-600" />;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery,
        sortBy,
        sortOrder,
        category: filterCategory,
        startDate: dateRange.start,
        endDate: dateRange.end
      };

      const response = await getUserExpenses(params);
      if (response?.error) {
        toast.error('Failed to fetch expenses');
      } else {
        setExpenses(response?.expenses || []);
        if (response?.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to load expense records');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, sortBy, sortOrder, filterCategory, dateRange]);

  useEffect(() => {
    fetchExpenses();
    const handleRemoteAdded = () => {
      fetchExpenses();
    };
    window.addEventListener("expenseAdded", handleRemoteAdded);
    return () => window.removeEventListener("expenseAdded", handleRemoteAdded);
  }, [fetchExpenses]);

  const handleAdd = async (newExpense) => {
    try {
      const response = await createExpense(newExpense);
      if (response?.error) {
        toast.error('Failed to add expense');
        return;
      }
      await fetchExpenses();
      toast.success('Expense recorded');
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Permanently remove this expense entry?')) {
      const response = await deleteExpense(id);
      if (response?.error) {
        toast.error('Failed to delete expense');
      } else {
        await fetchExpenses();
        toast.success('Expense deleted');
      }
    }
  };

  const handleUpdate = (expense) => {
    setSelectedExpense(expense);
    setIsUpdateModalOpen(true);
  };

  const handleExpenseUpdated = async () => {
    await fetchExpenses();
    toast.success('Expense updated');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setDateRange({ start: '', end: '' });
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Expense Log
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Filter, search, and audit your personal & group expenses
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs self-start sm:self-auto"
          >
            <Plus size={16} strokeWidth={2.2} />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Search, Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by description or category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15 transition placeholder:text-slate-400"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                  showFilters || filterCategory !== 'all' || dateRange.start || dateRange.end
                    ? 'border-teal-600/40 bg-teal-50/60 text-teal-900'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
                {(filterCategory !== 'all' || dateRange.start || dateRange.end) && (
                  <span className="w-2 h-2 rounded-full bg-teal-600" />
                )}
              </button>
            </div>
          </div>

          {/* Expandable Filter Panel */}
          {showFilters && (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-teal-600 transition"
                >
                  <option value="all">All Categories</option>
                  <option value="food">Food & Dining</option>
                  <option value="transport">Transportation</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="utilities">Utilities</option>
                  <option value="shopping">Shopping</option>
                  <option value="healthcare">Healthcare</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Sort Attribute</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-teal-600 transition"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="category">Category</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-teal-600 transition"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
                >
                  <RotateCcw size={13} />
                  <span>Reset All</span>
                </button>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">From Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange((prev) => ({ ...prev, start: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-teal-600 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">To Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange((prev) => ({ ...prev, end: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs focus:bg-white focus:border-teal-600 transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Expenses Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Description</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  <th className="py-3 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Loading records...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No expense records found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => {
                    const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <tr key={expense.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap font-medium">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-900 leading-tight">
                            {expense.description || 'Unspecified'}
                          </div>
                          {expense.groupId && (
                            <span className="text-[10px] text-teal-700 font-medium">Group Expense</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {getCategoryIcon(expense.category)}
                            <span>{expense.category}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          ${expense.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleUpdate(expense)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                              title="Edit Expense"
                              aria-label="Edit Expense"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Delete Expense"
                              aria-label="Delete Expense"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-medium">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} entries
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 font-semibold text-slate-900 tabular-nums">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExpenseAdded={handleAdd}
      />

      <UpdateExpenseModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedExpense(null);
        }}
        onExpenseUpdated={handleExpenseUpdated}
        expense={selectedExpense}
      />
    </div>
  );
}