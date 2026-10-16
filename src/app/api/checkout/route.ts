import Stripe from "stripe";
import { SERVICE_MAP, quote } from "@/data/services";

/**
 * Mock by default: validates the request and answers `{ mode: "mock" }`, and the
 * client records the order in its local store. With STRIPE_SECRET_KEY set it
 * prices the order server-side and returns a Stripe Checkout URL (untested here).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const tier = Number(body?.tier);
  const extras: string[] = Array.isArray(body?.extras) ? body.extras.filter((x: unknown) => typeof x === "string") : [];
  if (typeof body?.serviceId !== "string" || ![1, 2, 3].includes(tier)) {
    return Response.json({ error: "Invalid order" }, { status: 400 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return Response.json({ mode: "mock" });

  // user-published services exist only in the browser, so live mode is catalogue-only
  const service = SERVICE_MAP[body.serviceId];
  if (!service) return Response.json({ error: "Unknown service" }, { status: 404 });

  const q = quote(service, tier as 1 | 2 | 3, extras);
  const origin = new URL(req.url).origin;
  const session = await new Stripe(key).checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: { currency: "inr", unit_amount: q.total * 100, product_data: { name: `${service.title} · ${q.pkg.name}` } },
      },
    ],
    payment_intent_data: { capture_method: "manual" }, // escrow: authorise now, capture on approval
    success_url: `${origin}/orders`,
    cancel_url: `${origin}/service/${service.slug}`,
  });
  return Response.json({ mode: "stripe", url: session.url });
}
