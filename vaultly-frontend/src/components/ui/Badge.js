const TONES = {
  neutral: 'bg-canvas text-ink-2 border-line',
  brand: 'bg-brand-soft text-brand-strong border-brand/20',
  positive: 'bg-green-50 text-positive border-green-200',
  negative: 'bg-red-50 text-negative border-red-200',
  warning: 'bg-amber-50 text-warning border-amber-200',
};

/** Plain status chip. Color only for meaning: <Badge tone="positive">Reached</Badge> */
export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-control border px-2 py-0.5 text-ui font-medium ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
