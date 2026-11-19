import Link from 'next/link';
import Image from 'next/image';
import { Wallet2 } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

/**
 * Split layout for login and signup: the form on the left, a real product screenshot on the
 * right from lg up. On small screens only the form shows.
 */
export default function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <main id="main-content" className="flex flex-col px-4 py-8 sm:px-8">
        <Link href="/" className="flex w-fit items-center gap-2 rounded-control text-body font-semibold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-ink text-white">
            <Wallet2 size={18} aria-hidden="true" />
          </span>
          Vaultly
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-h2 font-semibold text-ink">{title}</h1>
          {description && <p className="mt-1 text-body text-ink-3">{description}</p>}
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-8 text-ui text-ink-3">{footer}</p>}
        </div>
      </main>

      <aside className="hidden lg:flex flex-col justify-center gap-6 overflow-hidden border-l border-line bg-canvas py-12 pl-12" aria-hidden="true">
        <p className="max-w-[32ch] pr-12 text-h3 font-semibold text-ink">
          Your spending, your shared bills and your savings goals in one place.
        </p>
        {/* Bleeds off the right edge on purpose. */}
        <div className="w-[720px] overflow-hidden rounded-l-surface border border-r-0 border-line bg-surface shadow-[0_24px_48px_-24px_rgb(15_23_42/0.25)]">
          <Image src="/product/dashboard.webp" alt="" width={2560} height={1600} sizes="720px" className="h-auto w-full" priority />
        </div>
        <p className="text-ui text-ink-3">Example account with sample data</p>
      </aside>
    </div>
  );
}

export function GoogleButton({ children = 'Continue with Google' }) {
  return (
    <a
      href={`${API_BASE_URL}/auth/google`}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-control border border-line-strong bg-surface text-ui font-medium text-ink transition-colors hover:bg-canvas"
    >
      <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
      {children}
    </a>
  );
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3 text-ui text-ink-3">
      <span className="h-px flex-1 bg-line" />
      or
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function FormAlert({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-ui text-negative">
      {children}
    </p>
  );
}
