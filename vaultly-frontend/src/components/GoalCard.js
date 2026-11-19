'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { Pencil, Trash2 } from 'lucide-react';
import Button from './ui/Button';
import MoneyText from './ui/MoneyText';
import { useIsomorphicLayoutEffect } from '../hooks/useGsapAnimation';
import useCountUp from '../hooks/useCountUp';

function deadlineText(deadline, complete) {
  if (!deadline || complete) return null;
  const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const date = new Date(deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (daysLeft < 0) return { text: `Overdue since ${date}`, overdue: true };
  if (daysLeft === 0) return { text: 'Due today', overdue: false };
  return { text: `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left · ${date}`, overdue: false };
}

/**
 * One savings goal. The bar fills from zero on first view; after a contribution it fills
 * from the old amount to the new one, and reaching the target draws a single check mark.
 * `featured` gives the goal closest to done a larger figure and a thicker bar.
 */
export default function GoalCard({ goal, featured = false, onContribute, onEdit, onDelete }) {
  const saved = goal.currentAmount || 0;
  const progress = goal.targetAmount > 0 ? Math.min(100, (saved / goal.targetAmount) * 100) : 0;
  const complete = saved >= goal.targetAmount;
  const remaining = Math.max(0, goal.targetAmount - saved);
  const due = deadlineText(goal.deadline, complete);
  const shownPercent = useCountUp(progress, { duration: 0.9 });

  const barRef = useRef(null);
  const checkRef = useRef(null);
  const previous = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const from = previous.current;
    previous.current = { progress, complete };
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        barRef.current,
        { scaleX: (from?.progress ?? 0) / Math.max(progress, 0.01) },
        { scaleX: 1, transformOrigin: '0% 50%', duration: from ? 0.7 : 0.6, ease: 'power3.out', clearProps: 'transform' }
      );
      if (complete && from && !from.complete && checkRef.current) {
        gsap.fromTo(checkRef.current, { strokeDashoffset: 24 }, { strokeDashoffset: 0, duration: 0.4, delay: 0.5, ease: 'power3.out' });
      }
    });
    return () => mm.revert();
  }, [progress, complete]);

  return (
    <article
      aria-labelledby={`goal-${goal.id}`}
      className={`flex flex-col rounded-surface border border-line bg-surface p-5 sm:p-6 ${featured ? 'md:col-span-2' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`goal-${goal.id}`} className="flex items-center gap-2 text-h3 font-semibold text-ink">
            <span className="truncate">{goal.name}</span>
            {complete && (
              <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-positive" aria-label="Reached">
                <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.12" />
                <path ref={checkRef} d="M6 10.5l2.5 2.5L14 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" />
              </svg>
            )}
          </h2>
          {due && <p className={`mt-0.5 text-ui ${due.overdue ? 'text-negative' : 'text-ink-3'}`}>{due.text}</p>}
          {complete && <p className="mt-0.5 text-ui text-positive">Target reached</p>}
        </div>
        <div className="-mr-2 -mt-1 flex shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(goal)} aria-label={`Edit ${goal.name}`}>
            <Pencil size={16} aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(goal)} aria-label={`Delete ${goal.name}`} className="hover:text-negative">
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      </div>

      <p className={`mt-5 text-ink ${featured ? 'text-[36px] leading-[44px] sm:text-h1' : 'text-h2'} font-semibold tracking-tight`}>
        <MoneyText amount={saved} />
        <span className="ml-2 text-body font-normal text-ink-3">
          of <MoneyText amount={goal.targetAmount} />
        </span>
      </p>

      <div
        className={`mt-4 overflow-hidden rounded-full bg-canvas ${featured ? 'h-4' : 'h-2.5'}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label={`${goal.name} progress`}
      >
        <div ref={barRef} className={`h-full rounded-full ${complete ? 'bg-positive' : 'bg-brand'}`} style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-2 flex items-center justify-between text-ui text-ink-3">
        <span className="tabular-nums">{Math.round(shownPercent)}%</span>
        {!complete && (
          <span>
            <MoneyText amount={remaining} /> to go
          </span>
        )}
      </div>

      {goal.description && <p className="mt-4 text-ui text-ink-2">{goal.description}</p>}

      {!complete && (
        <div className="mt-auto pt-5">
          <Button variant={featured ? 'primary' : 'secondary'} onClick={() => onContribute(goal)}>
            Add money
          </Button>
        </div>
      )}
    </article>
  );
}
