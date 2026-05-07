# Photographers4U

Photographers4U is a Next.js application for photographer onboarding, profile
management, and admin moderation. Photographers can build a draft profile,
complete onboarding, submit for review, and manage approved profile details.
Admins can review photographer submissions and publish approved profiles into
the live directory.




## Stack

- Next.js 16 App Router with React 19 and TypeScript
- Better Auth for email/password auth, magic links, and email verification
- Hono for the `/api` surface
- Drizzle ORM with PostgreSQL
- Resend for transactional email
- ImageKit for image uploads

## Local Setup

1. Copy `.env.sample` to `.env` and fill in the required secrets.
2. Start PostgreSQL with `pnpm db:up`.
3. Install dependencies with `pnpm install`.
4. Generate and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

5. Seed the photographer specialities:

```bash
pnpm db:seed:speciality
```

6. Start the app:

```bash
pnpm dev
```

Open `http://localhost:3000` after the dev server starts.

## Useful Scripts

- `pnpm dev` - run the Next.js dev server
- `pnpm build` - create a production build
- `pnpm typecheck` - run Next.js type generation and TypeScript checking
- `pnpm lint` - run Biome checks
- `pnpm db:up` / `pnpm db:down` - start or stop the local PostgreSQL container
- `pnpm db:generate` - generate Drizzle migrations
- `pnpm db:migrate` - apply migrations
- `pnpm db:seed:speciality` - seed onboarding specialities
- `pnpm db:studio` - open Drizzle Studio

## Architecture Notes

- Server-rendered pages should read data through
  `src/server/auth/session.ts` and `src/server/services/*` instead of calling
  the app's own HTTP routes.
- `src/server/db/dal/*` owns persistence, `src/server/db/controller/*` owns
  domain rules, and `src/server/api/routes/*` stays focused on validation,
  auth, and HTTP response mapping.
- `src/app/api/[[...route]]/route.ts` is the default Hono-powered API surface
  for domain reads and writes that should be reusable across web and mobile
  clients.
- Direct `src/app/api/*` handlers are reserved for intentional exceptions such
  as Better Auth adapter routes and multipart/provider upload endpoints. Those
  handlers should still delegate domain logic to `src/server/services/*`.
- Photographer moderation uses explicit workflow states:
  `draft`, `submitted`, `approved`, `rejected`, and `on_hold`.

## Product Areas

- Photographer onboarding and approved-profile management
- Admin moderation queue for photographer submissions
- Public photographer directory with saved-profile bookmarks
- Auth flows for verification, password reset, and email changes
