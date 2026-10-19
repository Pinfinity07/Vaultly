'use client';

import Link from 'next/link';
import { TrendingUp, ArrowRight, ShieldCheck, Wallet2, Sparkles, Users2, Receipt } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function HeroSection() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const buttonsRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (!titleRef.current || !descRef.current || !buttonsRef.current || !previewRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const tl = gsap.timeline();

    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      0
    )
      .fromTo(
        descRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        0.15
      )
      .fromTo(
        buttonsRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
        0.3
      )
      .fromTo(
        previewRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        0.2
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-16 sm:pb-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Value Prop */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700">
            <ShieldCheck size={14} className="text-teal-600" />
            <span>Full-Stack Finance Architecture</span>
          </div>

          <h1 ref={titleRef} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1]">
            Intelligent expense management for individuals & shared spaces.
          </h1>

          <p ref={descRef} className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
            Vaultly bridges personal expense recording with relational group cost sharing, milestone-based savings targets, and server-aggregated analytics. Built for precision and collaborative accountability.
          </p>

          <div ref={buttonsRef} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
            >
              <span>Get Started Free</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            >
              <span>Existing Member Sign In</span>
            </Link>
          </div>

          <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>httpOnly JWT Cookies</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>PostgreSQL & Prisma ORM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>Google OAuth 2.0</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mockup Card */}
        <div ref={previewRef} className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-7 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Wallet2 size={16} className="text-teal-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Live Ledger</h3>
                  <p className="text-[10px] text-slate-500">Real-time balances</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                <TrendingUp size={12} />
                <span>Active Cycle</span>
              </span>
            </div>

            <div className="py-5 space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Month Spend</span>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 tabular-nums tracking-tight">
                $3,428.50
              </div>
            </div>

            <div className="space-y-2.5 py-3">
              <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                <span>Personal Allocation</span>
                <span className="text-slate-900 font-semibold tabular-nums">$1,850.00 (54%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-slate-900 h-2 rounded-full w-[54%]" />
              </div>

              <div className="flex justify-between items-center text-xs font-medium text-slate-600 pt-1">
                <span>Shared Groups (3 active)</span>
                <span className="text-slate-900 font-semibold tabular-nums">$1,578.50 (46%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-teal-600 h-2 rounded-full w-[46%]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-1">
                  <Receipt size={13} />
                  <span>Recent Outlay</span>
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">Groceries & Household</p>
                <p className="text-[11px] text-teal-700 font-semibold tabular-nums mt-0.5">-$142.80</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-1">
                  <Users2 size={13} />
                  <span>Shared Split</span>
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">Apartment Utilities</p>
                <p className="text-[11px] text-teal-700 font-semibold tabular-nums mt-0.5">-$85.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
