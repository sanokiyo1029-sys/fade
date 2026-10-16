import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INFO, INFO_SLUGS } from "@/data/info";

export const generateStaticParams = () => INFO_SLUGS.map((slug) => ({ slug }));
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/info/[slug]">): Promise<Metadata> {
  const page = INFO[(await params).slug];
  return page ? { title: page.title, description: page.lede } : {};
}

export default async function Info({ params }: PageProps<"/info/[slug]">) {
  const slug = (await params).slug;
  const page = INFO[slug];
  if (!page) notFound();
  return (
    <div className="shell grid gap-12 py-10 md:grid-cols-[200px_1fr] md:py-16">
      <nav aria-label="Information pages" className="order-last md:order-first">
        <ul className="space-y-2 md:sticky md:top-[calc(var(--header-h)+40px)]">
          {INFO_SLUGS.map((s) => (
            <li key={s}>
              <Link href={`/info/${s}`} aria-current={s === slug ? "page" : undefined} className={`text-[14px] ${s === slug ? "text-fg" : "text-mute hover:text-fg"}`}>
                {INFO[s].title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <article className="max-w-2xl">
        <p className="label">INFO / {slug.toUpperCase()}</p>
        <h1 className="display mt-3 text-[44px] md:text-[64px]">{page.title}</h1>
        <p className="mt-5 text-[18px] text-mute">{page.lede}</p>
        {page.sections.map(([h, ps]) => (
          <section key={h} className="mt-10 border-t border-line pt-6">
            <h2 className="text-[22px]">{h}</h2>
            {ps.map((p, i) => (
              <p key={i} className="mt-3 text-[15.5px] leading-relaxed">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}
