import Image from 'next/image';

/**
 * A real screenshot of the app, cropped to the part being described. Images live in
 * public/product (2x WebP). Pass width and height in image pixels; caption is optional.
 */
export default function ProductShot({ src, alt, width, height, priority = false, caption, className = '' }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-surface border border-line bg-surface shadow-[0_24px_48px_-24px_rgb(15_23_42/0.25)]">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes="(min-width: 1024px) 660px, 100vw"
          className="h-auto w-full"
        />
      </div>
      {caption && <figcaption className="mt-2 text-ui text-ink-3">{caption}</figcaption>}
    </figure>
  );
}
