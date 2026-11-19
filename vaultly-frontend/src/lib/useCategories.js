'use client';

import { useEffect, useState } from 'react';
import { getSpendingOverview } from './api';

// Offered in the category field until the user has categories of their own.
const STARTER_CATEGORIES = ['Groceries', 'Dining out', 'Rent', 'Utilities', 'Transport', 'Shopping', 'Health', 'Entertainment'];

/**
 * The user's own category names, most-used first, exactly as stored (the expense filter
 * matches names exactly). `suggestions` adds starter names for the category input.
 * Fetches when `enabled` turns true (e.g. when a dialog opens), and again on each reopen.
 */
export default function useCategories(enabled = true) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    getSpendingOverview().then((res) => {
      if (!active || !res?.success) return;
      const sorted = [...(res.data?.categoryBreakdown || [])].sort((a, b) => b.count - a.count);
      setCategories(sorted.map((c) => c.category));
    });
    return () => {
      active = false;
    };
  }, [enabled]);

  const own = new Set(categories.map((c) => c.toLowerCase()));
  const suggestions = [...categories, ...STARTER_CATEGORIES.filter((c) => !own.has(c.toLowerCase()))];

  return { categories, suggestions };
}
