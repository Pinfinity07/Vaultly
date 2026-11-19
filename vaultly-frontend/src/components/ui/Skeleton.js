/** Placeholder block. Size it to match the content it stands in for: <Skeleton className="h-10 w-48" /> */
export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-control bg-slate-200/70 ${className}`} aria-hidden="true" />;
}
