import { Artwork } from "@/components/brand/Artwork";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="shell grid min-h-[70svh] items-center gap-10 py-16 md:grid-cols-2">
      <div>
        <p className="label">ERROR / 404</p>
        <h1 className="display mt-4 text-[64px] md:text-[96px]">Faded out.</h1>
        <p className="mt-5 max-w-md text-[16px] text-mute">This page doesn&apos;t exist, or the service was paused by its creator.</p>
        <div className="mt-8 flex gap-2">
          <ButtonLink href="/explore" arrow>
            Explore services
          </ButtonLink>
          <ButtonLink href="/" variant="line">
            Home
          </ButtonLink>
        </div>
      </div>
      <Artwork variant="scatter" seed={404} tone="light" marks className="aspect-square rounded-[2px]" />
    </div>
  );
}
