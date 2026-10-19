'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function useCountUp(targetNumber = 0, duration = 2) {
  const ref = useRef(null);
  const numberRef = useRef({ value: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const currentNumber = numberRef.current;

    const triggerInstance = ScrollTrigger.create({
      trigger: element,
      onEnter: () => {
        gsap.to(currentNumber, {
          value: targetNumber,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            if (element) {
              element.textContent = Math.floor(currentNumber.value).toLocaleString();
            }
          },
        });
      },
      once: true,
    });

    return () => {
      triggerInstance.kill();
      gsap.killTweensOf(currentNumber);
    };
  }, [targetNumber, duration]);

  return ref;
}
