# FADE — build progress

_Last updated: 2026-10-05 (session 2)_

A premium, monochrome freelance services marketplace (Nothing-inspired, original brand). This file records where the build stopped so it can be resumed.

**Status: all 19 planned steps built and runnable.** `tsc --noEmit`, `eslint src` and `next build` (76 routes) pass. Key flows were checked in a browser at desktop and mobile widths: sign in, explore, service, checkout → order → auto-confirm, messaging with simulated reply, both dashboards, the wizard, and a console-error sweep.

---

## Stack (installed)

| Area | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack default) | 16.3.8 |
| UI runtime | React | 19.2.8 |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS v4 (`@theme inline`, `@utility`) | 4.x |
| Primitives | `radix-ui` (unified package: `import { Dialog, Tabs, Switch, Slider, Popover } from "radix-ui"`) | 1.6.7 |
| Motion | framer-motion | 14.0.0 |
| Icons | lucide-react | 1.52.0 |
| State | zustand (+ `persist`) | 5.x |
| Fonts | `geist` package (Geist Sans + Geist Mono, bundled locally) | 1.7.2 |
| Backend SDKs | @supabase/supabase-js, stripe | 2.117 / 23.0 |
| Utils | clsx, tailwind-merge, class-variance-authority | — |

Notes:
- Next 16 has breaking changes: `params` / `searchParams` are **Promises**, `middleware` is now `proxy`. Read `node_modules/next/dist/docs/` before using an API you're unsure of (see `AGENTS.md`).
- Pages that use `useSearchParams` need a `<Suspense>` boundary.

---

## Done

### Design tokens — `src/app/globals.css`
- Semantic CSS vars: `--bg --fg --soft --line --mute --faint --surface --signal`, exposed as Tailwind colours (`bg-bg`, `text-fg`, `border-line`, `text-mute`, `text-faint`, `bg-soft`, `bg-signal`…).
- `.dark-zone` re-maps the tokens for inverted (black) sections.
- `--mute` is `#6B6B6B` (AA-safe for small text); the brand's `#8A8A8A` is kept as `--faint` (decorative only).
- Red `--signal: #E8262A` is reserved for LIVE / ONLINE / ERROR / IMPORTANT.
- Utilities: `shell` (page container), `label` / `label-fg` (uppercase mono micro-labels), `mono`, `num` (tabular figures), `display` (tight headline tracking), `no-scrollbar`, `pb-safe`.
- Backdrops: `.bg-grid`, `.bg-grid-fine`, `.bg-dots`, `.ruler-x`, `.ruler-y`, `.skeleton`.
- Animations: `animate-marquee`, `animate-blink`, `animate-halo`, `animate-shimmer`, `animate-rise`. Everything is calmed under `prefers-reduced-motion`.

### Library code — `src/lib/`
- `types.ts`: every domain type, mirroring the planned DB schema. Covers Category, Creator, Service, Pkg, Review, PortfolioProject, Client, User, Order (statuses `requested → confirmed → in_progress → review → delivered → completed`, plus `cancelled`), Milestone, FileItem, Activity, Conversation, Message, Notification and ServiceDraft.
- `utils.ts`: `cn`, `hash`, seeded PRNG `rng` (mulberry32), `r1`, `clamp`, `pad`, `uid`, `initials`, `slugify`.
- `format.ts`: `money` (₹ en-IN grouping), `moneyShort`, `int`, `delivery`, `deliveryRange`, `dateLong`, `dateShort`, `monthYear` (ISO strings are read in UTC so SSR and the client agree), `clock`, `ago`, `dayLabel`, `timeLeft`, `fileSize`, `orderNo`, `plural`, `levelName`.
- `search.ts`:
  - Weighted relevance search with stemming and synonyms.
  - All filters: category, budget, delivery, rating, experience, location, language, availability, verified, seller level.
  - Sorts: recommended, top, recent, price-asc, fastest.
  - `filtersFromParams` / `filtersToParams` for URL sync, `suggest()` for the search overlay, `activeFilterCount`.
- `resolve.ts`: `userToCreator(user)` (a signed-up user rendered as a creator) and `resolveParty(id, user)`, which looks up a creator, client or the user.
- `blobs.ts`: session-only object-URL previews for uploaded files, plus `kindFromFile`.

### Content data — `src/data/`
- `categories.ts`: 11 categories. Each has an art spec and subcategories.
- `creators.ts`: 14 creators with full profiles, stats, availability and 8-week load. Also a pool of 16 fictional companies and 6 buyer `CLIENTS` for the seller-side demo.
- `services.ts`: 30 services built through a compact `make()` definition format.
  - Each has three packages (STARTER / STANDARD / ADVANCED) with cumulative comparison features.
  - Each category has default process, requirements and FAQ (exported as `defaultsFor(cat)`).
  - Helpers: `startingPrice`, `fastestDays`, `slowestDays`, `servicesByCreator`, `similarServices`, `getServiceBySlug`.
  - Pricing is in INR; the cheapest service starts at ₹2,500.
- `reviews.ts`: review pools per category, attached to services deterministically. Exports `reviewsForService`, `reviewsForCreator`, and `ratingBreakdown` (quality, communication, delivery and star distribution).
- `portfolio.ts`: 42 portfolio projects (3 per creator) and `FEATURED_PROJECT_IDS` for the home page.
- `seed.ts`: `buildSeed()` generates the signed-in demo account (Rohan Mehta, `id: "rohan"`, both buyer and seller). Timestamps are relative to `Date.now()`. It includes:
  - 6 orders where Rohan is buying and 6 where he is selling, covering every status.
  - 7 conversations with file attachments and order/payment system cards.
  - 14 notifications covering all 8 types.
  - Saved services and saved creators.

### Brand components — `src/components/brand/`
- `Artwork.tsx`: a deterministic generative SVG engine with 10 variants (`dots lines rings grid bars blocks wire wave scatter glyph`) and 3 tones. Used in place of stock imagery.
  - Props: `marks` (crop-mark corners), `density`, `alt`.
  - `<Cover>` shows an uploaded image when there is one and the artwork otherwise.
  - Hover zoom triggers from a `group/art` ancestor.
- `Avatar.tsx`: generated halftone portraits on a hex dot grid, with five hair styles and three tones. Square, 2px radius. `online` adds the red pulsing dot.
- `Logo.tsx`: `LogoMark` masks `public/logo.png` (white on transparent) so it takes `currentColor`; `Logo` = mark + "FADE" wordmark. The favicon is `src/app/icon.png`.

### State — `src/store/`
- `ui.ts` (not persisted): toasts with auto-dismiss, search overlay, mobile menu and a `hideNav` flag. `toast(title, body?, tone?)` helper.
- `app.ts`: Zustand store persisted under the key `fade-app` with `skipHydration: true`.
  - **Hydration:** call `useApp.persist.rehydrate()` in a Providers `useEffect`, then set `ready: true` via `onFinishHydration`.
  - **Auth:** `signInDemo` (seeds the demo data), `signUp` (fresh empty account), `completeOnboarding`, `signOut`, `updateProfile`, `setMode` (buyer/seller switch), `setPrefs`.
  - **Saving:** `toggleSavedService`, `toggleSavedCreator`.
  - **Notifications:** `notify`, `markRead`, `markAllRead` (applies to the current mode).
  - **Messaging:** `setActiveConv`, `startConversation`, `sendMessage`. After a send, a simulated typing indicator appears, then a canned reply arrives; a notification is created if that conversation isn't open.
  - **Orders:** `createOrder` creates the order, escrow, milestones and conversation, and simulates the creator confirming after 7s. `orderAction` (`accept decline cancel start submit revise approve release`) runs the full state machine with activity log, system messages, notifications and toasts. Also `toggleMilestone` and `addOrderFile`.
  - **Reviews:** `addReview`, `replyToReview`.
  - **Seller:** `setDraft`, `clearDraft`, `publishService`, `setServiceStatus`, `deleteService`, `addProject`, `removeProject`, `setAvailability`.
  - Exports `STAGES` and `newDraft()`.
- `hooks.ts`:
  - `useServices` (catalog + user-published services, with status overrides applied), `useService`.
  - `useCreator` (includes the user's synthesized creator profile), `useMyServices`.
  - `useModeOrders` (orders for the current mode), `useUnread` (message and notification counts).
  - `useRequireAuth`, which redirects to `/auth/sign-in?next=…`.

---

## Session 2 — built

All of the former "Remaining" list, laid out to keep the file count low:

- **Shell:** `app/layout.tsx` (Geist via the `geist` package, `Hydrate` rehydrates the store), `template.tsx` (CSS `animate-rise`, no framer-motion), `loading`, `not-found`, `sitemap`, `robots`.
- **Components:** `components/ui.tsx` (primitives), `market.tsx` (cards, packages, reviews, order rows/list, timeline, gallery, `ReviewDialog`, `useContact`), `chrome.tsx` (header, popovers, mobile menu + bottom nav, ⌘K search, footer), `thread.tsx` (message thread, reused in the order workspace), `dash.tsx` (dashboard shell, metrics, single-series `ColumnChart`/`LineChart` with hover + sr-only table, shared `Settings`).
- **Pages:** home, `/explore` (+ `Explore.tsx`), `/categories`, `/service/[slug]` and `/creator/[username]` (a server wrapper plus one client `View.tsx` that handles catalogue and user-created entries alike), `/checkout`, `/orders`, `/orders/[id]`, `/messages`, `/notifications`, `/auth/{sign-in,sign-up,forgot,onboarding}` (all in `auth/form.tsx`), `/dashboard/[[...tab]]`, `/seller/[[...tab]]`, `/seller/services/new`, `/how-it-works`, `/for-freelancers`, `/info/[slug]` (copy lives in `data/info.ts`).
- **Backend:** `api/checkout` (mock unless `STRIPE_SECRET_KEY`; prices server-side with `quote()` from `data/services.ts`, manual capture), `api/search`, `supabase/schema.sql` (tables, RLS, weighted tsvector + GIN), `.env.example`, README.

## Deliberately skipped (add when needed)

- Separate `src/lib/stripe.ts` and a Supabase client/auth adapter: nothing would call them yet. Stripe is constructed inline in the one route that uses it.
- Route progress bar: client navigation is near-instant, and `loading.tsx` covers server routes.
- Persisting withdrawals: the Earnings tab tracks them per session (`ponytail:` comment).
- `metadata` titles on client-only pages (dashboards, orders, notifications) fall back to the site title.

## Gotchas found while building

- In this Chromium, `scrollIntoView` and `scrollTo` return Promises, so an expression-bodied `useEffect(() => el.scrollIntoView())` crashes on unmount. Always use braces.
- `animate-rise` must use fill-mode `backwards`. A filled `transform` on the page wrapper traps `position: fixed` children (the mobile thread and the mobile buy bar).
- Page files can only export the default component and config. Shared components go in `src/components/`.

## Next steps (not started)

- Wire Supabase for real (auth, then reads, then Realtime messages) and test the Stripe path with test keys.
- Edit flow for published services (the wizard currently only creates).

## Decisions to keep

- The demo user is a hybrid account (`rohan`), so the buyer/seller switch shows different orders, conversations and notifications. New sign-ups get empty states.
- Data is mocked in the client store. The Supabase and Stripe paths activate only when env keys are present, and must be described honestly in the README as untested here.
- Avatars and images are generated, deterministic and monochrome. There is no stock photography.
- Card shapes are sharp (2px radius), with 1px borders and no shadows. Uppercase is used only for mono micro-labels and buttons.
- `radix-ui` exports namespaces (`Dialog.Root`, `Dialog.Content`…). The lucide icon-name check printed no missing names, but re-check anything unusual with `tsc`.
