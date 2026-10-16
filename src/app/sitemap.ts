import type { MetadataRoute } from "next";
import { CREATORS } from "@/data/creators";
import { SERVICES } from "@/data/services";
import { INFO_SLUGS } from "@/data/info";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    "",
    "/explore",
    "/categories",
    "/how-it-works",
    "/for-freelancers",
    ...SERVICES.map((s) => `/service/${s.slug}`),
    ...CREATORS.map((c) => `/creator/${c.username}`),
    ...INFO_SLUGS.map((s) => `/info/${s}`),
  ].map((p) => ({ url: `${base}${p}` }));
}
