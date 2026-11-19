'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIsomorphicLayoutEffect } from '../hooks/useGsapAnimation';

gsap.registerPlugin(ScrollTrigger);

const PRESETS = {
  fadeIn: {},
  slideUp: { y: 16 },
  slideInLeft: { x: -16 },
};

// Fades a section (or its [data-animate] children, staggered) in once when it scrolls
// into view. Visible without JavaScript; still under reduced motion.
export default function SectionAnimator({ children, className = '', animationType = 'fadeIn', staggerChildren = false }) {
  const ref = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const targets = staggerChildren ? element.querySelectorAll('[data-animate]') : element;
      gsap.fromTo(targets, { opacity: 0, ...(PRESETS[animationType] || PRESETS.fadeIn) }, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: staggerChildren ? 0.05 : 0,
        clearProps: 'opacity,transform',
        scrollTrigger: { trigger: element, start: 'top 90%', once: true },
      });
    });

    return () => mm.revert();
  }, [animationType, staggerChildren]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
