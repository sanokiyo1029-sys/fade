import { SERVICES, startingPrice } from "@/data/services";
import { applyFilters, filtersFromParams } from "@/lib/search";

/** Same filters and query string as /explore. Catalogue only. */
export function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const results = applyFilters(SERVICES, filtersFromParams(params)).slice(0, 50);
  return Response.json({
    count: results.length,
    results: results.map((s) => ({ id: s.id, slug: s.slug, title: s.title, category: s.category, creatorId: s.creatorId, rating: s.rating, from: startingPrice(s) })),
  });
}
