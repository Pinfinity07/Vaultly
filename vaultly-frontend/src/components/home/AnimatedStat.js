'use client';

import useCountUp from '../../hooks/useCountUp';
import useGsapAnimation from '../../hooks/useGsapAnimation';

export default function AnimatedStat({ number, label, suffix = '' }) {
  const containerRef = useGsapAnimation('fadeInUp', {
    scrollTrigger: { start: 'top 92%' },
  });
  const numberRef = useCountUp(number, 1.8);

  return (
    <div ref={containerRef} className="text-center">
      <div className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight tabular-nums">
        <span ref={numberRef}>0</span>
        <span>{suffix}</span>
      </div>
      <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}
