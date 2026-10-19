'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SectionAnimator({ children, className = '', animationType = 'fadeIn', staggerChildren = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animations = {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1, duration: 0.6, ease: 'power1.inOut' },
      },
      slideUp: {
        from: { opacity: 0, y: 24 },
        to: { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      },
      slideInLeft: {
        from: { opacity: 0, x: -24 },
        to: { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' },
      },
    };

    const animation = animations[animationType] || animations.fadeIn;

    if (staggerChildren) {
      const childElements = element.querySelectorAll('[data-animate]');
      gsap.fromTo(
        childElements,
        animation.from,
        {
          ...animation.to,
          stagger: 0.08,
          scrollTrigger: {
            trigger: element,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
          },
          immediateRender: false,
        }
      );
    } else {
      gsap.fromTo(element, animation.from, {
        ...animation.to,
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          toggleActions: 'play none none none',
          once: true,
        },
        immediateRender: false,
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [animationType, staggerChildren]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
