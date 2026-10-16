"use client";

import { useState } from "react";
import { BadgeCheck, MapPin, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/brand/Avatar";
import { Artwork } from "@/components/brand/Artwork";
import { Availability, ProjectTile, ReviewList, SaveButton, ServiceCard, useContact } from "@/components/market";
import { Button, ButtonLink, Chip, EmptyState, Modal, Skeleton } from "@/components/ui";
import { CREATORS } from "@/data/creators";
import { projectsByCreator } from "@/data/portfolio";
import { reviewsForCreator } from "@/data/reviews";
import { useApp } from "@/store/app";
import { useCreator, useServices } from "@/store/hooks";
import { dateShort, levelName } from "@/lib/format";
import type { PortfolioProject } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEK = ["OPEN", "LIMITED", "BOOKED"];

export function CreatorView({ username }: { username: string }) {
  const user = useApp((s) => s.user);
  const ready = useApp((s) => s.ready);
  const portfolio = useApp((s) => s.portfolio);
  const availability = useApp((s) => s.availability);
  const written = useApp((s) => s.writtenReviews);
  const services = useServices();
  const contact = useContact();
  const own = user?.username === username;
  const base = useCreator(own ? user!.id : CREATORS.find((c) => c.username === username)?.id);
  const [open, setOpen] = useState<PortfolioProject | null>(null);

  const creator = base && own ? { ...base, availability } : base;
  const projects = creator ? [...portfolio.filter((p) => p.creatorId === creator.id), ...projectsByCreator(creator.id)] : [];

  if (!creator) {
    return ready ? (
      <div className="shell py-16">
        <EmptyState title="Creator not found" action={<ButtonLink href="/explore" arrow>Explore</ButtonLink>} />
      </div>
    ) : (
      <div className="shell py-12">
        <Skeleton className="h-32 w-32" />
        <Skeleton className="mt-6 h-10 w-1/2" />
      </div>
    );
  }

  const list = services.filter((s) => s.creatorId === creator.id && (own || s.status === "active"));
  const reviews = [...written.filter((r) => r.creatorId === creator.id), ...reviewsForCreator(creator.id, 6)];
  const stats = [
    ["RATING", creator.stats.rating ? `★ ${creator.stats.rating.toFixed(1)}` : "—"],
    ["PROJECTS", creator.stats.projects],
    ["CLIENTS", creator.stats.clients],
    ["REPEAT", `${creator.stats.repeatPct}%`],
    ["ON TIME", `${creator.stats.onTimePct}%`],
  ];

  return (
    <div>
      <section className="border-b border-line">
        <div className="shell grid gap-8 py-10 md:grid-cols-[auto_1fr_auto] md:items-end md:py-14">
          <Avatar seed={creator.id} size={136} online={creator.online} label={creator.name} />
          <div className="min-w-0">
            <p className="label-fg flex flex-wrap items-center gap-3">
              {levelName(creator.level)} <Availability status={creator.availability} />
            </p>
            <h1 className="display mt-3 flex items-center gap-3 text-[44px] md:text-[72px]">
              {creator.name}
              {creator.verified && <BadgeCheck className="h-7 w-7 shrink-0 md:h-9 md:w-9" aria-label="Verified" />}
            </h1>
            <p className="mt-3 max-w-2xl text-[16px] text-mute">{creator.headline}</p>
            <p className="mono mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-mute">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {creator.city}
                {creator.country && `, ${creator.country}`}
              </span>
              <span>{creator.timezone}</span>
              <span>{creator.languages.join(" · ")}</span>
              <span>REPLIES {creator.responseTime}</span>
            </p>
          </div>
          <div className="flex gap-2">
            {own ? (
              <ButtonLink href="/seller/settings" variant="outline">
                Edit profile
              </ButtonLink>
            ) : (
              <>
                <Button onClick={() => contact(creator.id)} arrow>
                  <MessageSquare className="h-3.5 w-3.5" /> Contact
                </Button>
                <SaveButton id={creator.id} kind="creator" withLabel />
              </>
            )}
          </div>
        </div>
        <dl className="shell grid grid-cols-2 border-t border-line sm:grid-cols-5">
          {stats.map(([k, v]) => (
            <div key={k} className="border-line py-5 pr-4 sm:border-r sm:pl-4 sm:first:pl-0 sm:last:border-r-0">
              <dt className="label">{k}</dt>
              <dd className="num mt-1.5 text-[26px] font-medium tracking-[-0.03em]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="shell grid gap-12 py-12 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-16">
          <section>
            <h2 className="label-fg">About</h2>
            <div className="mt-4 max-w-2xl space-y-4 text-[16px] leading-relaxed">
              {creator.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {creator.skills.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-1.5">
                {creator.skills.map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="label-fg mb-6">Featured work</h2>
            {projects.length ? (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
                {projects.map((p) => (
                  <ProjectTile key={p.id} project={p} onOpen={() => setOpen(p)} />
                ))}
              </div>
            ) : (
              <EmptyState title="No projects yet" action={own ? <ButtonLink href="/seller/portfolio" size="sm">Add a project</ButtonLink> : undefined} />
            )}
          </section>

          <section>
            <h2 className="label-fg mb-6">Services</h2>
            {list.length ? (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
                {list.map((s) => (
                  <ServiceCard key={s.id} service={s} />
                ))}
              </div>
            ) : (
              <EmptyState title="No services yet" action={own ? <ButtonLink href="/seller/services/new" size="sm">Publish a service</ButtonLink> : undefined} />
            )}
          </section>

          <section>
            <h2 className="label-fg mb-2">Reviews</h2>
            <ReviewList reviews={reviews} canReply={own} />
          </section>
        </div>

        <aside className="space-y-10 lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          <section>
            <h2 className="label-fg">Availability</h2>
            <p className="mt-2 text-[14px] text-mute">Next start {dateShort(creator.nextSlot)}</p>
            <ol className="mt-4 grid grid-cols-8 gap-1" aria-label="Next eight weeks">
              {creator.weeks.map((w, i) => (
                <li key={i} title={`Week ${i + 1}: ${WEEK[w]}`}>
                  <span className={cn("block h-10 rounded-[1px]", w === 0 ? "bg-fg" : w === 1 ? "bg-dots border border-fg" : "border border-line")} />
                  <span className="mono num mt-1 block text-center text-[9.5px] text-mute">W{i + 1}</span>
                </li>
              ))}
            </ol>
            <p className="label mt-3 flex gap-4">
              <span>■ OPEN</span>
              <span>▦ LIMITED</span>
              <span>□ BOOKED</span>
            </p>
          </section>
          {creator.clients.length > 0 && (
            <section>
              <h2 className="label-fg">Clients</h2>
              <ul className="mt-4 grid grid-cols-2 gap-px border border-line bg-line">
                {creator.clients.map((c) => (
                  <li key={c} className="bg-bg px-3 py-4 text-[14px] font-medium tracking-[-0.02em]">
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="text-[13px] text-mute">
            <p>Member since {creator.joined}</p>
            <p>{creator.experienceYears} years of experience</p>
          </section>
        </aside>
      </div>

      <Modal open={!!open} onOpenChange={(v) => !v && setOpen(null)} title={open?.title ?? ""} description={open ? `${open.discipline} · ${open.year}` : undefined} className="max-w-2xl">
        {open && (
          <div>
            <Artwork art={open.art} marks className="aspect-[16/10]" />
            <div className="space-y-5 p-5">
              <p className="text-[15.5px] leading-relaxed">{open.summary}</p>
              <dl className="grid grid-cols-2 gap-4 border-t border-line pt-4">
                <div>
                  <dt className="label">RESULT</dt>
                  <dd className="mt-1 text-[15px] font-medium">{open.result}</dd>
                </div>
                {open.client && (
                  <div>
                    <dt className="label">CLIENT</dt>
                    <dd className="mt-1 text-[15px]">{open.client}</dd>
                  </div>
                )}
              </dl>
              <div className="flex flex-wrap gap-1.5">
                {open.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
