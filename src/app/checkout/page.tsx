import type { Metadata } from "next";
import { Checkout } from "./Checkout";

export const metadata: Metadata = { title: "Checkout" };

export default async function Page({ searchParams }: PageProps<"/checkout">) {
  const p = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const tier = Number(one(p.package));
  return <Checkout serviceId={one(p.service)} tier={tier === 1 || tier === 3 ? tier : 2} />;
}
