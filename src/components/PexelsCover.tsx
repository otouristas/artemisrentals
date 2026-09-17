import type { ComponentProps } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { resolveContentImage } from "@/lib/sifnos-photos";
import { PexelsPhotoCredit } from "@/components/PexelsPhotoCredit";
import { cn } from "@/lib/cn";

type CoverHref = ComponentProps<typeof Link>["href"];

export async function PexelsCover({
  src,
  alt,
  sizes,
  locale,
  href,
  preload = false,
  className,
  credit = "overlay",
}: {
  src: string;
  alt: string;
  sizes: string;
  locale: string;
  href?: CoverHref;
  preload?: boolean;
  className?: string;
  credit?: "overlay" | "below" | "none";
}) {
  const photo = await resolveContentImage(src, "cover");
  const image = (
    <Image
      src={photo.src}
      alt={alt || photo.alt}
      fill
      className={cn("object-cover", className)}
      sizes={sizes}
      {...(preload ? { preload: true as const } : {})}
      style={photo.avgColor ? { backgroundColor: photo.avgColor } : undefined}
    />
  );

  return (
    <div className="relative h-full w-full">
      {href ? (
        <Link href={href} className="absolute inset-0">
          {image}
        </Link>
      ) : (
        image
      )}
      {credit === "overlay" && photo.credit ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-2">
          <div className="pointer-events-auto w-fit max-w-full">
            <PexelsPhotoCredit credit={photo.credit} locale={locale} variant="overlay" />
          </div>
        </div>
      ) : null}
      {credit === "below" && photo.credit ? (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-aegean/70 to-transparent px-3 pb-2 pt-8">
          <PexelsPhotoCredit credit={photo.credit} locale={locale} variant="overlay" />
        </div>
      ) : null}
    </div>
  );
}
