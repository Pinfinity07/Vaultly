// Initials in a circle. Colour comes from the name so a person looks the same everywhere.
const TONES = ['bg-teal-700', 'bg-sky-700', 'bg-violet-600', 'bg-pink-700', 'bg-orange-700', 'bg-lime-700', 'bg-slate-600'];

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function tone(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}

export default function Avatar({ name, size = 'md', className = '' }) {
  const sizes = { sm: 'h-7 w-7 text-meta', md: 'h-9 w-9 text-ui' };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizes[size]} ${tone(name)} ${className}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

/** Overlapping avatars for a group, with "+N" past `max`. Pass names; the label is for screen readers. */
export function AvatarStack({ names, max = 4 }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="flex items-center" role="img" aria-label={names.join(', ')}>
      {shown.map((name, i) => (
        <Avatar key={`${name}-${i}`} name={name} size="sm" className={`ring-2 ring-surface ${i > 0 ? '-ml-2' : ''}`} />
      ))}
      {extra > 0 && (
        <span className="-ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-canvas text-meta font-medium text-ink-2 ring-2 ring-surface" aria-hidden="true">
          +{extra}
        </span>
      )}
    </span>
  );
}
