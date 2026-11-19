'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useIsomorphicLayoutEffect } from './useGsapAnimation';

/**
 * Returns `value`, counting up from zero the first time it is positive. The server render
 * and reduced-motion users get the real value straight away; later changes apply instantly.
 *
 * const shown = useCountUp(total, { enabled: !masked });
 * <span>{formatMoney(shown)}</span>
 */
export default function useCountUp(value, { duration = 1, enabled = true } = {}) {
  const [display, setDisplay] = useState(null);
  const playedRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (!enabled || playedRef.current || !(value > 0)) return;
    playedRef.current = true;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const counter = { value: 0 };
      setDisplay(0);
      const tween = gsap.to(counter, {
        value,
        duration,
        ease: 'expo.out',
        onUpdate: () => setDisplay(counter.value),
        onComplete: () => setDisplay(null),
      });
      return () => {
        tween.kill();
        setDisplay(null);
      };
    });
    return () => mm.revert();
  }, [value, duration, enabled]);

  return display ?? value;
}
