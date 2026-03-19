'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function HeroSection() {
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const buttonsRef = useRef(null);
  const dashboardRef = useRef(null);

  useEffect(() => {
    if (!titleRef.current || !descRef.current || !buttonsRef.current || !dashboardRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set([titleRef.current, descRef.current, dashboardRef.current], { opacity: 1, y: 0, scale: 1 });
      gsap.set(buttonsRef.current.children, { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline();

    // Smooth title fade-in
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', immediateRender: true },
      0
    )
      // Description slides in
      .fromTo(
        descRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', immediateRender: true },
        0.2
      )
      // Buttons cascade in
      .fromTo(
        buttonsRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out', immediateRender: true },
        0.5
      )
      // Dashboard card smooth entrance
      .fromTo(
        dashboardRef.current,
        { opacity: 0, scale: 0.9, y: 40 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          duration: 1.1, 
          ease: 'power2.out', 
          immediateRender: true 
        },
        0.4
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24" style={{ perspective: '1000px' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 ref={titleRef} className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Transparent <span className="bg-linear-to-r from-emerald-700 to-blue-600 bg-clip-text text-transparent">Financial</span> Collaboration
          </h2>
          <p ref={descRef} className="text-lg text-gray-600 leading-relaxed">
            Vaultly is your collaborative finance tracker for personal expense management and shared group goals. Track expenses with advanced search, sorting, filtering, and pagination. Ensure financial transparency and accountability with friends, family, and roommates.
          </p>
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="bg-linear-to-r from-emerald-700 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition duration-300 text-center">
              Get Started Free
            </Link>
            <Link href="#features" className="border-2 border-emerald-700 text-emerald-700 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 hover:scale-105 transition duration-300 text-center">
              Learn More
            </Link>
          </div>
        </div>

        <div ref={dashboardRef} className="relative" style={{ transformStyle: 'preserve-3d' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-4 hover:shadow-2xl transition group relative overflow-hidden border border-emerald-100">
            {/* Animated gradient background on hover */}
            <div className="absolute inset-0 bg-linear-to-br from-emerald-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">Monthly Balance</span>
                <TrendingUp className="text-emerald-700 group-hover:animate-pulse" size={20} />
              </div>
              <div className="text-3xl font-bold text-gray-900">$4,256.50</div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-linear-to-r from-emerald-700 to-blue-600 group-hover:w-full transition-all duration-700"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-emerald-50 rounded-lg p-4 hover:scale-110 transition duration-300 cursor-pointer transform hover:rotate-1">
                  <p className="text-xs text-gray-600 font-medium">Personal</p>
                  <p className="text-lg font-bold text-emerald-700">$2,100</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 hover:scale-110 transition duration-300 cursor-pointer transform hover:-rotate-1">
                  <p className="text-xs text-gray-600 font-medium">Shared Groups</p>
                  <p className="text-lg font-bold text-blue-700">$2,156.50</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
