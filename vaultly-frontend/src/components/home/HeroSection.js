'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import Button from '../ui/Button';
import ProductShot from './ProductShot';
import { useIsomorphicLayoutEffect } from '../../hooks/useGsapAnimation';

export default function HeroSection() {
  const containerRef = useRef(null);

  // One staggered entrance on load. Visible without JavaScript; still under reduced motion.
  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        containerRef.current.querySelectorAll('[data-hero]'),
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06, clearProps: 'opacity,transform' }
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={containerRef} className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:px-8 lg:pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div>
          <h1 data-hero className="text-[34px] leading-[42px] font-semibold tracking-tight text-ink sm:text-h1">
            Split rent, track spending, and save for what&apos;s next.
          </h1>
          <p data-hero className="mt-5 max-w-[46ch] text-body text-ink-2 sm:text-[18px] sm:leading-[28px]">
            Vaultly keeps your own expenses and the ones you share with flatmates in one place, so you
            know where the month went and who paid for what.
          </p>
          <div data-hero className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button href="/signup" size="lg">
              Create a free account
            </Button>
            <p className="text-ui text-ink-3">Sign up with Google or email.</p>
          </div>
        </div>

        <div data-hero>
          <ProductShot src="/product/dashboard.webp" alt="The Vaultly dashboard: this month's spending, a six-month spending chart and a breakdown by category." priority />
        </div>
      </div>
    </section>
  );
}
