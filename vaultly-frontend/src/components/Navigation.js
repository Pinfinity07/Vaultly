"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Receipt, 
  Users2, 
  Target, 
  BarChart3, 
  User, 
  LogOut, 
  Menu, 
  X,
  Wallet2,
  Plus
} from "lucide-react";
import { getCurrentUser, logout, createExpense } from "../lib/api";
import toast, { Toaster } from "react-hot-toast";
import AddExpenseModal from "./AddExpenseModal";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/groups", label: "Groups", icon: Users2 },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/reports", label: "Analytics", icon: BarChart3 },
];

export default function Navigation() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsQuickExpenseOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleQuickExpenseAdded = async (expenseData) => {
    try {
      const res = await createExpense(expenseData);
      if (res?.error) {
        toast.error(res.error || "Failed to log expense");
      } else {
        toast.success("Expense logged successfully");
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
      toast.success("Signed out successfully");
      setTimeout(() => {
        router.push("/login");
      }, 500);
    }
  };

  const displayName = user?.full_name || user?.name || user?.email?.split("@")[0] || "Account";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <Toaster position="top-right" />
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                  <Wallet2 size={18} strokeWidth={2.2} className="text-teal-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-slate-900 tracking-tight leading-tight">Vaultly</span>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">Financial</span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                    >
                      <Icon size={15} strokeWidth={isActive ? 2.2 : 1.9} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Side User Profile & Actions */}
            <div className="hidden md:flex items-center gap-2.5">
              <button
                onClick={() => setIsQuickExpenseOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs"
                title="Quick Expense (Cmd+K)"
              >
                <Plus size={14} className="text-teal-600" strokeWidth={2.4} />
                <span>Expense</span>
                <kbd className="text-[10px] font-mono font-normal bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-slate-500">
                  ⌘K
                </kbd>
              </button>

              <Link
                href="/profile"
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border transition-all ${
                  pathname === "/profile"
                    ? "border-teal-500/50 bg-teal-50/50 text-teal-900"
                    : "border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                }`}
                title="View Profile"
              >
                <div className="w-7 h-7 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                  {userInitials || <User size={14} />}
                </div>
                <div className="text-left pr-1">
                  <p className="text-xs font-semibold leading-tight text-slate-900 truncate max-w-[130px]">{displayName}</p>
                  <p className="text-[10px] text-slate-500 leading-none truncate max-w-[130px]">{user?.email || "Personal"}</p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50/80 border border-transparent hover:border-red-100 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-xs font-semibold text-slate-800"
              >
                <div className="w-7 h-7 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                  {userInitials || <User size={14} />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{displayName}</p>
                  <p className="text-[10px] text-slate-500">View Settings</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsQuickExpenseOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition"
            >
              <Plus size={15} />
              <span>New Expense</span>
            </button>
          </div>
        )}
      </header>

      <AddExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
        onExpenseAdded={handleQuickExpenseAdded}
      />
    </>
  );
}
