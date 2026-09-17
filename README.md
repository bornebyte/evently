# evently

evently is a polished event discovery and ticketing experience built with Next.js 16, TypeScript, and Tailwind CSS. The current product pass includes the public discovery flow, ticket-ready event details, a confirmation state, a saved-ticket view, and an organizer dashboard with an event creation flow.

## Routes

- `/` — editorial homepage with search, featured events, category filters, and organizer CTA
- `/events` — searchable and filterable event directory
- `/events/[slug]` — full event details, ticket tier picker, quantity controls, and booking confirmation
- `/tickets` — upcoming/past ticket view with entry QR presentation
- `/admin/dashboard` — organizer overview, revenue chart, event health, and recent bookings
- `/admin/events/new` — event basics, schedule/location fields, ticket types, and publish confirmation

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run build
```

## Data and integrations

The UI currently reads from typed seed data in `lib/events.ts`, which makes the complete experience previewable without credentials. The production data contract is scaffolded in `prisma/schema.prisma` for Neon PostgreSQL, covering organizers, events, ticket types, bookings, booking items, and payment QR settings.

Copy `.env.example` to `.env.local` when wiring the backend. Keep Neon connection strings, Gmail SMTP credentials, and canonical app URLs in environment variables only. Transactional email delivery should be added at booking confirmation using `GMAIL_USER` and `GMAIL_APP_PASSWORD`.

The event imagery is served through `next/image` from Unsplash and is allow-listed in `next.config.ts`; replace those seed URLs with uploaded media when the asset pipeline is connected.
