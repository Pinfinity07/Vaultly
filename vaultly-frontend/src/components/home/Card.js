'use client';

import useGsapAnimation from '../../hooks/useGsapAnimation';

export default function Card({ 
  icon, 
  title, 
  description, 
  number, 
  variant = 'feature'
}) {
  const ref = useGsapAnimation('fadeInScale', {
    scrollTrigger: { start: 'top 92%' },
  });

  if (variant === 'step') {
    return (
      <div ref={ref} data-animate className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-xs">
          {number}
        </div>
        <h4 className="text-base font-bold text-slate-900 mb-1.5 tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-animate
      className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs relative overflow-hidden group hover:border-slate-300 hover:shadow-sm transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-slate-900 mb-1.5 tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
