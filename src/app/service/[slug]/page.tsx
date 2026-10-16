import type { Metadata } from "next";
import { SERVICES, getServiceBySlug, startingPrice } from "@/data/services";
import { money } from "@/lib/format";
import { ServiceView } from "./View";

export const generateStaticParams = () => SERVICES.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: PageProps<"/service/[slug]">): Promise<Metadata> {
  const s = getServiceBySlug((await params).slug);
  return s ? { title: s.title, description: `${s.tagline} From ${money(startingPrice(s))}.` } : { title: "Service" };
}

/** Catalogue and user-published services both resolve client-side from the store. */
export default async function Page({ params }: PageProps<"/service/[slug]">) {
  return <ServiceView slug={(await params).slug} />;
}
