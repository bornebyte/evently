# evently

evently is a polished event discovery and ticketing experience built with Next.js 16, TypeScript, and Tailwind CSS. It includes public discovery, Indian-rupee QR payment checkout, database-backed admin operations, payment verification, Gmail confirmation delivery, PDF tickets and receipts, and one-scan attendance tracking.

## Routes

- `/` — editorial homepage with search, featured events, and category filters
- `/events` — searchable and filterable event directory
- `/events/[slug]` — full event details, ticket tier picker, quantity controls, and booking confirmation
- `/tickets` — upcoming/past booking view with payment-review and entry-pass states
- `/tickets/[reference]` — unique ticket page with ticket and receipt PDF downloads
- `/admin/login` — private email/password admin sign in
- `/admin/dashboard` — admin overview and revenue health
- `/admin/bookings` — payment-reference review, confirmation, rejection, and email release
- `/admin/attendance` — camera/handheld high-speed QR check-in and attendance log
- `/admin/analytics` — detailed revenue, audience, and event performance analytics
- `/admin/payment-qr` — per-event UPI payload and QR image settings
- `/admin/settings` — workspace defaults, notification preferences, and admin team access
- `/admin/events/new` — event basics, schedule/location fields, ticket types, and publish checklist

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

The public catalog is previewed from typed seed data in `lib/events.ts`; booking, admin, QR, settings, and attendance operations use Prisma with Neon PostgreSQL. The schema covers organizers, admin users/sessions, events, ticket types, bookings, attendance, workspace settings, and payment QR settings.

Copy `.env.example` to `.env.local` when wiring the backend. Keep Neon connection strings, Gmail SMTP credentials, and canonical app URLs in environment variables only. Run `npm run db:generate`, `npm run db:push`, and `npm run db:seed` after configuring Neon. Admins approve pending bookings; approval sends a unique link plus ticket and receipt PDFs using `GMAIL_USER` and `GMAIL_APP_PASSWORD`.

The event imagery is served through `next/image` from Unsplash and is allow-listed in `next.config.ts`; replace those seed URLs with uploaded media when the asset pipeline is connected.
