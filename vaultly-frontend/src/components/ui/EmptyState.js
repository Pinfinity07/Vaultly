/** One sentence and one action. <EmptyState title="No goals yet" description action={<Button>} /> */
export default function EmptyState({ title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center px-6 py-12 text-center ${className}`}>
      <h3 className="text-h3 font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-[45ch] text-body text-ink-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
