'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Runs before paint on the client so animated elements never flash; a no-op on the server.
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Starting offsets. Elements render in their final state; we animate *from* these.
const PRESETS = {
  fadeInUp: { y: 16 },
  fadeInScale: { y: 12 },
  slideInLeft: { x: -16 },
  slideInRight: { x: 16 },
};

/**
 * Fades an element in once. Content is visible without JavaScript, and nothing moves
 * when the user prefers reduced motion.
 * Options are GSAP tween vars; `scrollTrigger` (an object) defers the animation until
 * the element scrolls into view.
 */
export default function useGsapAnimation(animationType = 'fadeInUp', options = {}) {
  const ref = useRef(null);
  // Callers pass inline objects, so compare by value to avoid re-running every render.
  const optionsKey = JSON.stringify(options);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const { scrollTrigger, ...tween } = JSON.parse(optionsKey);
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Explicit end values: a from() alone would treat a hidden starting state left by
      // another tween as the destination and keep the element invisible.
      gsap.fromTo(element, { opacity: 0, ...(PRESETS[animationType] || PRESETS.fadeInUp) }, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
        ...tween,
        ...(scrollTrigger && {
          scrollTrigger: { trigger: element, start: 'top 88%', once: true, ...scrollTrigger },
        }),
      });
    });

    return () => mm.revert();
  }, [animationType, optionsKey]);

  return ref;
}
