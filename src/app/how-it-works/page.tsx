import type { Metadata } from "next";
import { Artwork } from "@/components/brand/Artwork";
import { ButtonLink } from "@/components/ui";
import { INFO } from "@/data/info";

export const metadata: Metadata = { title: "How it works", description: "Fixed-scope packages, escrowed payments and one workspace per order." };

const STEPS = [
  ["01", "Find the right person", "Search by what you need, not by job title. Every service shows three fixed packages with price, timeline, revisions and deliverables up front.", "dots"],
  ["02", "Brief and book", "Pick a package, write a brief, add extras. Ask the creator anything first — messages are free and stay attached to the order.", "lines"],
  ["03", "Pay into escrow", "Your payment is held by FADE. The creator sees that the money is there; they don't see your card and can't touch the funds yet.", "rings"],
  ["04", "Work in one place", "Milestones, files, messages and the activity log live in the order workspace. Request revisions when work is submitted for review.", "grid"],
  ["05", "Approve and release", "Approve the work to unlock final files, then release payment. The creator is paid the same day. Leave a review while it's fresh.", "blocks"],
] as const;

export default function HowItWorks() {
  return (
    <>
      <section className="shell py-12 md:py-20">
        <p className="label">HOW IT WORKS</p>
        <h1 className="display mt-4 max-w-4xl text-[48px] md:text-[96px]">Five steps. No bidding.</h1>
        <p className="mt-6 max-w-xl text-[17px] text-mute">FADE replaces proposals and back-and-forth with fixed-scope packages and money held in escrow.</p>
      </section>
      <ol className="border-t border-line">
        {STEPS.map(([n, title, body, art], i) => (
          <li key={n} className="border-b border-line">
            <div className="shell grid items-center gap-8 py-10 md:grid-cols-2 md:py-16">
              <div className={i % 2 ? "md:order-last" : ""}>
                <p className="mono num text-[56px] font-medium tracking-[-0.05em] md:text-[80px]">{n}</p>
                <h2 className="mt-4 text-[28px] md:text-[40px]">{title}</h2>
                <p className="mt-4 max-w-md text-[16px] text-mute">{body}</p>
              </div>
              <Artwork variant={art} seed={Number(n) * 13} marks className="aspect-[16/10] rounded-[2px]" />
            </div>
          </li>
        ))}
      </ol>
      <section className="dark-zone">
        <div className="shell grid gap-10 py-16 md:grid-cols-3 md:py-24">
          {INFO.help.sections.slice(0, 3).map(([q, [a]]) => (
            <div key={q}>
              <h2 className="text-[20px]">{q}</h2>
              <p className="mt-3 text-[14.5px] text-mute">{a}</p>
            </div>
          ))}
        </div>
        <div className="shell flex flex-wrap gap-2 pb-16">
          <ButtonLink href="/explore" variant="outline" arrow>
            Explore services
          </ButtonLink>
          <ButtonLink href="/info/help" variant="ghost">
            Help centre
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
