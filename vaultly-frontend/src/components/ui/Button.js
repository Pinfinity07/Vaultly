'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-strong disabled:bg-brand/50',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-canvas disabled:text-ink-4',
  ghost: 'text-ink-2 hover:bg-canvas hover:text-ink disabled:text-ink-4',
  danger: 'bg-negative text-white hover:bg-red-800 disabled:bg-negative/50',
};

const SIZES = {
  md: 'h-10 px-4 gap-2',
  lg: 'h-11 px-5 gap-2',
  icon: 'h-10 w-10',
};

export function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return [
    'relative inline-flex items-center justify-center shrink-0 rounded-control text-ui font-medium',
    'transition-[background-color,color,transform] duration-150 ease-out',
    'enabled:hover:-translate-y-px enabled:active:translate-y-0 disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(' ');
}

/**
 * <Button variant="primary|secondary|ghost|danger" size="md|lg|icon" loading href>
 * With href it renders a Next link. While loading the label stays in place (keeping the
 * button's width) and a spinner covers it.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  href,
  className = '',
  children,
  type = 'button',
  disabled,
  ...props
}) {
  const classes = buttonClasses({ variant, size, className });

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span className={`inline-flex items-center gap-2 ${loading ? 'invisible' : ''}`}>{children}</span>
      {loading && <Loader2 size={18} className="absolute animate-spin" aria-hidden="true" />}
    </button>
  );
}
