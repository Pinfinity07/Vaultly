// Categories are shared across all users and matched case-insensitively, so the stored
// spelling is whatever was created first ("transport", "Health"). Normalize for display.
export function formatCategory(name) {
  const text = String(name || '').trim();
  if (!text) return 'Uncategorized';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Data palette from DESIGN.md. Every entry is at least 3:1 against white.
export const CATEGORY_COLORS = [
  '#0f766e',
  '#0369a1',
  '#7c3aed',
  '#be185d',
  '#c2410c',
  '#4d7c0f',
  '#b45309',
  '#475569',
];

// Stable per name, so a category has the same color on every page.
export function categoryColor(name) {
  const key = String(name || '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}
