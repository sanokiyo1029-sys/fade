"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, Field, Input, Textarea } from "@/components/ui";
import { CATEGORIES } from "@/data/categories";
import { useApp } from "@/store/app";
import { toast } from "@/store/ui";
import type { Mode } from "@/lib/types";
import { cn } from "@/lib/utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only same-origin paths; blocks `//evil.com` and absolute URLs. */
function nextPath(fallback: string) {
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="line" className="w-full" onClick={onClick}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
        <path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.7 3.72 14.56 2.8 12 2.8 6.92 2.8 2.8 6.92 2.8 12s4.12 9.2 9.2 9.2c5.31 0 8.83-3.73 8.83-8.99 0-.6-.07-1.07-.15-1.53z" />
      </svg>
      Continue with Google
    </Button>
  );
}

const Or = () => (
  <div className="label my-6 flex items-center gap-3 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">or</div>
);

export function SignIn() {
  const signInDemo = useApp((s) => s.signInDemo);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<{ email?: string; password?: string }>({});

  const done = (name: string) => {
    toast(`Welcome back, ${name}`, "You're signed in to the demo account.", "success");
    router.push(nextPath("/dashboard"));
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = { email: EMAIL.test(email) ? undefined : "Enter a valid email", password: password.length >= 6 ? undefined : "At least 6 characters" };
    setErr(next);
    if (next.email || next.password) return;
    signInDemo(email);
    done("Rohan");
  };

  return (
    <>
      <p className="label">ACCOUNT / SIGN IN</p>
      <h1 className="display mt-3 text-[44px] md:text-[56px]">Welcome back.</h1>
      <p className="mt-3 text-[15px] text-mute">This is a demo: any email and password sign you in to a sample account that is both a buyer and a seller.</p>
      <div className="mt-8">
        <GoogleButton onClick={() => (signInDemo(undefined, "google"), done("Rohan"))} />
      </div>
      <Or />
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email" error={err.email}>
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err.email} />
        </Field>
        <Field label="Password" error={err.password}>
          <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!err.password} />
        </Field>
        <div className="flex justify-end">
          <Link href="/auth/forgot" className="label hover:text-fg">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" arrow>
          Sign in
        </Button>
      </form>
      <Button variant="ghost" className="mt-2 w-full" onClick={() => (signInDemo(), done("Rohan"))}>
        Use the demo account
      </Button>
      <p className="mt-8 text-[14px] text-mute">
        New to FADE?{" "}
        <Link href="/auth/sign-up" className="text-fg underline underline-offset-2">
          Create an account
        </Link>
      </p>
    </>
  );
}

export function SignUp() {
  const signUp = useApp((s) => s.signUp);
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState<Partial<typeof f>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      name: f.name.trim().length >= 2 ? undefined : "Enter your name",
      email: EMAIL.test(f.email) ? undefined : "Enter a valid email",
      password: f.password.length >= 8 ? undefined : "At least 8 characters",
    };
    setErr(next);
    if (next.name || next.email || next.password) return;
    signUp({ name: f.name.trim(), email: f.email });
    router.push("/auth/onboarding");
  };

  return (
    <>
      <p className="label">ACCOUNT / JOIN</p>
      <h1 className="display mt-3 text-[44px] md:text-[56px]">Join FADE.</h1>
      <p className="mt-3 text-[15px] text-mute">One account for hiring and selling. Accounts live in this browser only.</p>
      <div className="mt-8">
        <GoogleButton
          onClick={() => {
            signUp({ name: "New member", email: "you@gmail.com", provider: "google" });
            router.push("/auth/onboarding");
          }}
        />
      </div>
      <Or />
      <form onSubmit={submit} noValidate className="space-y-4">
        {(
          [
            ["name", "Full name", "text", "name"],
            ["email", "Email", "email", "email"],
            ["password", "Password", "password", "new-password"],
          ] as const
        ).map(([k, label, type, ac]) => (
          <Field key={k} label={label} error={err[k]}>
            <Input type={type} autoComplete={ac} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!err[k]} />
          </Field>
        ))}
        <Button type="submit" size="lg" className="w-full" arrow>
          Create account
        </Button>
      </form>
      <p className="mt-4 text-[12.5px] text-mute">
        By joining you agree to the{" "}
        <Link href="/info/terms" className="underline">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/info/privacy" className="underline">
          privacy policy
        </Link>
        .
      </p>
      <p className="mt-8 text-[14px] text-mute">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-fg underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </>
  );
}

export function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  return (
    <>
      <p className="label">ACCOUNT / RESET</p>
      <h1 className="display mt-3 text-[44px] md:text-[56px]">{sent ? "Check your inbox." : "Reset password."}</h1>
      {sent ? (
        <>
          <p className="mt-3 text-[15px] text-mute">If an account exists for {email}, a reset link is on its way. (Demo: no email is actually sent.)</p>
          <ButtonLink href="/auth/sign-in" variant="line" className="mt-8" arrow>
            Back to sign in
          </ButtonLink>
        </>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!EMAIL.test(email)) return setErr("Enter a valid email");
            setSent(true);
          }}
          className="mt-8 space-y-4"
        >
          <Field label="Email" error={err}>
            <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err} />
          </Field>
          <Button type="submit" size="lg" className="w-full" arrow>
            Send reset link
          </Button>
        </form>
      )}
    </>
  );
}

export function Onboarding() {
  const user = useApp((s) => s.user);
  const ready = useApp((s) => s.ready);
  const complete = useApp((s) => s.completeOnboarding);
  const router = useRouter();
  const [roles, setRoles] = useState<Mode[]>([]);
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ name: "", headline: "", city: "", bio: "", skills: "" });
  const [focus, setFocus] = useState<string[]>([]);

  if (!ready) return null;
  if (!user) {
    return (
      <>
        <h1 className="display text-[44px]">Sign up first.</h1>
        <ButtonLink href="/auth/sign-up" className="mt-6" arrow>
          Create an account
        </ButtonLink>
      </>
    );
  }
  const name = f.name || (user.name === "New member" ? "" : user.name);
  const selling = roles.includes("seller");

  return (
    <>
      <p className="label num">ONBOARDING / {String(step + 1).padStart(2, "0")} OF 02</p>
      {step === 0 ? (
        <>
          <h1 className="display mt-3 text-[44px] md:text-[56px]">What brings you here?</h1>
          <p className="mt-3 text-[15px] text-mute">Pick one or both. You can switch any time from the header.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["buyer", "I'M HIRING", "Find and book creators for fixed-scope projects."],
                ["seller", "I'M SELLING", "Publish services and get paid through escrow."],
              ] as const
            ).map(([r, t, body]) => {
              const on = roles.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setRoles(on ? roles.filter((x) => x !== r) : [...roles, r])}
                  className={cn("rounded-[2px] border p-5 text-left transition-colors", on ? "border-fg bg-fg text-bg" : "border-line hover:border-fg")}
                >
                  <p className="font-mono text-[11.5px] uppercase tracking-[0.06em]">{t}</p>
                  <p className={cn("mt-6 text-[14px]", on ? "opacity-70" : "text-mute")}>{body}</p>
                </button>
              );
            })}
          </div>
          <Button size="lg" className="mt-8 w-full" disabled={!roles.length} onClick={() => setStep(1)} arrow>
            Continue
          </Button>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            complete({
              roles,
              name: name.trim() || user.name,
              headline: f.headline.trim(),
              city: f.city.trim(),
              bio: f.bio.trim(),
              skills: f.skills.split(",").map((s) => s.trim()).filter(Boolean),
            });
            router.push(selling ? "/seller/services/new" : `/explore${focus.length ? `?category=${focus.join(",")}` : ""}`);
          }}
          className="mt-3 space-y-4"
        >
          <h1 className="display text-[44px] md:text-[56px]">About you.</h1>
          <Field label="Full name">
            <Input value={name} onChange={(e) => setF({ ...f, name: e.target.value })} required autoComplete="name" />
          </Field>
          <Field label="City">
            <Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Bengaluru" autoComplete="address-level2" />
          </Field>
          {selling ? (
            <>
              <Field label="Headline" hint="One line on what you do and for whom.">
                <Input value={f.headline} onChange={(e) => setF({ ...f, headline: e.target.value })} placeholder="Brand designer for early-stage founders" maxLength={90} />
              </Field>
              <Field label="Skills" hint="Comma separated.">
                <Input value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="Figma, Branding, Packaging" />
              </Field>
              <Field label="Bio">
                <Textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} placeholder="Where you've worked, how you work, what you're best at." />
              </Field>
            </>
          ) : (
            <div>
              <p className="label mb-2">Interested in</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    aria-pressed={focus.includes(c.slug)}
                    onClick={() => setFocus(focus.includes(c.slug) ? focus.filter((x) => x !== c.slug) : [...focus, c.slug])}
                    className={cn("rounded-[2px] border px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em]", focus.includes(c.slug) ? "border-fg bg-fg text-bg" : "border-line hover:border-fg")}
                  >
                    {c.short}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button variant="line" size="lg" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button type="submit" size="lg" className="flex-1" arrow>
              {selling ? "Publish your first service" : "Start exploring"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
