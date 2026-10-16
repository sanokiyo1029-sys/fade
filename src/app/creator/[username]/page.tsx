import type { Metadata } from "next";
import { CREATORS, getCreator } from "@/data/creators";
import { CreatorView } from "./View";

export const generateStaticParams = () => CREATORS.map((c) => ({ username: c.username }));

export async function generateMetadata({ params }: PageProps<"/creator/[username]">): Promise<Metadata> {
  const c = getCreator((await params).username);
  return c ? { title: `${c.name} — ${c.headline}`, description: c.bio[0] } : { title: "Creator" };
}

export default async function Page({ params }: PageProps<"/creator/[username]">) {
  return <CreatorView username={(await params).username} />;
}
