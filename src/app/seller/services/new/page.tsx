"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Shuffle, Upload, X } from "lucide-react";
import { Artwork } from "@/components/brand/Artwork";
import { ServiceCard } from "@/components/market";
import { Button, Field, Input, Select, Skeleton, Textarea } from "@/components/ui";
import { CATEGORIES, CATEGORY_MAP } from "@/data/categories";
import { defaultsFor } from "@/data/services";
import { newDraft, useApp } from "@/store/app";
import { useRequireAuth } from "@/store/hooks";
import { toast } from "@/store/ui";
import { getBlob, registerBlob } from "@/lib/blobs";
import { clock, money } from "@/lib/format";
import type { ArtVariant, CategorySlug, Service, ServiceDraft } from "@/lib/types";
import { cn, uid } from "@/lib/utils";

const STEPS = ["Overview", "Description", "Pricing", "Media", "Requirements", "Publish"];
const VARIANTS: ArtVariant[] = ["dots", "lines", "rings", "grid", "bars", "blocks", "wire", "wave", "scatter", "glyph"];

/** Returns the first problem with a step, or null when it's complete. */
function problem(d: ServiceDraft, step: number): string | null {
  switch (step) {
    case 0:
      if (d.title.trim().length < 15) return "Title needs at least 15 characters.";
      if (!d.category) return "Pick a category.";
      return null;
    case 1:
      if (d.tagline.trim().length < 10) return "Tagline needs at least 10 characters.";
      if (d.description.trim().length < 80) return "Description needs at least 80 characters.";
      return null;
    case 2:
      for (const p of d.packages) {
        if (!(Number(p.price) >= 500)) return `${p.name}: minimum price is ₹500.`;
        if (!(Number(p.days) >= 1)) return `${p.name}: delivery must be at least 1 day.`;
        if (!p.deliverables.trim()) return `${p.name}: list at least one deliverable.`;
      }
      if (!(Number(d.packages[0].price) < Number(d.packages[1].price) && Number(d.packages[1].price) < Number(d.packages[2].price))) return "Package prices should increase from Starter to Advanced.";
      return null;
    default:
      return null;
  }
}

function preview(d: ServiceDraft, creatorId: string): Service {
  const cat = (d.category || "design") as CategorySlug;
  return {
    id: "preview",
    slug: "",
    creatorId,
    category: cat,
    subcategory: d.subcategory,
    title: d.title || "Your service title",
    tagline: d.tagline,
    description: [],
    tags: d.tags,
    rating: 0,
    reviewCount: 0,
    projects: 0,
    packages: d.packages.map((p, i) => ({ tier: i + 1, name: p.name, price: Number(p.price) || 0, days: Number(p.days) || 1, revisions: null, support: "", deliverables: [], featureCount: 0 })) as unknown as Service["packages"],
    features: [],
    whatYouGet: [],
    process: [],
    requirements: [],
    faq: [],
    art: { variant: d.cover, seed: d.coverSeed },
    media: d.media.map((m) => getBlob(m.id)).filter((u): u is string => !!u),
    createdAt: "",
    queue: 0,
    status: "draft",
  };
}

export default function NewService() {
  const { ready, user } = useRequireAuth();
  const stored = useApp((s) => s.draft);
  const setDraft = useApp((s) => s.setDraft);
  const clearDraft = useApp((s) => s.clearDraft);
  const publish = useApp((s) => s.publishService);
  const router = useRouter();
  const [tag, setTag] = useState("");
  const [shownError, setShownError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  if (!ready || !user) return <div className="shell py-12"><Skeleton className="h-96" /></div>;
  const d = stored ?? newDraft();
  const step = d.step;
  const set = (patch: Partial<ServiceDraft>) => setDraft({ ...d, ...patch });
  const setPkg = (i: number, k: keyof ServiceDraft["packages"][number], v: string) => set({ packages: d.packages.map((p, j) => (j === i ? { ...p, [k]: v } : p)) });
  const go = (to: number) => {
    // forward moves must pass every step in between
    for (let s = step; s < to; s++) {
      const err = problem(d, s);
      if (err) {
        setShownError(err);
        return set({ step: s });
      }
    }
    setShownError(null);
    set({ step: to });
    window.scrollTo({ top: 0 });
  };
  const addTag = () => {
    const t = tag.trim();
    if (t && !d.tags.includes(t) && d.tags.length < 6) set({ tags: [...d.tags, t] });
    setTag("");
  };

  return (
    <div className="shell py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label num">
            NEW SERVICE / {String(step + 1).padStart(2, "0")} OF {String(STEPS.length).padStart(2, "0")}
          </p>
          <h1 className="display mt-3 text-[40px] md:text-[56px]">{STEPS[step]}</h1>
        </div>
        <p className="label" aria-live="polite">
          {d.savedAt ? `DRAFT SAVED ${clock(d.savedAt)}` : "DRAFT"}
          {stored && (
            <button
              type="button"
              className="ml-3 underline hover:text-fg"
              onClick={() => {
                if (window.confirm("Discard this draft?")) clearDraft();
              }}
            >
              DISCARD
            </button>
          )}
        </p>
      </div>
      <ol className="mt-6 grid grid-cols-6 gap-1">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => go(i)} className="block w-full text-left" aria-current={i === step ? "step" : undefined}>
              <span className={cn("block h-1", i <= step ? "bg-fg" : "bg-line")} />
              <span className={cn("mt-2 hidden font-mono text-[10.5px] uppercase tracking-[0.06em] sm:block", i <= step ? "text-fg" : "text-faint")}>{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          {step === 0 && (
            <>
              <Field label="Title" hint={`${d.title.length}/80 · Say what the client gets, e.g. "A complete brand identity, from mark to rulebook".`}>
                <Input value={d.title} maxLength={80} onChange={(e) => set({ title: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <Select value={d.category} onChange={(e) => set({ category: e.target.value as CategorySlug, subcategory: "" })}>
                    <option value="">Choose…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Subcategory">
                  <Select value={d.subcategory} onChange={(e) => set({ subcategory: e.target.value })} disabled={!d.category}>
                    <option value="">Choose…</option>
                    {d.category && CATEGORY_MAP[d.category].subcategories.map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
              </div>
              <Field label="Tags" hint="Up to 6. Press Enter to add.">
                <div className="flex flex-wrap items-center gap-1.5 rounded-[2px] border border-line p-1.5 focus-within:border-fg">
                  {d.tags.map((t) => (
                    <span key={t} className="mono flex h-7 items-center gap-1 rounded-[2px] bg-fg px-2 text-[11px] text-bg">
                      {t}
                      <button type="button" aria-label={`Remove ${t}`} onClick={() => set({ tags: d.tags.filter((x) => x !== t) })}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    onBlur={addTag}
                    className="h-7 min-w-24 flex-1 bg-transparent px-1.5 text-[14px] outline-none"
                    placeholder={d.tags.length ? "" : "Figma, Branding…"}
                  />
                </div>
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="Tagline" hint="One sentence under the title.">
                <Input value={d.tagline} maxLength={140} onChange={(e) => set({ tagline: e.target.value })} />
              </Field>
              <Field label="Description" hint={`${d.description.trim().length} characters · Separate paragraphs with a blank line.`}>
                <Textarea value={d.description} onChange={(e) => set({ description: e.target.value })} className="min-h-64" placeholder="Who it's for, what's included, how you work, what makes it different." />
              </Field>
            </>
          )}

          {step === 2 && (
            <div className="grid gap-4 xl:grid-cols-3">
              {d.packages.map((p, i) => (
                <fieldset key={p.name} className="space-y-3 rounded-[2px] border border-line p-4">
                  <legend className="label-fg px-1">{p.name}</legend>
                  <Field label="Price (₹)">
                    <Input type="number" inputMode="numeric" min={500} step={500} value={p.price} onChange={(e) => setPkg(i, "price", e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Days">
                      <Input type="number" min={1} value={p.days} onChange={(e) => setPkg(i, "days", e.target.value)} />
                    </Field>
                    <Field label="Revisions">
                      <Select value={p.revisions} onChange={(e) => setPkg(i, "revisions", e.target.value)}>
                        {["0", "1", "2", "3", "5", "∞"].map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <Field label="Deliverables" hint="One per line.">
                    <Textarea value={p.deliverables} onChange={(e) => setPkg(i, "deliverables", e.target.value)} className="min-h-32" />
                  </Field>
                </fieldset>
              ))}
            </div>
          )}

          {step === 3 && (
            <>
              <div>
                <p className="label mb-3">Generated cover</p>
                <div className="grid grid-cols-5 gap-2">
                  {VARIANTS.map((v) => (
                    <button key={v} type="button" onClick={() => set({ cover: v })} aria-pressed={d.cover === v} aria-label={`${v} cover`} className={cn("rounded-[2px] p-px", d.cover === v ? "outline outline-1 outline-fg" : "opacity-60 hover:opacity-100")}>
                      <Artwork variant={v} seed={d.coverSeed} className="aspect-[4/3] rounded-[1px]" />
                    </button>
                  ))}
                </div>
                <Button variant="line" size="sm" className="mt-3" onClick={() => set({ coverSeed: Math.floor(Math.random() * 900) + 100 })}>
                  <Shuffle className="h-3.5 w-3.5" /> Shuffle
                </Button>
              </div>
              <div>
                <p className="label mb-3">Or upload images · shown in greyscale, kept for this session</p>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    const files = [...(e.target.files ?? [])].filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024).slice(0, 4 - d.media.length);
                    set({ media: [...d.media, ...files.map((f) => { const id = uid("img"); registerBlob(id, f); return { id, name: f.name }; })] });
                    e.target.value = "";
                  }}
                />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {d.media.map((m) => {
                    const src = getBlob(m.id);
                    return (
                      <div key={m.id} className="relative aspect-[4/3] overflow-hidden rounded-[2px] border border-line bg-soft">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {src ? <img src={src} alt={m.name} className="h-full w-full object-cover grayscale" /> : <p className="label p-2">{m.name} (reload cleared it)</p>}
                        <button type="button" onClick={() => set({ media: d.media.filter((x) => x.id !== m.id) })} className="absolute right-1 top-1 rounded-[2px] bg-bg p-1" aria-label={`Remove ${m.name}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                  {d.media.length < 4 && (
                    <button type="button" onClick={() => fileInput.current?.click()} className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-[2px] border border-dashed border-line text-mute hover:border-fg hover:text-fg">
                      <Upload className="h-4 w-4" />
                      <span className="label">Upload</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {step === 4 && <Requirements d={d} set={set} />}

          {step === 5 && (
            <dl className="divide-y divide-line border-y border-line">
              {[
                ["Title", d.title],
                ["Category", `${d.category ? CATEGORY_MAP[d.category].name : "—"} · ${d.subcategory || "General"}`],
                ["Tags", d.tags.join(", ") || "—"],
                ["Packages", d.packages.map((p) => `${p.name} ${money(Number(p.price))} / ${p.days}d`).join(" · ")],
                ["Requirements", `${(d.requirements.length ? d.requirements : defaultsFor((d.category || "design") as CategorySlug).requirements).length} items`],
                ["FAQ", `${d.faq.length || "Category default"} questions`],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]">
                  <dt className="label">{k}</dt>
                  <dd className="text-[14px]">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {shownError && (
            <p role="alert" className="label-fg !text-signal">
              {shownError}
            </p>
          )}
          <div className="flex gap-2 border-t border-line pt-6">
            {step > 0 && (
              <Button variant="line" size="lg" onClick={() => go(step - 1)}>
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button size="lg" onClick={() => go(step + 1)} arrow>
                Continue
              </Button>
            ) : (
              <Button
                size="lg"
                arrow
                onClick={() => {
                  for (let s = 0; s < STEPS.length; s++) {
                    const err = problem(d, s);
                    if (err) return (setShownError(err), set({ step: s }));
                  }
                  const svc = publish({ ...d, requirements: d.requirements.filter((r) => r.trim()), faq: d.faq.filter((f) => f.q.trim() && f.a.trim()) });
                  toast("Service published", "It's live in search now.", "success");
                  router.push(`/service/${svc.slug}`);
                }}
              >
                Publish service
              </Button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          <p className="label mb-3">Live preview</p>
          <div className="pointer-events-none">
            <ServiceCard service={preview(d, user.id)} />
          </div>
          {d.tagline && <p className="mt-3 text-[13px] text-mute">{d.tagline}</p>}
        </aside>
      </div>
    </div>
  );
}

function Requirements({ d, set }: { d: ServiceDraft; set: (p: Partial<ServiceDraft>) => void }) {
  const defaults = defaultsFor((d.category || "design") as CategorySlug);
  const reqs = d.requirements.length ? d.requirements : defaults.requirements;
  const faq = d.faq.length ? d.faq : defaults.faq;
  return (
    <>
      <div>
        <p className="label-fg mb-1">What you need from the client</p>
        <p className="mb-3 text-[13px] text-mute">Pre-filled with the category defaults — edit freely.</p>
        <div className="space-y-2">
          {reqs.map((r, i) => (
            <div key={i} className="flex gap-2">
              <Input value={r} onChange={(e) => set({ requirements: reqs.map((x, j) => (j === i ? e.target.value : x)) })} aria-label={`Requirement ${i + 1}`} />
              <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => set({ requirements: reqs.filter((_, j) => j !== i) })}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="line" size="sm" onClick={() => set({ requirements: [...reqs, ""] })}>
            <Plus className="h-3.5 w-3.5" /> Add requirement
          </Button>
        </div>
      </div>
      <div>
        <p className="label-fg mb-3">FAQ</p>
        <div className="space-y-4">
          {faq.map((f, i) => (
            <div key={i} className="space-y-2 rounded-[2px] border border-line p-3">
              <Input value={f.q} placeholder="Question" onChange={(e) => set({ faq: faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) })} aria-label={`Question ${i + 1}`} />
              <Textarea value={f.a} placeholder="Answer" onChange={(e) => set({ faq: faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) })} className="min-h-20" aria-label={`Answer ${i + 1}`} />
              <button type="button" className="label hover:text-fg" onClick={() => set({ faq: faq.filter((_, j) => j !== i) })}>
                REMOVE
              </button>
            </div>
          ))}
          <Button variant="line" size="sm" onClick={() => set({ faq: [...faq, { q: "", a: "" }] })}>
            <Plus className="h-3.5 w-3.5" /> Add question
          </Button>
        </div>
      </div>
    </>
  );
}
