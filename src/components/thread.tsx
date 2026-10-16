"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowLeft, FileText, Paperclip, Send, X } from "lucide-react";
import { Avatar } from "@/components/brand/Avatar";
import { Artwork } from "@/components/brand/Artwork";
import { buttonVariants } from "@/components/ui";
import { useApp } from "@/store/app";
import { getBlob, kindFromFile, registerBlob } from "@/lib/blobs";
import { resolveParty } from "@/lib/resolve";
import { clock, dayLabel, fileSize } from "@/lib/format";
import type { Attachment, Conversation, Message } from "@/lib/types";
import { cn, hash, uid } from "@/lib/utils";

const MAX_FILE = 25 * 1024 * 1024;

function AttachmentView({ a, mine }: { a: Attachment; mine: boolean }) {
  const src = getBlob(a.id);
  if (a.kind === "image") {
    return src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={a.name} className="max-h-60 w-full rounded-[2px] object-cover" />
    ) : (
      <Artwork variant="scatter" seed={hash(a.id) % 999} className="aspect-[4/3] w-full rounded-[2px]" alt={a.name} />
    );
  }
  return (
    <span className={cn("flex items-center gap-3 rounded-[2px] border px-3 py-2", mine ? "border-bg/30" : "border-line")}>
      <FileText className="h-4 w-4 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate text-[13px]">{a.name}</span>
        <span className="mono num block text-[10.5px] opacity-60">{fileSize(a.size)}</span>
      </span>
    </span>
  );
}

function SystemCard({ m }: { m: Message }) {
  const meta = m.meta ?? {};
  return (
    <div className="mx-auto my-3 w-full max-w-sm rounded-[2px] border border-line bg-soft px-4 py-3">
      <p className="label flex justify-between">
        <span>{m.kind === "payment" ? "PAYMENT" : meta.order ? `ORDER #${meta.order}` : "SYSTEM"}</span>
        <span className="num">{clock(m.ts)}</span>
      </p>
      <p className="mt-1.5 text-[14px] font-medium">{m.text}</p>
      <p className="mono num mt-1 flex justify-between text-[11.5px] text-mute">
        <span>{meta.status ?? meta.state}</span>
        <span>{meta.amount}</span>
      </p>
    </div>
  );
}

export function Thread({ conv, onBack, className }: { conv: Conversation; onBack?: () => void; className?: string }) {
  const user = useApp((s) => s.user);
  const send = useApp((s) => s.sendMessage);
  const setActive = useApp((s) => s.setActiveConv);
  const [text, setText] = useState("");
  const [pending, setPending] = useState<Attachment[]>([]);
  const [error, setError] = useState("");
  const log = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const party = resolveParty(conv.partyId, user);

  useEffect(() => {
    setActive(conv.id);
    return () => setActive(null);
  }, [conv.id, setActive]);
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [conv.messages.length, conv.typing]);

  const submit = () => {
    if (!text.trim() && !pending.length) return;
    send(conv.id, text.trim(), pending);
    setText("");
    setPending([]);
  };

  const attach = (files: FileList | null) => {
    if (!files) return;
    const ok = [...files].filter((f) => f.size <= MAX_FILE);
    setError(ok.length < files.length ? "Files over 25 MB were skipped." : "");
    setPending((p) => [
      ...p,
      ...ok.map((f) => {
        const id = uid("at");
        registerBlob(id, f);
        return { id, name: f.name, size: f.size, kind: kindFromFile(f) };
      }),
    ]);
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line px-4">
        {onBack && (
          <button type="button" onClick={onBack} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "-ml-2 md:hidden")} aria-label="Back to conversations">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <Avatar seed={party.seed} size={32} online={party.online} />
        <div className="min-w-0 flex-1">
          {party.username ? (
            <Link href={`/creator/${party.username}`} className="block truncate text-[14px] font-medium hover:underline">
              {party.name}
            </Link>
          ) : (
            <p className="truncate text-[14px] font-medium">{party.name}</p>
          )}
          <p className="label truncate">{conv.typing ? "TYPING…" : party.online ? <span className="!text-signal">ONLINE</span> : `LAST SEEN ${conv.lastSeen ?? "RECENTLY"}`}</p>
        </div>
        {conv.orderId && (
          <Link href={`/orders/${conv.orderId}`} className={buttonVariants({ variant: "line", size: "sm" })}>
            Order #{conv.orderId}
          </Link>
        )}
      </header>

      <div ref={log} className="min-h-0 flex-1 overflow-y-auto px-4 py-4" role="log" aria-live="polite">
        {!conv.messages.length && <p className="py-16 text-center text-[13px] text-mute">Say hello to {party.name.split(" ")[0]}. Messages stay on FADE.</p>}
        {conv.messages.map((m, i) => {
          const day = dayLabel(m.ts);
          const divider = i === 0 || dayLabel(conv.messages[i - 1].ts) !== day;
          const mine = m.from === "me";
          return (
            <Fragment key={m.id}>
              {divider && <p className="label my-4 text-center">{day}</p>}
              {m.from === "system" ? (
                <SystemCard m={m} />
              ) : (
                <div className={cn("mb-2 flex", mine ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[82%] space-y-2 rounded-[2px] px-3.5 py-2.5 text-[14px] leading-relaxed md:max-w-[70%]", mine ? "bg-fg text-bg" : "border border-line")}>
                    {m.attachments?.map((a) => (
                      <AttachmentView key={a.id} a={a} mine={mine} />
                    ))}
                    {m.text && <p className="whitespace-pre-line break-words">{m.text}</p>}
                    <p className={cn("mono num text-right text-[10px]", mine ? "opacity-50" : "text-faint")}>{clock(m.ts)}</p>
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
        {conv.typing && (
          <div className="mb-2 inline-flex gap-1 rounded-[2px] border border-line px-3 py-3" aria-label={`${party.name} is typing`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 animate-blink rounded-full bg-fg" style={{ animationDelay: `${i * 0.18}s` }} />
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="shrink-0 border-t border-line p-3 pb-safe"
      >
        {(pending.length > 0 || error) && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {pending.map((a) => (
              <span key={a.id} className="mono flex items-center gap-1.5 rounded-[2px] border border-line px-2 py-1 text-[11px]">
                {a.name}
                <button type="button" onClick={() => setPending(pending.filter((x) => x.id !== a.id))} aria-label={`Remove ${a.name}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {error && <span className="label !text-signal">{error}</span>}
          </div>
        )}
        <div className="flex items-end gap-2">
          <input ref={fileInput} type="file" multiple hidden onChange={(e) => (attach(e.target.files), (e.target.value = ""))} />
          <button type="button" onClick={() => fileInput.current?.click()} className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Attach files">
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Write a message…"
            aria-label="Message"
            className="max-h-32 min-h-9 flex-1 resize-none rounded-[2px] border border-line bg-bg px-3 py-2 text-[14px] outline-none focus:border-fg [field-sizing:content]"
          />
          <button type="submit" disabled={!text.trim() && !pending.length} className={buttonVariants({ size: "icon" })} aria-label="Send">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
