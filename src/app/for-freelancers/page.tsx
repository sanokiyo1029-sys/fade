import type { Metadata } from "next";
import { Artwork } from "@/components/brand/Artwork";
import { Avatar } from "@/components/brand/Avatar";
import { ButtonLink } from "@/components/ui";
import { CREATOR_MAP } from "@/data/creators";
import { INFO } from "@/data/info";

export const metadata: Metadata = { title: "Sell on FADE", description: "Publish fixed-scope services, get paid through escrow, keep 90%." };

const POINTS = [
  ["Packages, not proposals", "Describe your work once as three fixed packages. Clients book what's on the page — no pitching, no race to the bottom."],
  ["Paid before you start", "Clients pay into escrow when they order. You can see the money is there before you lift a finger."],
  ["One workspace per order", "Brief, milestones, files and messages in one place, with a log both sides can see."],
  ["Keep 90%", "One flat 10% on completed orders. No subscriptions, listing fees or charges to withdraw."],
];

export default function ForFreelancers() {
  const quote = CREATOR_MAP.meera;
  return (
    <>
      <section className="shell grid gap-10 py-12 md:grid-cols-[1.3fr_1fr] md:py-20">
        <div>
          <p className="label">FOR FREELANCERS</p>
          <h1 className="display mt-4 text-[48px] md:text-[88px]">Sell the work. Skip the pitch.</h1>
          <p className="mt-6 max-w-lg text-[17px] text-mute">Independent designers, engineers, editors and strategists use FADE to sell clearly-scoped work to clients who&apos;ve already decided to buy.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <ButtonLink href="/seller/services/new" size="lg" arrow>
              Publish a service
            </ButtonLink>
            <ButtonLink href="/info/seller-levels" size="lg" variant="line">
              Seller levels
            </ButtonLink>
          </div>
        </div>
        <Artwork variant="glyph" seed={88} tone="dark" marks className="aspect-square rounded-[2px]" />
      </section>
      <section className="shell pb-16 md:pb-24">
        <div className="grid gap-px border border-line bg-line md:grid-cols-2">
          {POINTS.map(([h, b], i) => (
            <div key={h} className="bg-bg p-6 md:p-10">
              <p className="mono num text-[12px] text-mute">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-6 text-[24px] md:text-[32px]">{h}</h2>
              <p className="mt-3 max-w-md text-[15px] text-mute">{b}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="border-y border-line bg-soft">
        <figure className="shell py-16 md:py-24">
          <blockquote className="max-w-4xl text-[28px] leading-tight tracking-[-0.03em] md:text-[44px]">“I stopped writing proposals. Clients read the package, book it, and we start on Monday.”</blockquote>
          <figcaption className="mt-8 flex items-center gap-3">
            <Avatar seed={quote.id} size={44} />
            <span>
              <span className="block text-[15px] font-medium">{quote.name}</span>
              <span className="label">{quote.headline}</span>
            </span>
          </figcaption>
        </figure>
      </section>
      <section className="shell py-16 md:py-24">
        <p className="label mb-6">LEVELS</p>
        <div className="grid gap-px border border-line bg-line md:grid-cols-3">
          {INFO["seller-levels"].sections.map(([h, [b]]) => (
            <div key={h} className="bg-bg p-6">
              <h2 className="label-fg">{h}</h2>
              <p className="mt-4 text-[14.5px] text-mute">{b}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
