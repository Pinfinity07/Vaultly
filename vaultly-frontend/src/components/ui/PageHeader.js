/** Page title, optional one-line description, actions on the right. */
export default function PageHeader({ title, description, actions, className = '' }) {
  return (
    <header className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        <h1 className="text-h2 font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-[65ch] text-body text-ink-3">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
