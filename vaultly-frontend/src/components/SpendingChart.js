'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useIsomorphicLayoutEffect } from '../hooks/useGsapAnimation';
import { useFormatMoney } from './ui/MoneyText';

const HEIGHT = 240;
const PAD = { top: 28, right: 8, bottom: 32, left: 56 };

// Round the axis maximum up to a tidy number (1, 2, 2.5 or 5 times a power of ten).
function niceMax(value) {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value);
  return step * power;
}

/**
 * Bar chart of spending per period with a labelled y-axis. The latest bar is highlighted
 * and its value is always shown; every bar's value appears on hover or keyboard focus and
 * is in its accessible name. Bars grow from the baseline once, unless motion is reduced.
 * data: [{ key, label, longLabel, amount }]
 */
export default function SpendingChart({ data }) {
  const format = useFormatMoney();
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const [activeKey, setActiveKey] = useState(null);
  // Draw at the container's real width so labels stay at their true font size on phones.
  const [width, setWidth] = useState(null);

  useIsomorphicLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const measured = width !== null;

  // Grow the bars once, after the first measurement so the pivot is at the real baseline.
  useIsomorphicLayoutEffect(() => {
    if (!measured) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        svgRef.current.querySelectorAll('[data-bar]'),
        { scaleY: 0 },
        { scaleY: 1, transformOrigin: '50% 100%', duration: 0.6, ease: 'power3.out', stagger: 0.05, clearProps: 'transform' }
      );
    });
    return () => mm.revert();
  }, [measured]);

  if (!measured) {
    return <div ref={wrapperRef} style={{ height: HEIGHT }} />;
  }

  const innerWidth = width - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const max = niceMax(Math.max(...data.map((d) => d.amount), 0));
  const ticks = [0, 0.5, 1].map((t) => t * max);
  const slot = innerWidth / Math.max(data.length, 1);
  const barWidth = Math.min(48, slot * 0.6);
  const y = (v) => PAD.top + innerHeight - (v / max) * innerHeight;
  const latestKey = data[data.length - 1]?.key;
  const labelledKey = activeKey ?? latestKey;

  return (
    <div ref={wrapperRef}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        width={width}
        height={HEIGHT}
        className="block max-w-full overflow-visible"
        role="group"
        aria-label="Spending by month"
      >
        {ticks.map((tick) => (
          <g key={tick} aria-hidden="true">
            <line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} className={tick === 0 ? 'stroke-line-strong' : 'stroke-line'} strokeWidth="1" />
            <text x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-ink-3 text-[12px] tabular-nums">
              {format(tick, { compact: true })}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          const top = y(d.amount);
          const isLatest = d.key === latestKey;
          const showValue = d.key === labelledKey;
          return (
            <g
              key={d.key}
              tabIndex={0}
              role="img"
              aria-label={`${d.longLabel}: ${format(d.amount)}`}
              onMouseEnter={() => setActiveKey(d.key)}
              onMouseLeave={() => setActiveKey(null)}
              onFocus={() => setActiveKey(d.key)}
              onBlur={() => setActiveKey(null)}
              className="cursor-default outline-none [&:focus-visible>rect:first-of-type]:stroke-brand [&:focus-visible>rect:first-of-type]:stroke-2"
            >
              {/* Full-height hit area so short bars are easy to hover. */}
              <rect x={cx - slot / 2} y={PAD.top} width={slot} height={innerHeight} fill="transparent" />
              <rect
                data-bar
                x={cx - barWidth / 2}
                y={top}
                width={barWidth}
                height={Math.max(PAD.top + innerHeight - top, d.amount > 0 ? 2 : 0)}
                rx="4"
                className={isLatest || d.key === activeKey ? 'fill-brand' : 'fill-ink-4'}
              />
              {showValue && (
                <text x={cx} y={top - 8} textAnchor="middle" className="fill-ink text-[14px] font-medium tabular-nums" aria-hidden="true">
                  {format(d.amount, { compact: true })}
                </text>
              )}
              <text x={cx} y={HEIGHT - 8} textAnchor="middle" className={`text-[14px] ${isLatest ? 'fill-ink font-medium' : 'fill-ink-3'}`} aria-hidden="true">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
