'use client';

import Link from "next/link";
import { 
  TrendingUp, 
  Users2, 
  Wallet2, 
  Search, 
  Filter, 
  BarChart3, 
  Receipt,
  Target,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentUser, wakeUpServer } from "../lib/api";
import { useRouter } from "next/navigation";
import Card from "../components/home/Card";
import HeroSection from "../components/home/HeroSection";
import SectionAnimator from "../components/SectionAnimator";

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    void wakeUpServer();

    async function checkAuth() {
      try {
        const response = await getCurrentUser();
        if (!isMounted) return;

        if (response?.user) {
          setUser(response.user);
          router.push('/dashboard');
        }
      } catch (err) {
        // Unauthenticated visitor
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main id="main-content" className="min-h-screen bg-slate-50/50 brand-grid">
      {/* Landing Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Wallet2 size={18} strokeWidth={2.2} className="text-teal-400" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Vaultly</span>
          </Link>

          <nav className="flex items-center gap-3" aria-label="Primary navigation">
            {user ? (
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
              >
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Core Features Grid */}
      <section id="features" className="py-20 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionAnimator className="space-y-12" staggerChildren={true}>
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                Full-Featured Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Designed for financial clarity & collaboration
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Everything required to eliminate confusion, split expenses evenly, and measure progress.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card
                icon={<Receipt className="text-teal-600" size={24} />}
                title="Expense Tracking"
                description="Categorize individual and shared line items with instant server-side persistence."
              />
              <Card
                icon={<Users2 className="text-sky-600" size={24} />}
                title="Relational Groups"
                description="Manage group spaces with invited members, role authorization, and unified records."
              />
              <Card
                icon={<Target className="text-purple-600" size={24} />}
                title="Milestone Targets"
                description="Set target savings amounts with deadlines and track incremental contributions."
              />
              <Card
                icon={<Search className="text-amber-600" size={24} />}
                title="Multi-Query Search"
                description="Instantly locate transactions by description or category name across data sets."
              />
              <Card
                icon={<Filter className="text-rose-600" size={24} />}
                title="Multi-Field Filtering"
                description="Filter transactions by custom date range, category classification, or sort order."
              />
              <Card
                icon={<BarChart3 className="text-indigo-600" size={24} />}
                title="Aggregated Analytics"
                description="Review monthly trends, largest outlays, and group splits computed on PostgreSQL."
              />
            </div>
          </SectionAnimator>
        </div>
      </section>

      {/* Three Step Workflow */}
      <section className="py-20 sm:py-24 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionAnimator className="space-y-12" staggerChildren={true}>
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                Streamlined Setup
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Three straightforward steps
              </h2>
              <p className="text-sm text-slate-500">
                Start managing shared and individual finances in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                number="01"
                title="Create Account"
                description="Sign up using email credentials or Google OAuth with secure httpOnly cookie session management."
                variant="step"
              />
              <Card
                number="02"
                title="Log & Group Expenses"
                description="Add personal spending or create shared groups to tag roommates and friends on joint charges."
                variant="step"
              />
              <Card
                number="03"
                title="Audit & Export"
                description="Examine period trends and export clean CSV datasets for external review."
                variant="step"
              />
            </div>
          </SectionAnimator>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Ready to upgrade your financial workflow?
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Join users and groups managing their expenses with security, transparency, and modern ergonomics.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl bg-teal-500 text-slate-950 font-semibold text-xs hover:bg-teal-400 transition shadow-sm w-full sm:w-auto"
            >
              Sign Up for Free
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-800 transition w-full sm:w-auto"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      {/* Modern Minimalist Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center">
              <Wallet2 size={13} className="text-teal-400" />
            </div>
            <span className="font-bold text-slate-900">Vaultly</span>
            <span className="text-slate-400">| Full-Stack Finance Tracker</span>
          </div>

          <div>
            &copy; {new Date().getFullYear()} Vaultly. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
