import Image from 'next/image';

/**
 * A real screenshot of the app, framed and labelled as sample data so it is never
 * mistaken for live figures. Images live in public/product (2x WebP).
 */
export default function ProductShot({ src, alt, width = 2560, height = 1600, priority = false, caption = 'Example account with sample data', className = '' }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-surface border border-line bg-surface shadow-[0_24px_48px_-24px_rgb(15_23_42/0.25)]">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes="(min-width: 1024px) 640px, 100vw"
          className="h-auto w-full"
        />
      </div>
      {caption && <figcaption className="mt-2 text-ui text-ink-3">{caption}</figcaption>}
    </figure>
  );
}
