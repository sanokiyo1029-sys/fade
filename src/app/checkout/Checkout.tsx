"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/brand/Avatar";
import { Cover } from "@/components/brand/Artwork";
import { Button, ButtonLink, Checkbox, EmptyState, Field, Segmented, Skeleton, Textarea } from "@/components/ui";
import { EXTRAS, quote } from "@/data/services";
import { useApp } from "@/store/app";
import { useCreator, useRequireAuth, useService } from "@/store/hooks";
import { toast } from "@/store/ui";
import { delivery, money } from "@/lib/format";
import { cn } from "@/lib/utils";

const STEPS = ["Brief", "Payment", "Confirm"];
const METHODS = { card: "Visa •••• 4242", upi: "UPI · rohan@okfade", bank: "Net banking · HDFC" } as const;

export function Checkout({ serviceId, tier: initialTier }: { serviceId: string; tier: 1 | 2 | 3 }) {
  const { ready, user } = useRequireAuth();
  const service = useService(serviceId);
  const creator = useCreator(service?.creatorId);
  const createOrder = useApp((s) => s.createOrder);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState(initialTier);
  const [brief, setBrief] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [method, setMethod] = useState<keyof typeof METHODS>("card");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!ready || !user) return <div className="shell py-12"><Skeleton className="h-96" /></div>;
  if (!service || !creator) return <div className="shell py-16"><EmptyState title="Nothing to check out" body="Pick a package on a service page first." action={<ButtonLink href="/explore" arrow>Explore</ButtonLink>} /></div>;
  if (service.creatorId === user.id) return <div className="shell py-16"><EmptyState title="This is your own service" action={<ButtonLink href="/seller/services" variant="line">Manage services</ButtonLink>} /></div>;

  const q = quote(service, tier, extras);
  const briefOk = brief.trim().length >= 20;

  const pay = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, tier, extras }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed");
      const id = createOrder({ serviceId: service.id, tier, brief: brief.trim(), extras, price: q.subtotal, days: q.days, method: METHODS[method] });
      if (data.url) return window.location.assign(data.url); // live Stripe Checkout; returns to /orders
      toast(`Order ${id} placed`, `${money(q.total)} is held in escrow.`, "success");
      router.push(`/orders/${id}`);
    } catch (e) {
      toast("Payment didn't go through", e instanceof Error ? e.message : undefined, "error");
      setBusy(false);
    }
  };

  return (
    <div className="shell py-8 md:py-12">
      <Link href={`/service/${service.slug}`} className="label hover:text-fg">
        ← BACK TO SERVICE
      </Link>
      <h1 className="display mt-4 text-[40px] md:text-[56px]">Checkout</h1>
      <ol className="mt-6 grid max-w-xl grid-cols-3 gap-1">
        {STEPS.map((s, i) => (
          <li key={s}>
            <span className={cn("block h-1", i <= step ? "bg-fg" : "bg-line")} />
            <span className={cn("mt-2 block font-mono text-[10.5px] uppercase tracking-[0.06em]", i <= step ? "text-fg" : "text-faint")}>
              {String(i + 1).padStart(2, "0")} / {s}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {step === 0 && (
            <section className="space-y-8">
              <div>
                <p className="label-fg mb-3">Package</p>
                <Segmented className="flex w-full max-w-md" options={service.packages.map((p) => ({ value: String(p.tier) as "1" | "2" | "3", label: p.name }))} value={String(tier) as "1" | "2" | "3"} onChange={(v) => setTier(Number(v) as 1 | 2 | 3)} />
              </div>
              <Field label="Project brief" hint={briefOk ? `${brief.trim().length} characters` : "At least 20 characters. Goals, references, deadlines — anything the creator should know."}>
                <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} className="min-h-44" placeholder={service.requirements.slice(0, 2).join(". ") + "."} />
              </Field>
              <div>
                <p className="label-fg mb-3">Add-ons</p>
                <div className="space-y-3">
                  {EXTRAS.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-4 rounded-[2px] border border-line p-4">
                      <Checkbox checked={extras.includes(e.id)} onChange={(on) => setExtras(on ? [...extras, e.id] : extras.filter((x) => x !== e.id))}>
                        <span>
                          <span className="block font-medium">{e.label}</span>
                          <span className="block text-[13px] text-mute">{e.body}</span>
                        </span>
                      </Checkbox>
                      <span className="num mono text-[12px]">+{money(Math.round(q.pkg.price * e.pct))}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button size="lg" disabled={!briefOk} onClick={() => setStep(1)} arrow>
                Continue to payment
              </Button>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-6">
              <p className="label-fg flex items-center gap-2">
                <span className="rounded-[2px] border border-signal px-1.5 py-0.5 !text-signal">TEST MODE</span> No real money moves.
              </p>
              <Segmented
                className="flex w-full max-w-md"
                options={[
                  { value: "card", label: "Card" },
                  { value: "upi", label: "UPI" },
                  { value: "bank", label: "Net banking" },
                ]}
                value={method}
                onChange={setMethod}
              />
              <div className="bg-grid-fine max-w-md rounded-[2px] border border-fg p-5">
                <p className="label">{method === "card" ? "SAVED CARD" : method === "upi" ? "UPI ID" : "BANK"}</p>
                <p className="mono num mt-6 text-[20px]">{METHODS[method]}</p>
                <p className="label mt-6">Test credentials — payments are simulated unless Stripe keys are configured.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="line" size="lg" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button size="lg" onClick={() => setStep(2)} arrow>
                  Review order
                </Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-6">
              <dl className="divide-y divide-line border-y border-line">
                {[
                  ["Package", `${q.pkg.name} · ${delivery(q.days)}`],
                  ["Revisions", q.pkg.revisions === null ? "Unlimited" : q.pkg.revisions],
                  ["Payment", METHODS[method]],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3 text-[14px]">
                    <dt className="text-mute">{k}</dt>
                    <dd className="num text-right">{v}</dd>
                  </div>
                ))}
                <div className="py-3 text-[14px]">
                  <dt className="text-mute">Brief</dt>
                  <dd className="mt-1 line-clamp-4 whitespace-pre-line">{brief}</dd>
                </div>
              </dl>
              <Checkbox checked={agree} onChange={setAgree}>
                <span className="text-[13.5px]">
                  I agree to the{" "}
                  <Link href="/info/terms" className="underline" target="_blank">
                    terms
                  </Link>
                  . Funds stay in escrow until I approve the work.
                </span>
              </Checkbox>
              <div className="flex gap-2">
                <Button variant="line" size="lg" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button size="lg" disabled={!agree || busy} onClick={pay} className="flex-1 sm:flex-none">
                  <Lock className="h-3.5 w-3.5" /> {busy ? "Processing…" : `Pay ${money(q.total)}`}
                </Button>
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:self-start">
          <div className="rounded-[2px] border border-line">
            <div className="flex gap-4 border-b border-line p-4">
              <Cover art={service.art} media={service.media?.[0]} className="aspect-[4/3] w-24 shrink-0 rounded-[2px]" />
              <div className="min-w-0">
                <p className="line-clamp-2 text-[14px] font-medium">{service.title}</p>
                <p className="mt-2 flex items-center gap-2 text-[12.5px] text-mute">
                  <Avatar seed={creator.id} size={18} /> {creator.name}
                </p>
              </div>
            </div>
            <dl className="mono space-y-2 p-4 text-[12.5px]">
              <div className="flex justify-between">
                <dt>{q.pkg.name}</dt>
                <dd className="num">{money(q.pkg.price)}</dd>
              </div>
              {q.lines.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <dt>{l.label}</dt>
                  <dd className="num">{money(l.amount)}</dd>
                </div>
              ))}
              <div className="flex justify-between text-mute">
                <dt>Service fee (5%)</dt>
                <dd className="num">{money(q.fee)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-[15px] text-fg">
                <dt>TOTAL</dt>
                <dd className="num font-medium">{money(q.total)}</dd>
              </div>
              <div className="flex justify-between text-mute">
                <dt>Delivery</dt>
                <dd>{delivery(q.days)}</dd>
              </div>
            </dl>
            <p className="flex gap-2 border-t border-line p-4 text-[12.5px] text-mute">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fg" />
              Held in escrow by FADE. Cancel for a full refund until the creator confirms.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
