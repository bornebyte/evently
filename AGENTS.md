<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Evently project notes

## Architecture

- Next.js 16 App Router with TypeScript and Tailwind CSS v4.
- Public routes live at `/`, `/events`, `/events/[slug]`, and `/tickets`.
- Admin routes live under `/admin`, with `/admin/dashboard` and `/admin/events/new` as the current product surfaces.
- Reusable visual primitives live in `components/`; seed event data and future data-access adapters live in `lib/`.
- The current UI uses typed in-memory seed data so the product can be previewed without external services. Keep the data shape database-friendly when replacing it with Prisma/Neon queries.

## Conventions

- Keep route pages server components by default. Add `"use client"` only to the smallest interactive leaf component.
- Use `next/link` for internal navigation and `next/image` for remote event imagery.
- Prefer existing primitives in `components/ui` or accessible native controls before creating one-off interactive elements.
- Use the `@/*` TypeScript path alias for imports from the repository root.
- Keep animations subtle and purposeful; respect `prefers-reduced-motion` in global styles.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Environment and integrations

When the backend is connected, secrets must stay in `.env.local` and never be committed:

- `DATABASE_URL` — Neon pooled connection string for Prisma.
- `DIRECT_URL` — Neon direct connection string for Prisma migrations.
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` — Gmail SMTP credentials for transactional email.
- `NEXT_PUBLIC_APP_URL` — canonical app URL for links and email templates.

## Database workflow

- Add Prisma schema and migrations only after defining the production data contract.
- Run Prisma generation/migrations from the repository root and document any new command here.
- Never hard-code credentials, payment keys, QR payloads, or user data in components.
