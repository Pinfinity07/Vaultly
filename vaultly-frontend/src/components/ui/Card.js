/**
 * The one surface level per region. Separate content inside with dividers, not nested cards.
 * <Card title="Spending by month" description actions padded={false}>
 */
export default function Card({ as: Tag = 'section', title, description, actions, padded = true, className = '', children, ...props }) {
  const hasHeader = title || actions;

  return (
    <Tag className={`rounded-surface border border-line bg-surface ${className}`} {...props}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6">
          <div className="min-w-0">
            {title && <h2 className="text-h3 font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-ui text-ink-3">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padded ? 'p-5 sm:p-6' : hasHeader ? 'pt-4' : ''}>{children}</div>
    </Tag>
  );
}
