"use client";

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { ServiceCard } from "@/components/market";
import { Button, Checkbox, Chip, EmptyState, Modal, RangeSlider, Segmented, Select, Switch } from "@/components/ui";
import { CATEGORIES, CATEGORY_MAP } from "@/data/categories";
import { CREATORS } from "@/data/creators";
import { useServices } from "@/store/hooks";
import { activeFilterCount, applyFilters, DEFAULT_FILTERS, filtersFromParams, filtersToParams, PRICE_MAX, type Filters, type SortKey } from "@/lib/search";
import { levelName, money, moneyShort } from "@/lib/format";
import type { CategorySlug } from "@/lib/types";
import { cn } from "@/lib/utils";

const COUNTRIES = [...new Set(CREATORS.map((c) => c.country))].sort();
const LANGUAGES = [...new Set(CREATORS.flatMap((c) => c.languages))].sort();
const SORTS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "top", label: "Top rated" },
  { value: "recent", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "fastest", label: "Fastest delivery" },
];

export function Explore() {
  const params = useSearchParams();
  const router = useRouter();
  const services = useServices();
  const filters = useMemo(() => filtersFromParams(new URLSearchParams(params.toString())), [params]);
  const deferred = useDeferredValue(filters);
  const results = useMemo(() => applyFilters(services, deferred), [services, deferred]);
  const [layout, setLayout] = useState<"grid" | "row">("grid");
  const [sheet, setSheet] = useState(false);

  const update = (patch: Partial<Filters>) => {
    const qs = filtersToParams({ ...filters, ...patch }).toString();
    router.replace(qs ? `/explore?${qs}` : "/explore", { scroll: false });
  };
  const count = activeFilterCount(filters);
  const cat = filters.categories.length === 1 ? CATEGORY_MAP[filters.categories[0] as CategorySlug] : undefined;

  return (
    <div className="shell py-8 md:py-12">
      <header className="border-b border-line pb-6">
        <p className="label">{cat ? `CATEGORY / ${cat.short}` : "EXPLORE"}</p>
        <h1 className="mt-3 text-[36px] md:text-[56px]">{filters.q ? <>Results for “{filters.q}”</> : cat ? cat.name : "All services"}</h1>
        {cat && <p className="mt-3 max-w-xl text-[15px] text-mute">{cat.blurb}</p>}
        <SearchBox key={filters.q} initial={filters.q} onSearch={(q) => update({ q })} />
      </header>

      <div className="mt-6 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <FilterPanel key={`${filters.minPrice}:${filters.maxPrice}`} filters={filters} update={update} />
        </aside>

        <section aria-label="Results">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="line" size="sm" className="lg:hidden" onClick={() => setSheet(true)}>
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters{count ? ` (${count})` : ""}
            </Button>
            <p className="label num" aria-live="polite">
              {results.length} {results.length === 1 ? "SERVICE" : "SERVICES"}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <Select value={filters.sort} onChange={(e) => update({ sort: e.target.value as SortKey })} aria-label="Sort" className="w-44">
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
              <Segmented
                size="sm"
                className="hidden sm:inline-flex"
                options={[
                  { value: "grid", label: <LayoutGrid className="h-3.5 w-3.5" aria-label="Grid" /> },
                  { value: "row", label: <List className="h-3.5 w-3.5" aria-label="List" /> },
                ]}
                value={layout}
                onChange={setLayout}
              />
            </div>
          </div>

          {count > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {chips(filters).map(([label, patch]) => (
                <Chip key={label} onClick={() => update(patch)}>
                  {label} <X className="h-3 w-3" />
                </Chip>
              ))}
              <button type="button" onClick={() => update({ ...DEFAULT_FILTERS, q: filters.q, sort: filters.sort })} className="label ml-1 underline-offset-2 hover:text-fg hover:underline">
                Clear all
              </button>
            </div>
          )}

          <div className={cn("mt-6 transition-opacity", deferred !== filters && "opacity-50")}>
            {results.length === 0 ? (
              <EmptyState
                title="No matches"
                body="Try fewer filters or a broader search term."
                action={
                  <Button variant="line" size="sm" onClick={() => update({ ...DEFAULT_FILTERS })}>
                    Reset filters
                  </Button>
                }
              />
            ) : layout === "grid" ? (
              <>
                <div className="hidden gap-x-6 gap-y-10 sm:grid sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((s) => (
                    <ServiceCard key={s.id} service={s} />
                  ))}
                </div>
                <div className="border-t border-line sm:hidden">
                  {results.map((s) => (
                    <ServiceCard key={s.id} service={s} layout="row" />
                  ))}
                </div>
              </>
            ) : (
              <div className="border-t border-line">
                {results.map((s) => (
                  <ServiceCard key={s.id} service={s} layout="row" />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <Modal open={sheet} onOpenChange={setSheet} side="bottom" title="Filters" description={`${results.length} services match`}>
        <div className="p-5">
          <FilterPanel key={`${filters.minPrice}:${filters.maxPrice}`} filters={filters} update={update} />
        </div>
        <div className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-line bg-bg p-4">
          <Button variant="line" onClick={() => update({ ...DEFAULT_FILTERS, q: filters.q })}>
            Reset
          </Button>
          <Button onClick={() => setSheet(false)}>Show {results.length}</Button>
        </div>
      </Modal>
    </div>
  );
}

function SearchBox({ initial, onSearch }: { initial: string; onSearch: (q: string) => void }) {
  const [q, setQ] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(q.trim());
      }}
      role="search"
      className="mt-6 flex max-w-xl rounded-[2px] border border-line focus-within:border-fg"
    >
      <label className="flex flex-1 items-center gap-3 px-3">
        <Search className="h-4 w-4 text-mute" />
        <span className="sr-only">Search</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services" className="h-11 w-full bg-transparent text-[15px] outline-none" />
      </label>
      {q && (
        <button type="button" onClick={() => (setQ(""), onSearch(""))} aria-label="Clear search" className="px-3 text-mute hover:text-fg">
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}

/** Label + the patch that removes it. */
function chips(f: Filters): [string, Partial<Filters>][] {
  const out: [string, Partial<Filters>][] = [];
  f.categories.forEach((c) => out.push([CATEGORY_MAP[c as CategorySlug]?.short ?? c, { categories: f.categories.filter((x) => x !== c) }]));
  if (f.minPrice > 0 || f.maxPrice < PRICE_MAX) out.push([`${moneyShort(f.minPrice)}–${moneyShort(f.maxPrice)}`, { minPrice: 0, maxPrice: PRICE_MAX }]);
  if (f.maxDays) out.push([`≤ ${f.maxDays} DAYS`, { maxDays: 0 }]);
  if (f.minRating) out.push([`★ ${f.minRating}+`, { minRating: 0 }]);
  if (f.minExperience) out.push([`${f.minExperience}+ YRS`, { minExperience: 0 }]);
  if (f.country) out.push([f.country, { country: "" }]);
  f.languages.forEach((l) => out.push([l, { languages: f.languages.filter((x) => x !== l) }]));
  if (f.availability) out.push([f.availability === "open" ? "AVAILABLE NOW" : "HAS CAPACITY", { availability: "" }]);
  if (f.verified) out.push(["VERIFIED", { verified: false }]);
  f.levels.forEach((l) => out.push([levelName(l as 1 | 2 | 3), { levels: f.levels.filter((x) => x !== l) }]));
  return out;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={title} className="border-b border-line py-5 first:pt-0">
      <p className="label-fg mb-3">{title}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Options<T extends string | number>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([v, l]) => (
        <Chip key={String(v)} active={value === v} onClick={() => onChange(v)}>
          {l}
        </Chip>
      ))}
    </div>
  );
}

function FilterPanel({ filters: f, update }: { filters: Filters; update: (p: Partial<Filters>) => void }) {
  const [price, setPrice] = useState([f.minPrice, f.maxPrice]);
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div>
      <Group title="Category">
        {CATEGORIES.map((c) => (
          <Checkbox key={c.slug} checked={f.categories.includes(c.slug)} onChange={() => update({ categories: toggle(f.categories, c.slug) })}>
            {c.name}
          </Checkbox>
        ))}
      </Group>
      <Group title="Budget">
        <RangeSlider label="Budget" min={0} max={PRICE_MAX} step={2500} value={price} onChange={setPrice} onCommit={([a, b]) => update({ minPrice: a, maxPrice: b })} />
        <p className="mono num flex justify-between text-[12px] text-mute">
          <span>{money(price[0])}</span>
          <span>{price[1] >= PRICE_MAX ? `${money(PRICE_MAX)}+` : money(price[1])}</span>
        </p>
      </Group>
      <Group title="Delivery">
        <Options value={f.maxDays} onChange={(v) => update({ maxDays: v })} options={[[0, "Any"], [1, "24 hrs"], [3, "3 days"], [7, "7 days"], [14, "14 days"]]} />
      </Group>
      <Group title="Rating">
        <Options value={f.minRating} onChange={(v) => update({ minRating: v })} options={[[0, "Any"], [4.5, "4.5+"], [4.8, "4.8+"], [4.9, "4.9+"]]} />
      </Group>
      <Group title="Experience">
        <Options value={f.minExperience} onChange={(v) => update({ minExperience: v })} options={[[0, "Any"], [3, "3+ yrs"], [5, "5+ yrs"], [8, "8+ yrs"]]} />
      </Group>
      <Group title="Availability">
        <Options<Filters["availability"]> value={f.availability} onChange={(v) => update({ availability: v })} options={[["", "Any"], ["open", "Available now"], ["limited", "Has capacity"]]} />
      </Group>
      <Group title="Seller level">
        {([3, 2, 1] as const).map((l) => (
          <Checkbox key={l} checked={f.levels.includes(l)} onChange={() => update({ levels: toggle(f.levels, l) })}>
            {levelName(l).charAt(0) + levelName(l).slice(1).toLowerCase()}
          </Checkbox>
        ))}
        <label className="flex items-center justify-between pt-2 text-[14px]">
          Verified only
          <Switch label="Verified only" checked={f.verified} onChange={(v) => update({ verified: v })} />
        </label>
      </Group>
      <Group title="Location">
        <Select value={f.country} onChange={(e) => update({ country: e.target.value })} aria-label="Country">
          <option value="">Anywhere</option>
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Group>
      <Group title="Languages">
        {LANGUAGES.map((l) => (
          <Checkbox key={l} checked={f.languages.includes(l)} onChange={() => update({ languages: toggle(f.languages, l) })}>
            {l}
          </Checkbox>
        ))}
      </Group>
    </div>
  );
}
