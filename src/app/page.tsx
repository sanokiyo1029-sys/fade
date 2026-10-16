import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Artwork } from "@/components/brand/Artwork";
import { Avatar } from "@/components/brand/Avatar";
import { CreatorRow, ServiceCard } from "@/components/market";
import { ButtonLink, SectionHeader, StatusDot } from "@/components/ui";
import { CATEGORIES } from "@/data/categories";
import { CREATORS, CREATOR_MAP, CLIENTS_POOL } from "@/data/creators";
import { FEATURED_PROJECT_IDS, PROJECTS, projectsByCreator } from "@/data/portfolio";
import { reviewsForService } from "@/data/reviews";
import { SERVICES, servicesByCreator, startingPrice } from "@/data/services";
import { int, levelName } from "@/lib/format";

const STEPS = [
  ["01", "DISCOVER", "Browse fixed-scope packages from vetted independents. Every price, timeline and deliverable is on the page."],
  ["02", "BRIEF", "Pick a package and tell the creator what you need. Questions get answered before anyone pays."],
  ["03", "ESCROW", "Your payment is held by FADE, not the creator. Nothing is released until you approve the work."],
  ["04", "DELIVER", "Review, request revisions, approve. Final files unlock and the creator is paid the same day."],
] as const;

const TICKER = [
  ["Ananya Iyer", "delivered", "Brand identity", "2M"],
  ["Rohan Mehta", "started", "Lead routing build", "6M"],
  ["Kabir Shah", "delivered", "Launch trailer", "11M"],
  ["Meera Pillai", "confirmed", "Marketplace MVP", "14M"],
  ["Elena Rossi", "delivered", "Product renders", "22M"],
  ["Arjun Rao", "released", "Revenue dashboard", "31M"],
  ["Tara Singh", "started", "Pitch deck", "38M"],
  ["Noah Becker", "confirmed", "Support chatbot", "44M"],
];

export default function Home() {
  const trending = [...SERVICES].sort((a, b) => b.rating * Math.log(b.reviewCount + 2) - a.rating * Math.log(a.reviewCount + 2)).slice(0, 8);
  const featured = CREATORS.filter((c) => c.level >= 2).slice(0, 6);
  const projects = FEATURED_PROJECT_IDS.map((id) => PROJECTS.find((p) => p.id === id)).filter((p) => p !== undefined);
  const spotlight = CREATOR_MAP.ananya;
  const testimonials = [SERVICES[0], SERVICES[8], SERVICES[4]].map((s) => ({ s, r: reviewsForService(s, 1)[0] }));
  const totalProjects = CREATORS.reduce((n, c) => n + c.stats.projects, 0);
  const onTime = Math.round(CREATORS.reduce((n, c) => n + c.stats.onTimePct, 0) / CREATORS.length);
  const avgRating = (CREATORS.reduce((n, c) => n + c.stats.rating, 0) / CREATORS.length).toFixed(2);
  const online = CREATORS.filter((c) => c.online).length;

  return (
    <>
      {/* ───── hero ───── */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
        <div className="shell relative grid gap-12 pb-12 pt-12 md:pb-16 md:pt-20 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="label-fg flex items-center gap-2">
              <StatusDot tone="signal" pulse /> {online} CREATORS ONLINE NOW
            </p>
            <h1 className="display mt-6 text-[52px] sm:text-[76px] xl:text-[104px]">
              Independent work,
              <br />
              <span className="text-mute">without the noise.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[16px] text-mute md:text-[17px]">
              Book vetted designers, engineers, editors and strategists on fixed-scope packages. Payment stays in escrow until you approve the work.
            </p>
            <form action="/explore" role="search" className="mt-8 flex max-w-xl rounded-[2px] border border-fg bg-bg">
              <label className="flex flex-1 items-center gap-3 px-4">
                <Search className="h-4 w-4 shrink-0 text-mute" />
                <span className="sr-only">Search services</span>
                <input name="q" placeholder="What do you need built?" className="h-12 w-full bg-transparent text-[15px] outline-none" />
              </label>
              <button type="submit" className="bg-fg px-5 font-mono text-[11.5px] uppercase tracking-[0.06em] text-bg hover:bg-fg/80">
                Search
              </button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="label">POPULAR</span>
              {["Brand identity", "n8n automation", "Pitch deck", "Next.js app", "Reels editing"].map((q) => (
                <Link key={q} href={`/explore?q=${encodeURIComponent(q)}`} className="rounded-[2px] border border-line px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.06em] hover:border-fg">
                  {q}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative">
            <Artwork variant="dots" seed={7} tone="dark" marks density={1.3} className="aspect-[4/5] rounded-[2px] lg:aspect-auto lg:h-full" alt="Halftone field" />
            <dl className="absolute inset-x-3 bottom-3 grid grid-cols-2 gap-px bg-line">
              {STEPS.map(([n, k, body]) => (
                <div key={n} className="bg-bg p-3">
                  <dt className="label-fg">
                    {n} / {k}
                  </dt>
                  <dd className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-mute">{body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ───── live ticker ───── */}
      <div className="overflow-hidden border-b border-line bg-soft py-3" aria-label="Recent activity">
        <div className="flex w-max animate-marquee gap-10 pr-10 hover:[animation-play-state:paused]">
          {[...TICKER, ...TICKER].map(([who, verb, what, t], i) => (
            <span key={i} className="mono flex items-center gap-2.5 whitespace-nowrap text-[12px]" aria-hidden={i >= TICKER.length}>
              <StatusDot tone={verb === "released" ? "signal" : "fg"} />
              <span>{who}</span>
              <span className="text-mute">{verb}</span>
              <span>{what}</span>
              <span className="text-faint">{t} AGO</span>
            </span>
          ))}
        </div>
      </div>

      {/* ───── categories ───── */}
      <section className="shell py-16 md:py-24">
        <SectionHeader index="01 / CATEGORIES" title="Every discipline, one standard." action={<ButtonLink href="/categories" variant="line" size="sm" arrow className="hidden sm:inline-flex">All categories</ButtonLink>} />
        <div className="mt-8 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.slice(0, 8).map((c, i) => (
            <Link key={c.slug} href={`/explore?category=${c.slug}`} className="group/art flex flex-col bg-bg p-4 transition-colors hover:bg-soft md:p-5">
              <div className="flex items-baseline justify-between">
                <span className="mono num text-[11px] text-mute">{String(i + 1).padStart(2, "0")}</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover/art:opacity-100" />
              </div>
              <Artwork art={c.art} className="my-4 aspect-[16/10] rounded-[2px]" />
              <p className="text-[16px] font-medium tracking-[-0.02em] md:text-[18px]">{c.name}</p>
              <p className="mt-1 hidden text-[13px] text-mute md:line-clamp-2">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ───── trending ───── */}
      <section className="shell pb-16 md:pb-24">
        <SectionHeader index="02 / TRENDING" title="Booked most this month." action={<ButtonLink href="/explore?sort=top" variant="line" size="sm" arrow className="hidden sm:inline-flex">Explore</ButtonLink>} />
        <div className="no-scrollbar -mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-x-6 md:gap-y-10 md:overflow-visible md:px-0 lg:grid-cols-4">
          {trending.map((s) => (
            <ServiceCard key={s.id} service={s} className="w-[78vw] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none" />
          ))}
        </div>
      </section>

      {/* ───── featured creators ───── */}
      <section className="shell pb-16 md:pb-24">
        <SectionHeader index="03 / CREATORS" title="People, not profiles." />
        <div className="mt-2">
          {featured.map((c, i) => (
            <CreatorRow key={c.id} creator={c} index={i + 1} from={Math.min(...servicesByCreator(c.id).map(startingPrice))} />
          ))}
        </div>
      </section>

      {/* ───── how it works ───── */}
      <section className="dark-zone">
        <div className="shell py-16 md:py-24">
          <p className="label">04 / HOW IT WORKS</p>
          <h2 className="display mt-4 max-w-3xl text-[40px] md:text-[64px]">Clear scope. Held funds. Same-day payouts.</h2>
          <ol className="mt-12 grid gap-px bg-line md:grid-cols-4">
            {STEPS.map(([n, k, body]) => (
              <li key={n} className="bg-bg p-6">
                <p className="num mono text-[40px] font-medium tracking-[-0.04em]">{n}</p>
                <p className="label-fg mt-8">{k}</p>
                <p className="mt-3 text-[14px] text-mute">{body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <ButtonLink href="/how-it-works" variant="outline" arrow>
              How FADE works
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ───── featured projects ───── */}
      <section className="shell py-16 md:py-24">
        <SectionHeader index="05 / RECENT WORK" title="Shipped through FADE." />
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const c = CREATOR_MAP[p.creatorId];
            return (
              <Link key={p.id} href={`/creator/${c.username}`} className="group/art block">
                <Artwork art={p.art} marks className="aspect-[4/3] rounded-[2px]" />
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <p className="truncate text-[15px] font-medium">{p.title}</p>
                  <span className="label num shrink-0">{p.year}</span>
                </div>
                <p className="label mt-1">
                  {c.name} · {p.result}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───── spotlight ───── */}
      <section className="border-y border-line bg-soft">
        <div className="shell grid gap-10 py-16 md:grid-cols-[1fr_1.4fr] md:py-24">
          <div>
            <p className="label">06 / SPOTLIGHT</p>
            <Avatar seed={spotlight.id} size={160} className="mt-6" label={spotlight.name} />
            <h2 className="mt-6 text-[36px] md:text-[48px]">{spotlight.name}</h2>
            <p className="label-fg mt-2">
              {levelName(spotlight.level)} · {spotlight.city} · {spotlight.experienceYears} YRS
            </p>
            <p className="mt-5 max-w-md text-[15px] text-mute">{spotlight.bio[0]}</p>
            <ButtonLink href={`/creator/${spotlight.username}`} className="mt-8" arrow>
              View profile
            </ButtonLink>
          </div>
          <div className="grid grid-cols-2 gap-4 self-end">
            {projectsByCreator(spotlight.id).map((p, i) => (
              <div key={p.id} className={i === 0 ? "col-span-2" : ""}>
                <Artwork art={p.art} marks className={i === 0 ? "aspect-[16/9] rounded-[2px]" : "aspect-square rounded-[2px]"} />
                <p className="label mt-2">
                  {p.title} · {p.year}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── stats ───── */}
      <section className="shell py-16 md:py-24">
        <p className="label">07 / BY THE NUMBERS</p>
        <dl className="mt-8 grid grid-cols-2 border-l border-t border-line md:grid-cols-4">
          {[
            [int(totalProjects), "PROJECTS DELIVERED"],
            [`${onTime}%`, "ON-TIME DELIVERY"],
            [avgRating, "AVERAGE RATING"],
            ["24H", "MEDIAN FIRST REPLY"],
          ].map(([v, k]) => (
            <div key={k} className="border-b border-r border-line p-5 md:p-8">
              <dd className="num display text-[44px] md:text-[72px]">{v}</dd>
              <dt className="label mt-3">{k}</dt>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
          {CLIENTS_POOL.slice(0, 10).map((c) => (
            <span key={c} className="text-[15px] font-medium tracking-[-0.02em] text-faint">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* ───── testimonials ───── */}
      <section className="shell pb-16 md:pb-24">
        <SectionHeader index="08 / CLIENTS" title="What buyers say." />
        <div className="mt-8 grid gap-px bg-line md:grid-cols-3">
          {testimonials.map(({ s, r }) => (
            <figure key={r.id} className="flex flex-col bg-bg p-6 md:p-8">
              <blockquote className="text-[18px] leading-snug tracking-[-0.01em]">“{r.text}”</blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-8">
                <Avatar seed={r.author} size={36} />
                <span>
                  <span className="block text-[14px] font-medium">{r.author}</span>
                  <Link href={`/service/${s.slug}`} className="label hover:text-fg">
                    {r.country} · {s.subcategory}
                  </Link>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ───── seller CTA ───── */}
      <section className="dark-zone">
        <div className="shell grid items-end gap-10 py-16 md:grid-cols-[1.4fr_1fr] md:py-24">
          <div>
            <p className="label">09 / FOR CREATORS</p>
            <h2 className="display mt-4 text-[44px] md:text-[80px]">
              Sell the work.
              <br />
              Skip the pitch.
            </h2>
          </div>
          <div>
            <p className="text-[15px] text-mute">Publish fixed-scope packages, get paid through escrow, keep 90%. No bidding, no subscriptions.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <ButtonLink href="/for-freelancers" variant="outline" arrow>
                Start selling
              </ButtonLink>
              <ButtonLink href="/info/fees" variant="ghost">
                See fees
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
