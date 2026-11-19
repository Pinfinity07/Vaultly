"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Receipt,
  Users2,
  Target,
  BarChart3,
  User,
  LogOut,
  Wallet2,
  Plus,
  Search,
} from "lucide-react";
import { getCurrentUser, logout, createExpense } from "../lib/api";
import toast from "react-hot-toast";
import AddExpenseModal from "./AddExpenseModal";
import CommandPalette from "./CommandPalette";
import Button from "./ui/Button";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", shortLabel: "Expenses", icon: Receipt },
  { href: "/groups", label: "Groups", shortLabel: "Groups", icon: Users2 },
  { href: "/goals", label: "Goals", shortLabel: "Goals", icon: Target },
  { href: "/reports", label: "Analytics", shortLabel: "Analytics", icon: BarChart3 },
];

const OPEN_ADD_EXPENSE_EVENT = "vaultly:add-expense";

export function openAddExpense() {
  window.dispatchEvent(new CustomEvent(OPEN_ADD_EXPENSE_EVENT));
}

const isActive = (pathname, href) => pathname === href || pathname?.startsWith(`${href}/`);

export default function Navigation() {
  const [user, setUser] = useState(null);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    async function fetchUser() {
      const response = await getCurrentUser();
      if (!isMounted) return;
      if (response?.error) {
        router.push("/login");
      } else if (response?.user) {
        setUser(response.user);
      }
    }
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Cmd/Ctrl+K opens the command palette, as users expect from that shortcut.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Pages open the shared Add expense dialog with openAddExpense() from this module.
  useEffect(() => {
    const handleOpen = () => setIsQuickExpenseOpen(true);
    window.addEventListener(OPEN_ADD_EXPENSE_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_ADD_EXPENSE_EVENT, handleOpen);
  }, []);

  const handleQuickExpenseAdded = async (expenseData) => {
    try {
      const res = await createExpense(expenseData);
      if (res?.error) {
        toast.error(res.error || "Failed to log expense");
      } else {
        toast.success("Expense added");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("expenseAdded"));
        }
      }
    } catch {
      toast.error("Failed to log expense");
    }
  };

  const handleLogout = async () => {
    const response = await logout();
    if (response?.error) {
      toast.error("Logout failed");
    } else {
      toast.success("Signed out");
      setTimeout(() => {
        router.push("/login");
      }, 500);
    }
  };

  const showAddExpense = () => setIsQuickExpenseOpen(true);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2 rounded-control text-body font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-control bg-ink text-white">
              <Wallet2 size={18} aria-hidden="true" />
            </span>
            Vaultly
          </Link>

          <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-10 items-center rounded-control px-3 text-ui font-medium transition-colors ${
                    active ? "bg-brand-soft text-brand-strong" : "text-ink-3 hover:bg-canvas hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              aria-label="Search and commands"
              aria-keyshortcuts="Meta+K Control+K"
              className="flex h-10 items-center gap-2 rounded-control border border-line px-3 text-ui text-ink-3 transition-colors hover:border-line-strong hover:text-ink"
            >
              <Search size={16} aria-hidden="true" />
              <span className="hidden xl:inline">Jump to</span>
              <kbd className="hidden md:inline rounded border border-line bg-canvas px-1.5 font-sans text-meta text-ink-3">⌘K</kbd>
            </button>

            <div className="hidden lg:block">
              <Button onClick={showAddExpense}>
                <Plus size={16} aria-hidden="true" />
                Add expense
              </Button>
            </div>

            <AccountMenu user={user} pathname={pathname} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <MobileTabBar pathname={pathname} />

      <button
        type="button"
        onClick={showAddExpense}
        aria-label="Add expense"
        className="lg:hidden fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-[background-color,transform] duration-150 hover:bg-brand-strong active:scale-95 bottom-[calc(64px+16px+env(safe-area-inset-bottom))]"
      >
        <Plus size={24} aria-hidden="true" />
      </button>

      <CommandPalette
        open={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onAddExpense={() => {
          setIsPaletteOpen(false);
          showAddExpense();
        }}
        onLogout={handleLogout}
      />

      <AddExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
        onExpenseAdded={handleQuickExpenseAdded}
      />
    </>
  );
}

function AccountMenu({ user, pathname, onLogout }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const displayName = user?.full_name || user?.name || user?.email?.split("@")[0] || "Account";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        rootRef.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // Close when the route changes (state reset during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="account-menu"
        aria-label={`Account: ${displayName}`}
        className="flex h-10 w-10 items-center justify-center rounded-full"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-meta font-semibold text-white" aria-hidden="true">
          {userInitials}
        </span>
      </button>

      {open && (
        <div
          id="account-menu"
          className="absolute right-0 top-12 w-64 rounded-surface border border-line bg-surface p-2 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-ui font-medium text-ink">{displayName}</p>
            {user?.email && <p className="truncate text-ui text-ink-3">{user.email}</p>}
          </div>
          <div className="my-1 border-t border-line" />
          <Link
            href="/profile"
            aria-current={pathname === "/profile" ? "page" : undefined}
            className="flex h-10 items-center gap-2 rounded-control px-3 text-ui text-ink-2 hover:bg-canvas hover:text-ink"
          >
            <User size={16} aria-hidden="true" />
            Profile and settings
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex h-10 w-full items-center gap-2 rounded-control px-3 text-ui text-ink-2 hover:bg-canvas hover:text-ink"
          >
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function MobileTabBar({ pathname }) {
  return (
    <nav
      aria-label="Main"
      className="mobile-tabbar lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid h-16 max-w-xl grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-ui font-medium transition-colors ${
                  active ? "text-brand-strong" : "text-ink-3 hover:text-ink"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                {item.shortLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
