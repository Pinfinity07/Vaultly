'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, SlidersHorizontal, Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getUserExpenses, deleteExpense } from '../../lib/api';
import toast from 'react-hot-toast';
import UpdateExpenseModal from '../../components/UpdateExpenseModal';
import Navigation, { openAddExpense } from '../../components/Navigation';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Field from '../../components/ui/Field';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Skeleton from '../../components/ui/Skeleton';
import MoneyText from '../../components/ui/MoneyText';
import useCategories from '../../lib/useCategories';
import { undoToast } from '../../lib/undoToast';
import { categoryColor, formatCategory } from '../../lib/categories';

const PAGE_SIZE = 10;

// One control for the API's sortBy + sortOrder pair.
const SORTS = [
  { value: 'date:desc', label: 'Newest first' },
  { value: 'date:asc', label: 'Oldest first' },
  { value: 'amount:desc', label: 'Highest amount' },
  { value: 'amount:asc', label: 'Lowest amount' },
  { value: 'category:asc', label: 'Category, A to Z' },
];

const DEFAULT_FILTERS = { category: 'all', sort: 'date:desc', start: '', end: '' };

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, limit: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasAnyExpenses, setHasAnyExpenses] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [hiddenIds, setHiddenIds] = useState(() => new Set());
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const searchRef = useRef(null);
  const { categories } = useCategories();

  const isFiltered = Boolean(searchQuery) || filters.category !== 'all' || filters.start || filters.end;

  // Search as you type, without a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, sortOrder] = filters.sort.split(':');
      const response = await getUserExpenses({
        page: currentPage,
        limit: PAGE_SIZE,
        search: searchQuery,
        sortBy,
        sortOrder,
        category: filters.category,
        startDate: filters.start,
        endDate: filters.end,
      });
      if (response?.error) {
        toast.error('Could not load your expenses');
      } else {
        setExpenses(response?.expenses || []);
        if (response?.pagination) setPagination(response.pagination);
        if (!isFiltered) setHasAnyExpenses((response?.pagination?.totalCount ?? response?.expenses?.length ?? 0) > 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load your expenses');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filters, isFiltered]);

  useEffect(() => {
    fetchExpenses();
    window.addEventListener('expenseAdded', fetchExpenses);
    return () => window.removeEventListener('expenseAdded', fetchExpenses);
  }, [fetchExpenses]);

  // "/" jumps to search, as on many list pages.
  useEffect(() => {
    const handleKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  // Hide the row straight away; the delete is sent only if Undo is not pressed in time.
  const handleDelete = (expense) => {
    setHiddenIds((prev) => new Set(prev).add(expense.id));
    const unhide = () =>
      setHiddenIds((prev) => {
        const next = new Set(prev);
        next.delete(expense.id);
        return next;
      });

    undoToast(`Deleted "${expense.description || formatCategory(expense.category)}"`, {
      onUndo: unhide,
      onCommit: async () => {
        const response = await deleteExpense(expense.id);
        if (response?.error) {
          toast.error('Could not delete that expense');
          unhide();
          return;
        }
        await fetchExpenses();
        unhide();
        window.dispatchEvent(new CustomEvent('expenseDeleted'));
      },
    });
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setIsUpdateModalOpen(true);
  };

  const handleExpenseUpdated = async () => {
    await fetchExpenses();
    toast.success('Expense updated');
  };

  const visible = expenses.filter((e) => !hiddenIds.has(e.id));
  const firstShown = (pagination.currentPage - 1) * pagination.limit + 1;
  const lastShown = Math.min(pagination.currentPage * pagination.limit, pagination.totalCount);

  const rowActions = (expense) => (
    <div className="flex justify-end gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
      <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)} aria-label={`Edit ${expense.description || formatCategory(expense.category)}`}>
        <Pencil size={16} aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleDelete(expense)} aria-label={`Delete ${expense.description || formatCategory(expense.category)}`} className="hover:text-negative">
        <Trash2 size={16} aria-hidden="true" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navigation />

      <main id="main-content" className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <PageHeader title="Expenses" description="Everything you have logged, personal and shared." />

        {/* Filters */}
        <section aria-label="Search and filters" className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
              <label htmlFor="expense-search" className="sr-only">Search expenses</label>
              <input
                id="expense-search"
                ref={searchRef}
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by description or category"
                aria-keyshortcuts="/"
                className="h-10 w-full rounded-control border border-line-strong bg-surface pl-9 pr-10 text-ui text-ink placeholder:text-ink-4 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand focus-visible:outline-none"
              />
              {!searchInput && (
                <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-canvas px-1.5 font-sans text-meta text-ink-3 md:block" aria-hidden="true">/</kbd>
              )}
            </div>
            <Button variant="secondary" className="md:hidden" onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters} aria-controls="expense-filters">
              <SlidersHorizontal size={16} aria-hidden="true" />
              Filters
            </Button>
          </div>

          <div id="expense-filters" className={`${showFilters ? 'grid' : 'hidden'} gap-3 sm:grid-cols-2 md:grid md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:items-end`}>
            <Select
              label="Category"
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              options={[{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: formatCategory(c) }))]}
            />
            <Select label="Sort" value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} options={SORTS} />
            <Field label="From" type="date" value={filters.start} max={filters.end || undefined} onChange={(e) => setFilter('start', e.target.value)} />
            <Field label="To" type="date" value={filters.end} min={filters.start || undefined} onChange={(e) => setFilter('end', e.target.value)} />
            <Button variant="ghost" onClick={resetFilters} disabled={!isFiltered && filters.sort === DEFAULT_FILTERS.sort}>
              Clear
            </Button>
          </div>
        </section>

        <section aria-label="Expense list" aria-busy={loading} className="rounded-surface border border-line bg-surface">
          {loading && visible.length === 0 ? (
            <ul className="divide-y divide-line" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </li>
              ))}
            </ul>
          ) : visible.length === 0 ? (
            hasAnyExpenses && isFiltered ? (
              <EmptyState
                title="No expenses match"
                description="Try a different search, category or date range."
                action={<Button variant="secondary" onClick={resetFilters}>Clear filters</Button>}
              />
            ) : (
              <EmptyState
                title="No expenses yet"
                description="Add what you spend and it will show up here, newest first."
                action={
                  <Button onClick={openAddExpense}>
                    <Plus size={16} aria-hidden="true" />
                    Add your first expense
                  </Button>
                }
              />
            )
          ) : (
            <>
              {/* Phones: stacked rows */}
              <ul className="divide-y divide-line md:hidden">
                {visible.map((expense) => (
                  <li key={expense.id} className="flex items-start justify-between gap-3 py-3 pl-4 pr-2">
                    <div className="min-w-0 pt-0.5">
                      <p className="truncate text-body text-ink">{expense.description || formatCategory(expense.category)}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-ui text-ink-3">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: categoryColor(expense.category) }} aria-hidden="true" />
                          {formatCategory(expense.category)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={expense.date}>{formatDate(expense.date)}</time>
                        {expense.groupId && <Badge>Group</Badge>}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end">
                      <MoneyText amount={expense.amount} mono className="pr-2 pt-0.5 text-body text-ink" />
                      {rowActions(expense)}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Tablet and up: table with a sticky header */}
              <table className="hidden w-full text-ui md:table">
                <caption className="sr-only">
                  Your expenses{isFiltered ? ', filtered' : ''}, page {pagination.currentPage} of {pagination.totalPages}
                </caption>
                <thead className="sticky top-16 z-10 bg-surface">
                  <tr className="border-b border-line text-left text-meta font-medium uppercase tracking-wide text-ink-3">
                    <th scope="col" className="w-36 px-5 py-3 font-medium">Date</th>
                    <th scope="col" className="px-5 py-3 font-medium">Description</th>
                    <th scope="col" className="px-5 py-3 font-medium">Category</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">Amount</th>
                    <th scope="col" className="w-28 px-3 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map((expense) => (
                    <tr key={expense.id} className="group hover:bg-canvas/70">
                      <td className="whitespace-nowrap px-5 py-3 text-ink-3">
                        <time dateTime={expense.date}>{formatDate(expense.date)}</time>
                      </td>
                      <td className="px-5 py-3 text-ink">
                        <span className="flex items-center gap-2">
                          {expense.description || <span className="text-ink-3">No description</span>}
                          {expense.groupId && <Badge>Group</Badge>}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-2">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: categoryColor(expense.category) }} aria-hidden="true" />
                          {formatCategory(expense.category)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <MoneyText amount={expense.amount} mono className="text-ink" />
                      </td>
                      <td className="px-3 py-1.5">{rowActions(expense)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {pagination.totalCount > 0 && visible.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
              <p className="text-ui text-ink-3">
                Showing {firstShown} to {lastShown} of {pagination.totalCount}
                {isFiltered && ' matching'}
              </p>
              {pagination.totalPages > 1 && (
                <nav aria-label="Pages" className="flex items-center gap-2">
                  <Button variant="secondary" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage} aria-label="Previous page">
                    <ChevronLeft size={18} aria-hidden="true" />
                  </Button>
                  <span className="text-ui text-ink-2 tabular-nums">
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  <Button variant="secondary" size="icon" onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={!pagination.hasNextPage} aria-label="Next page">
                    <ChevronRight size={18} aria-hidden="true" />
                  </Button>
                </nav>
              )}
            </div>
          )}
        </section>
      </main>

      <UpdateExpenseModal
        isOpen={isUpdateModalOpen}
        expense={selectedExpense}
        onClose={() => setIsUpdateModalOpen(false)}
        onExpenseUpdated={handleExpenseUpdated}
      />
    </div>
  );
}
