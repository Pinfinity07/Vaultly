'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function useGsapAnimation(animationType = 'fadeInUp', options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animations = {
      fadeInUp: {
        from: { opacity: 0, y: 24 },
        to: { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      },
      fadeInScale: {
        from: { opacity: 0, y: 16 },
        to: { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      },
      slideInLeft: {
        from: { opacity: 0, x: -30 },
        to: { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
      },
      slideInRight: {
        from: { opacity: 0, x: 30 },
        to: { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
      },
    };

    const animation = animations[animationType] || animations.fadeInUp;
    const config = { ...animation.to, ...options };

    if (options.immediateRender !== false && !options.scrollTrigger) {
      gsap.fromTo(element, animation.from, config);
    } else {
      gsap.fromTo(element, animation.from, {
        ...config,
        scrollTrigger: {
          trigger: element,
          start: 'top 88%',
          toggleActions: 'play none none none',
          once: true,
          ...options.scrollTrigger,
        },
      });
    }

    return () => {
      gsap.killTweensOf(element);
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [animationType, options]);

  return ref;
}
