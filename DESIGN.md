# Vaultly design system

The source of truth for how the Vaultly frontend looks and moves. Tokens live in
`vaultly-frontend/src/app/globals.css` under `@theme`; shared components live in
`vaultly-frontend/src/components/ui/`. If a page needs something this file does
not cover, add it here first.

## Character

Calm, precise, number-first. A ledger, not a marketing site. Every page has one
figure that matters most, and it is the largest thing on the page. Copy is plain
and specific, written for someone splitting rent with flatmates, not for a
recruiter reading a tech stack.

Not this: gradients, glow, glass, decorative grids, icon tiles above headings,
uppercase eyebrow labels, rainbow icons, emojis, fake numbers.

## Color

One brand color, semantic colors used only for meaning, and slate for
everything else. Ratios are against white (`#ffffff`).

| Token | Value | Use | Contrast |
|---|---|---|---|
| `--color-ink` | `#0f172a` | Headings, figures, primary text | 17.9:1 |
| `--color-ink-2` | `#334155` | Body text | 10.4:1 |
| `--color-ink-3` | `#475569` | Secondary text that carries information (emails, dates, hints) | 7.6:1 |
| `--color-ink-4` | `#64748b` | Optional metadata only, never on `--color-canvas` below 14px | 4.8:1 |
| `--color-line` | `#e2e8f0` | Dividers and card borders (decorative) | n/a |
| `--color-line-strong` | `#7b8494` | Input and control borders | 3.8:1 |
| `--color-canvas` | `#f8fafc` | Page background | n/a |
| `--color-surface` | `#ffffff` | Cards, tables, dialogs | n/a |
| `--color-brand` | `#0f766e` | Primary buttons, links, focus ring, selected state | 5.5:1 |
| `--color-brand-strong` | `#115e59` | Primary hover and pressed | 7.6:1 |
| `--color-brand-soft` | `#f0fdfa` | Selected row, active nav background | n/a |
| `--color-positive` | `#15803d` | Under budget, money in, goal reached | 5.0:1 |
| `--color-negative` | `#b91c1c` | Over budget, overdue, destructive actions | 6.5:1 |
| `--color-warning` | `#b45309` | Deadline close, over-target contribution | 5.0:1 |

`text-slate-400` (2.6:1) is retired for any text.

### Category colors

Charts and category dots need to tell categories apart, so they get a fixed
data palette. This is the only place more than one hue is allowed. A category's
color is chosen by a stable hash of its lowercased name (`lib/categoryColors.js`),
so "Food" is the same color on Dashboard, Expenses and Analytics.

`#0f766e` `#0369a1` `#7c3aed` `#be185d` `#c2410c` `#4d7c0f` `#b45309` `#475569`

Every entry is at least 3:1 against white, so it works for bars, dots and chart
lines. Category names are always shown as text next to the color; color is
never the only signal.

## Type

**IBM Plex Sans** for the interface, **IBM Plex Mono** for amounts in tables
and lists. Compared in the browser against Public Sans with JetBrains Mono: both
read well, but Plex Sans and Plex Mono share proportions and stroke, so a mono
amount next to a sans label looks like one family rather than two. Inter and
Geist are avoided as defaults; Space Grotesk is retired.

The single hero figure on each page uses Plex Sans semibold with tabular
figures, not the mono face, so the largest number on the page reads as a figure
rather than as code.

| Step | Size / line height | Weight | Use |
|---|---|---|---|
| `text-meta` | 12 / 16 | 400 | Optional metadata only (timestamps under a row) |
| `text-ui` | 14 / 20 | 400, 500 | Minimum for anything interactive or needed to understand the page: labels, buttons, nav, table cells |
| `text-body` | 16 / 24 | 400 | Paragraphs, descriptions |
| `text-h3` | 20 / 28 | 600 | Card and section titles |
| `text-h2` | 28 / 36 | 600 | Page titles |
| `text-h1` | 40 / 48 | 600 | Landing headline |
| `text-hero` | 56 / 60 | 600 | The one hero figure per page |

Rules:

- Labels are sentence case. Uppercase is allowed only for table column headers
  (12px, `tracking-wide`, `--color-ink-3`).
- No label above a heading. If a heading needs context, put it in the heading.
- Headlines use `text-wrap: balance`; paragraphs cap at 65ch.
- Amounts always use `tabular-nums`, are right-aligned in tables, and go
  through `formatMoney` (never a hardcoded `$` or `toFixed(2)`).

## Space and shape

- 8px grid: spacing steps of 4, 8, 12, 16, 24, 32, 48, 64.
- Two radii only: `--radius-control` 8px (buttons, inputs, chips, menus) and
  `--radius-surface` 12px (cards, dialogs, table wrappers). Avatars are round.
- One card level per region. Inside a card, separate content with dividers or
  spacing, never another bordered box.
- No shadows except on overlays (dialogs, menus, toasts, the mobile bottom bar).
- Hit targets at least 40px (44px for primary buttons and the bottom bar).
- Content width: 1120px max for app pages, 720px for forms and settings.

## Money

`formatMoney(amount, { currency })` wraps `Intl.NumberFormat`. Currency is a
per-browser setting (Profile, default INR) stored with the rest of the client
state; it does not change on the server. It is a display setting only: amounts
are not converted.

The Dashboard privacy toggle masks every amount on the page through the same
helper, and the choice persists across reloads.

## Components

Built once in `src/components/ui/`, used everywhere:

| Component | Notes |
|---|---|
| `Button` | `primary`, `secondary`, `ghost`, `danger`; sizes `md` (40px) and `lg` (44px); `loading` state with spinner and unchanged width |
| `Field` | Label (14px sentence case), control, hint, inline error with `aria-describedby`. Wraps input, password (with show/hide), textarea |
| `Select` | Native select styled to match `Field`; searchable variant for categories |
| `Card` | Surface, 12px radius, `--color-line` border, optional header row |
| `Badge` | Plain text chip for status; color only from semantic tokens |
| `Dialog` | `role="dialog"`, `aria-modal`, labelled by its title, Escape closes, focus trap, focus returns to the trigger, Enter submits the form, primary action on the right |
| `ConfirmDialog` | Replaces every `confirm()`. Names the thing being changed ("Delete Goa trip goal?") and uses a `danger` button for destructive actions |
| `Toaster` | Rendered once in the root layout, styled with these tokens; supports an Undo action |
| `Skeleton` | Matches the real layout of the page it stands in for |
| `EmptyState` | One sentence and one action. No icon tile |
| `PageHeader` | Title, optional one-line description, actions on the right |
| `MoneyText` | Renders `formatMoney` output, respects the privacy mask |

## Motion

Motion explains or confirms something. Everything else stays still.

- Transform and opacity only. Easing `power3.out` (or `expo.out` for counters).
  No bounce, elastic or looping decoration.
- Content is visible in CSS by default. Animation is added after hydration, so
  a page never sits blank waiting for JavaScript.
- Page load: stagger the first screen once (header, hero figure, secondary
  row), 40 to 60ms apart, under 600ms total.
- Figures: count up the hero figure and goal percentages once, 800 to 1200ms.
- Charts and progress bars: grow from the baseline on first view, 500 to 700ms.
- Route change: 150 to 200ms cross-fade.
- Dialogs: fade plus 8px rise in, 160 to 200ms; reverse on close.
- Lists: stagger at most the first eight rows. Added rows slide in, deleted rows
  collapse, and expense deletion offers Undo.
- Goal contribution: the figure ticks, the bar fills, and completion draws one
  check mark.
- Hover and press: 100 to 150ms color change and a 1px lift on buttons. No scale
  on logos.
- Reduced motion: all GSAP runs inside `gsap.matchMedia()`; with
  `prefers-reduced-motion: reduce`, states change instantly. Focus rings are
  never animated.

## Accessibility baseline

- Text contrast 4.5:1 (3:1 for 18px+ or 14px bold); control borders 3:1.
- Visible 2px brand focus ring with 2px offset on every interactive element.
- Every flow works by keyboard alone.
- Charts expose their values as text (visible labels or a keyboard-reachable
  tooltip with a table fallback), never hover-only.
- One `h1` per page; headings do not skip levels.
