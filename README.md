# FADE

A monochrome freelance services marketplace: fixed-scope packages, escrowed payments and one workspace per order. Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Radix and Zustand.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. To see the signed-in experience, go to **Sign in → Use the demo account**. The demo account (Rohan Mehta) is both a buyer and a seller. Use the BUYING / SELLING switch in the header to swap between the two sides.

## How it works today

- **Data lives in the browser.** The catalogue (`src/data/`) is static. Everything a user does is kept in a Zustand store persisted to `localStorage` under the key `fade-app`. This covers orders, messages, notifications, saved items, reviews, published services and portfolio projects. Signing out clears it.
- **The counterpart is simulated.** Creators confirm new orders about 7 seconds after checkout, and replies arrive a few seconds after you send a message.
- **Checkout is in mock mode** unless `STRIPE_SECRET_KEY` is set (see `.env.example`). Mock mode moves no money.
- **Uploaded images and files are session-only.** Previews use object URLs, which don't survive a reload.

## What is not wired up (honestly)

- **Stripe.** With `STRIPE_SECRET_KEY` set, `/api/checkout` prices the order on the server and creates a Checkout session with manual capture, so funds are authorised and held like escrow. This path has **not been tested** against a Stripe account. Live mode only covers catalogue services, and the order is still recorded in the local store.
- **Supabase.** `supabase/schema.sql` defines the tables, row-level-security policies and full-text search (a weighted `tsvector` with a GIN index) that the domain types mirror. It has **not been run** against a project. No Supabase client exists yet; add one when the store starts reading from Postgres.
- **Auth.** Sign-in, Google sign-in and password reset are simulated.

## Map

| Path | What |
|---|---|
| `src/app/page.tsx` | Home |
| `src/app/explore` | Search with URL-synced filters |
| `src/app/service/[slug]`, `creator/[username]` | Detail pages. Both also render services and profiles the user created. |
| `src/app/checkout` · `orders` · `messages` · `notifications` | The buying flow and the order workspace |
| `src/app/dashboard/[[...tab]]`, `seller/[[...tab]]` | Client and seller dashboards, one file each |
| `src/app/seller/services/new` | Six-step service wizard with an autosaved draft |
| `src/app/api/checkout`, `api/search` | Route handlers |
| `src/components/ui.tsx` | Primitives (buttons, fields, Radix dialog, switch, slider, …) |
| `src/components/market.tsx` | Cards, packages, reviews, order rows, timeline |
| `src/components/chrome.tsx` | Header, menus, ⌘K search, bottom nav, footer |
| `src/components/thread.tsx` | Message thread (Messages page and order workspace) |
| `src/components/dash.tsx` | Dashboard shell, metrics, charts, settings |
| `src/store/app.ts` | All state and the order state machine |

## Checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```
