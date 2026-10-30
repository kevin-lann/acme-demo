# acme-web

A deliberately ordinary storefront: Next.js 15 (App Router) + Prisma + Postgres + Redis +
NextAuth (credentials) + Stripe Checkout in test mode. It's the Interleave investor demo app
and the engine's eval target.

## Run it locally

Requirements: Node 20.18+ (tested on 26), pnpm 10 (`npx pnpm@10` works if it isn't installed), Docker.

```bash
cp .env.example .env            # then set NEXTAUTH_SECRET to any random string
docker compose up -d --wait     # Postgres on :5432, Redis on :6379
pnpm install                    # also runs prisma generate
pnpm db:setup                   # prisma migrate deploy + seed
pnpm dev                        # http://localhost:3000
```

Sign in with the seeded test user **ada@acme.test / acme-demo-123** (a second user,
grace@acme.test, has the same password). `pnpm db:reset` wipes and reseeds the database.
Carts live in Redis, so `docker compose restart redis` empties them.

Health check: `GET /api/health` returns 200 with `{"status":"ok"}` when Postgres and Redis are reachable, 503 otherwise.

Production build: `pnpm build && pnpm start`.

Ports can be moved with `POSTGRES_PORT` / `REDIS_PORT` for docker compose; update `DATABASE_URL` / `REDIS_URL` to match.

### Stripe

Leave `STRIPE_SECRET_KEY` empty and checkout uses a simulated payment step (orders are marked
paid right away). Set it to an `sk_test_…` key to redirect to Stripe Checkout instead. Live
keys are ignored. Pay with card 4242 4242 4242 4242.

## What's in it

| Flow | Route | Notes |
| --- | --- | --- |
| Login → dashboard | `/login`, `/dashboard` | Credentials provider, JWT session. `/dashboard`, `/cart`, `/checkout`, `/orders` and `/account` need a session (middleware redirects to `/login?callbackUrl=…`). |
| Password reset | `/forgot-password` | Stub: always shows the same confirmation, sends nothing. |
| Search | `/search?q=` | Ranked: exact name > name prefix > word in name > tag > category > description, then in-stock, then popularity. Empty state for no matches. |
| Product detail | `/products/[slug]` | Image gallery (prev/next, thumbnails, position counter); images are generated SVGs from `/img/[slug]/[n]`. |
| Cart | `/cart` | Quantity stepper/input, remove, promo code **SAVE10** (10% off, shows "SAVE10 applied"), "You might also like" add buttons. |
| Checkout | `/checkout` → `/checkout/success` | Cart → Shipping → Payment → Done stepper; address validation (5-digit ZIP). |
| Order history | `/orders?page=N` | 10 per page, newest first. Ada has 35 seeded orders (4 pages). |
| Account settings | `/account` | Display name + newsletter opt-in; "Settings saved" on success. |
| Newsletter modal | footer button | `<dialog>`, email validation, POST `/api/newsletter`. |
| Dark mode | header toggle | Class-based, saved in `localStorage` (`acme-theme`), follows the OS until toggled. |
| Mobile menu | header (< 768px) | Drawer with focus trap, Escape and backdrop close, focus returns to the trigger. |

Key controls carry `data-testid` attributes (`login-email`, `login-submit`, `search-input`,
`search-empty`, `gallery-next`, `add-to-cart`, `qty-increase`, `promo-input`, `promo-apply`,
`promo-applied`, `place-order`, `order-row`, `orders-next`, `settings-save`, `newsletter-open`,
`theme-toggle`, `mobile-menu-button`, …). Grep `data-testid` for the full list.

