import type { Metadata } from "next";
import { Messages } from "./Messages";

export const metadata: Metadata = { title: "Messages" };

export default async function Page({ searchParams }: PageProps<"/messages">) {
  const c = (await searchParams).c;
  const id = typeof c === "string" ? c : null;
  return <Messages key={id} initial={id} />;
}
