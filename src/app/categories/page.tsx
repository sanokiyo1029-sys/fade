import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Artwork } from "@/components/brand/Artwork";
import { CATEGORIES } from "@/data/categories";
import { SERVICES, startingPrice } from "@/data/services";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Categories" };

export default function Categories() {
  return (
    <div className="shell py-8 md:py-12">
      <p className="label">CATEGORIES / {CATEGORIES.length}</p>
      <h1 className="display mt-3 text-[44px] md:text-[80px]">Browse by discipline.</h1>
      <div className="mt-10 border-t border-fg">
        {CATEGORIES.map((c, i) => {
          const list = SERVICES.filter((s) => s.category === c.slug);
          const from = list.length ? Math.min(...list.map(startingPrice)) : 0;
          return (
            <section key={c.slug} className="group/art grid gap-5 border-b border-line py-6 md:grid-cols-[48px_200px_1fr_auto] md:items-center md:gap-8">
              <span className="mono num hidden text-[12px] text-mute md:block">{String(i + 1).padStart(2, "0")}</span>
              <Link href={`/explore?category=${c.slug}`} aria-label={c.name} tabIndex={-1}>
                <Artwork art={c.art} className="aspect-[16/9] rounded-[2px]" />
              </Link>
              <div>
                <h2 className="text-[24px] md:text-[32px]">
                  <Link href={`/explore?category=${c.slug}`} className="hover:underline">
                    {c.name}
                  </Link>
                </h2>
                <p className="mt-1.5 text-[14px] text-mute">{c.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {c.subcategories.map((s) => (
                    <Link key={s} href={`/explore?category=${c.slug}&q=${encodeURIComponent(s)}`} className="mono text-[12px] text-mute hover:text-fg">
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="mono flex items-center gap-3 text-[12px] md:flex-col md:items-end">
                <span className="num">{list.length} SERVICES</span>
                {from > 0 && <span className="num text-mute">FROM {money(from)}</span>}
                <ArrowUpRight className="h-5 w-5" aria-hidden />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
