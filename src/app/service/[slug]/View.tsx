"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Clock, MessageSquare, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/brand/Avatar";
import { Availability, CreatorCard, Gallery, PackageCompare, PackageSelector, ReviewList, ReviewSummary, SaveButton, ServiceCard, useContact, useServiceReviews } from "@/components/market";
import { Button, ButtonLink, Chip, EmptyState, Skeleton } from "@/components/ui";
import { CATEGORY_MAP } from "@/data/categories";
import { reviewsForService } from "@/data/reviews";
import { similarServices } from "@/data/services";
import { useApp } from "@/store/app";
import { useCreator, useService } from "@/store/hooks";
import { dateShort, delivery, levelName, money } from "@/lib/format";

export function ServiceView({ slug }: { slug: string }) {
  const service = useService(slug);
  const ready = useApp((s) => s.ready);
  const user = useApp((s) => s.user);
  const creator = useCreator(service?.creatorId);
  const [tier, setTier] = useState<1 | 2 | 3>(2);
  const contact = useContact();
  const reviews = useServiceReviews(service, service?.reviewCount ? reviewsForService(service, 6) : []);

  if (!service || !creator) {
    return ready ? (
      <div className="shell py-16">
        <EmptyState title="Service not found" body="It may have been removed or paused by its creator." action={<ButtonLink href="/explore" arrow>Explore services</ButtonLink>} />
      </div>
    ) : (
      <div className="shell py-12">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-8 aspect-[16/10] w-full max-w-3xl" />
      </div>
    );
  }

  const cat = CATEGORY_MAP[service.category];
  const pkg = service.packages[tier - 1];
  const own = user?.id === service.creatorId;
  const paused = service.status !== "active";
  const checkout = `/checkout?service=${service.id}&package=${tier}`;
  const sections = [
    ["about", "About"],
    ["packages", "Packages"],
    ["process", "Process"],
    ["faq", "FAQ"],
    ["reviews", "Reviews"],
  ] as const;

  const panel = (
    <div className="rounded-[2px] border border-fg p-5">
      <PackageSelector service={service} tier={tier} onTier={setTier} />
      <div className="mt-6 space-y-2">
        {own ? (
          <ButtonLink href="/seller/services" variant="outline" className="w-full">
            Manage your service
          </ButtonLink>
        ) : paused ? (
          <Button className="w-full" disabled>
            Not accepting orders
          </Button>
        ) : (
          <>
            <ButtonLink href={checkout} className="w-full" size="lg" arrow>
              Continue · {money(pkg.price)}
            </ButtonLink>
            <Button variant="line" className="w-full" onClick={() => contact(creator.id, service.id)}>
              <MessageSquare className="h-3.5 w-3.5" /> Contact creator
            </Button>
          </>
        )}
      </div>
      <dl className="mono mt-5 space-y-2 border-t border-line pt-4 text-[12px]">
        <div className="flex justify-between">
          <dt className="text-mute">QUEUE</dt>
          <dd className="num">{service.queue} IN PROGRESS</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-mute">NEXT START</dt>
          <dd className="num">{dateShort(creator.nextSlot)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-mute">REPLIES</dt>
          <dd>{creator.responseTime}</dd>
        </div>
      </dl>
      <p className="mt-4 flex gap-2 text-[12.5px] text-mute">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fg" />
        Paid into escrow. Released only when you approve the work.
      </p>
    </div>
  );

  return (
    <div className="shell py-6 md:py-10">
      <nav aria-label="Breadcrumb" className="label flex flex-wrap gap-1.5">
        <Link href="/explore" className="hover:text-fg">
          EXPLORE
        </Link>
        /
        <Link href={`/explore?category=${service.category}`} className="hover:text-fg">
          {cat?.short}
        </Link>
        / <span className="text-fg">{service.subcategory.toUpperCase()}</span>
      </nav>

      {paused && <p className="label-fg mt-4 border border-signal px-3 py-2 !text-signal">This service is paused and not accepting new orders.</p>}

      <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_380px] xl:gap-16">
        <div className="min-w-0">
          <h1 className="text-[32px] md:text-[48px]">{service.title}</h1>
          <p className="mt-3 max-w-2xl text-[16px] text-mute">{service.tagline}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-line py-3">
            <Link href={`/creator/${creator.username}`} className="flex items-center gap-2.5 hover:underline">
              <Avatar seed={creator.id} size={32} online={creator.online} />
              <span className="text-[14px] font-medium">{creator.name}</span>
              {creator.verified && <BadgeCheck className="h-4 w-4" aria-label="Verified" />}
            </Link>
            <span className="label">{levelName(creator.level)}</span>
            {service.reviewCount > 0 && (
              <a href="#reviews" className="mono num text-[12px] hover:underline">
                ★ {service.rating.toFixed(1)} <span className="text-mute">({service.reviewCount})</span>
              </a>
            )}
            <span className="mono flex items-center gap-1.5 text-[12px] text-mute">
              <Clock className="h-3.5 w-3.5" /> {delivery(service.packages[0].days)}+
            </span>
            <SaveButton id={service.id} kind="service" withLabel className="ml-auto h-8" />
          </div>

          <div className="mt-6">
            <Gallery service={service} />
          </div>

          <nav aria-label="Sections" className="no-scrollbar sticky top-[var(--header-h)] z-10 -mx-4 mt-8 flex gap-6 overflow-x-auto border-b border-line bg-bg/95 px-4 backdrop-blur md:mx-0 md:px-0">
            {sections.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="label whitespace-nowrap py-3 hover:text-fg">
                {label}
              </a>
            ))}
          </nav>

          <section id="about" className="py-10">
            <h2 className="label-fg">About this service</h2>
            <div className="mt-4 max-w-2xl space-y-4 text-[16px] leading-relaxed">
              {service.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {service.tags.map((t) => (
                <Link key={t} href={`/explore?q=${encodeURIComponent(t)}`}>
                  <Chip className="hover:border-fg">{t}</Chip>
                </Link>
              ))}
            </div>
            {service.whatYouGet.length > 0 && (
              <>
                <h3 className="label-fg mt-10">What you get</h3>
                <ol className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-2">
                  {service.whatYouGet.map((w, i) => (
                    <li key={w} className="flex gap-4 bg-bg p-4 text-[14.5px]">
                      <span className="mono num text-[11px] text-mute">{String(i + 1).padStart(2, "0")}</span>
                      {w}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>

          <section id="packages" className="border-t border-line py-10">
            <h2 className="label-fg mb-4">Compare packages</h2>
            <PackageCompare service={service} />
          </section>

          <section id="process" className="border-t border-line py-10">
            <h2 className="label-fg">Process</h2>
            <ol className="mt-6">
              {service.process.map((p, i) => (
                <li key={p.title} className="grid grid-cols-[40px_1fr] gap-4 border-b border-line py-5 md:grid-cols-[40px_1fr_120px]">
                  <span className="mono num text-[12px] text-mute">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-[16px] font-medium">{p.title}</p>
                    <p className="mt-1 text-[14px] text-mute">{p.body}</p>
                  </div>
                  <span className="label col-start-2 md:col-start-auto md:text-right">{p.days}</span>
                </li>
              ))}
            </ol>
            <h3 className="label-fg mt-10">What the creator needs from you</h3>
            <ul className="mt-4 space-y-2">
              {service.requirements.map((r) => (
                <li key={r} className="flex gap-3 text-[14.5px]">
                  <span className="mt-2.5 h-px w-3 shrink-0 bg-fg" />
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <section id="faq" className="border-t border-line py-10">
            <h2 className="label-fg mb-4">FAQ</h2>
            {service.faq.map((f) => (
              <details key={f.q} className="group border-b border-line py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="mono text-mute transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-[14.5px] text-mute">{f.a}</p>
              </details>
            ))}
          </section>

          <section id="reviews" className="border-t border-line py-10">
            <h2 className="label-fg mb-6">Reviews</h2>
            {service.reviewCount > 0 && <ReviewSummary rating={service.rating} count={service.reviewCount} />}
            <div className="mt-6">
              <ReviewList reviews={reviews} canReply={own} />
            </div>
          </section>

          <section className="border-t border-line py-10">
            <div className="flex items-center justify-between">
              <h2 className="label-fg">About the creator</h2>
              <Availability status={creator.availability} />
            </div>
            <CreatorCard creator={creator} className="mt-4" />
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+24px)]">{panel}</div>
        </aside>
      </div>

      <section className="border-t border-line py-10">
        <h2 className="label-fg mb-6">Similar services</h2>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {similarServices(service, 3).map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>

      {/* mobile purchase */}
      <div className="lg:hidden">
        <div className="mt-2">{panel}</div>
        {!own && !paused && (
          <div className="fixed inset-x-0 bottom-[var(--nav-h)] z-30 flex items-center gap-3 border-t border-fg bg-bg px-4 py-3 md:bottom-0">
            <div className="min-w-0 flex-1">
              <p className="label">{pkg.name}</p>
              <p className="num text-[18px] font-medium">{money(pkg.price)}</p>
            </div>
            <ButtonLink href={checkout} arrow>
              Continue
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}
