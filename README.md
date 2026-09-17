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

All public catalog, ticket, booking, and admin data is read from Prisma/Neon PostgreSQL. There is no in-code event catalog or demo booking fallback. The schema covers organizers, admin users/sessions, events, ticket types, bookings, attendance, workspace settings, and payment QR settings.

Copy `.env.example` to `.env.local` when wiring the backend. Keep Neon connection strings, Gmail SMTP credentials, canonical app URLs, and the required initial admin values in environment variables only. Run `npm run db:generate`, `npm run db:push`, and `npm run db:seed` after configuring Neon. The seed creates only the configured initial admin account; it does not create sample events, bookings, or payment QR rows. Admins approve pending bookings; approval sends a unique link plus ticket and receipt PDFs using `GMAIL_USER` and `GMAIL_APP_PASSWORD`.

Event imagery is stored on each event as database URLs and served through `next/image`; expand the allow-list in `next.config.ts` when connecting an uploaded media provider.
