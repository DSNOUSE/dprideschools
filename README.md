## Overview

- Admin-protected Next.js (App Router) site with PostgreSQL (Prisma) and Sanity CMS.
- Authentication via NextAuth Credentials; RBAC with Prisma roles/permissions.
- Sanity Studio mounted at `/admin/studio` for content management.

Key files:
- App layout and homepage: [app/layout.tsx](app/layout.tsx), [app/page.tsx](app/page.tsx)
- Admin area: [app/admin/layout.tsx](app/admin/layout.tsx), [app/admin/page.tsx](app/admin/page.tsx)
- Auth route/options: [app/api/auth/[...nextauth]/route.ts](app/api/auth/%5B...nextauth%5D/route.ts), [src/lib/auth.ts](src/lib/auth.ts)
- Prisma schema/seed: [prisma/schema.prisma](prisma/schema.prisma), [prisma/seed.js](prisma/seed.js)
- Sanity config/schemas: [sanity.config.ts](sanity.config.ts), [sanity/schemas](sanity/schemas)
- Admin gating middleware: [middleware.ts](middleware.ts)

## Prerequisites

- Node.js 18+ (tested with Node 20)
- PostgreSQL database; connection string in `.env` as `DATABASE_URL`
- A `NEXTAUTH_SECRET` set in `.env`
- Sanity project/dataset IDs for CMS (or use placeholders while developing)

## Environment Variables

Copy [env.example](env.example) to `.env` and fill in:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — random string for signing JWTs
- `NEXTAUTH_URL` — e.g., `http://localhost:3000`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_PREVIEW_SECRET`

## Install & Generate

```powershell
npm install
npx prisma generate
```

## Database Migrate & Seed

Run initial migrations:

```powershell
npx prisma migrate dev
```

Seed an admin user (Windows PowerShell):

```powershell
$env:ADMIN_EMAIL = "admin@dprideschools.com"
$env:ADMIN_PASSWORD = "TestPass123!"
npm run db:seed
```

Seed (bash/zsh):

```bash
ADMIN_EMAIL=admin@dprideschools.com ADMIN_PASSWORD=TestPass123\! npm run db:seed
```

The seed ensures base permissions, an `Administrator` role, and links it to the admin user.

## Run the App

```powershell
npm run dev
```

Visit the app at http://localhost:3000.

## Sign In and Admin

- Go to http://localhost:3000/signin
- Sign in with the seeded credentials (see seed step above)
- You will be redirected to `/admin` and see the dashboard if your role includes `Administrator`.

Admin protection is enforced by middleware in [middleware.ts](middleware.ts) and a server-side check in [app/admin/layout.tsx](app/admin/layout.tsx).

## Sanity Studio

- Start the app and open http://localhost:3000/admin/studio
- Edit content types defined in [sanity/schemas](sanity/schemas) (homepage, news, admissions, etc.)

## Useful Scripts

- `npm run dev` — Start Next.js dev server
- `npm run build` — Build production bundle
- `npm start` — Start production server
- `npm run db:migrate` — Alias for `prisma migrate dev`
- `npm run db:generate` — Generate Prisma client
- `npm run db:seed` — Seed roles/permissions and admin user
- `npm run studio` — Run Sanity Studio locally

## Troubleshooting

- Missing Prisma client during seed:
	- Run `npx prisma generate`, then re-run the seed.
- `DATABASE_URL` not set or DB unreachable:
	- Ensure `.env` has a valid `DATABASE_URL` and PostgreSQL is running and accessible.
- Login says "Invalid credentials":
	- Re-run the seed with the intended `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- Accessing `/admin` redirects back to sign-in:
	- Confirm user has the `Administrator` role. The seed attaches it automatically.
- Sanity Studio fails to load:
	- Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` in `.env` and restart the dev server.

## Notes

- Auth callbacks and role mapping live in [src/lib/auth.ts](src/lib/auth.ts).
- Prisma client is created via Node driver adapter in [src/lib/prisma.ts](src/lib/prisma.ts).
- Homepage pulls from Sanity but includes safe fallbacks in [app/page.tsx](app/page.tsx).
