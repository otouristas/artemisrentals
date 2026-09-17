# Artemis Rental, Next.js

Modern rebuild of [artemisrental.gr](https://artemisrental.gr): car & scooter rentals in Apollonia, Sifnos, with EN/EL i18n, Sifnos Guide, blog, SEO/GEO/AEO, and Touristas AI.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS v4
- `next-intl` (English + Greek)
- Vercel AI SDK (Touristas AI chatbot)
- Resend (optional booking emails)
- MD/JSON content (no CMS required for v1)

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/en`).

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical base URL |
| `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY` | Touristas AI chat |
| `AI_MODEL` | Model id (default `gpt-4o-mini`) |
| `RESEND_API_KEY` | Send booking enquiries by email |
| `BOOKING_FROM_EMAIL` | Resend from address |
| `PEXELS_API_KEY` | Optional. Loads Sifnos location photos from `GET /v1/search?query=sifnos` (server only) |

Without AI keys, the chat API returns 503 with a phone/form fallback. Without Resend, enquiries are logged server-side. Sifnos Guide and blog location photos are Pexels stills from https://www.pexels.com/search/sifnos/, with photographer credits. `PEXELS_API_KEY` (Build and Runtime, Production and Preview) loads that search via `GET /v1/search?query=sifnos`. If the key is missing, the same confirmed Sifnos Pexels images still render. Artemis brand and fleet photos stay local.

## Content

- Fleet / rates / FAQs / testimonials: `content/data/`
- Sifnos Guide: `content/guide/{en,el}/`
- Blog: `content/blog/{en,el}/`
- Query fan-out map: `content/seo/fanout.json`
- Scraped source HTML: `content/source/`

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Deploy

Deploy to Vercel, set env vars, and point the `artemisrental.gr` domain. Legacy `.html` paths redirect via `next.config.ts`.
