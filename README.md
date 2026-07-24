# UniBridge

**Connect. Belong. Succeed.**

UniBridge is a campus connection and adjustment platform for international university students. The MVP is designed for students from any university, with launch-oriented sample content for Stony Brook University.

## Problem

International students often arrive with practical and social questions that are hard to solve alone: finding study partners, understanding office hours, attending events, writing appropriate academic messages, locating resources, and feeling less isolated. UniBridge turns those moments into guided, safer next steps.

## Main Features

- Public landing page with Stony Brook launch positioning
- Supabase-ready sign up, sign in, sign out, forgot password, and protected app routes
- Multi-step-style onboarding form and editable international student profile
- Stony Brook domain badge for `@stonybrook.edu` emails, clearly labeled as a matching-domain indicator only
- Discover Students page with filters and transparent rule-based match scores
- Connection requests, accepted connections, saved-profile affordances, and conversation placeholders
- Campus Events page with sample/community-added labels, event buddy requests, and buddy group placeholders
- Server-side Groq AI communication assistant with mock fallback when `GROQ_API_KEY` is missing
- Searchable Survival Guides with disclaimers for changing university-specific rules
- Community guidelines, privacy placeholder, and terms placeholder
- Supabase PostgreSQL schema, RLS policies, indexes, and seed SQL

## Screenshots

Add screenshots after running locally:

- Landing page
- Dashboard
- Discover Students
- Events
- AI Assistant
- Survival Guides

## Technology Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-inspired local primitives
- Supabase Auth, PostgreSQL, Storage-ready architecture
- Groq API from a secure server route
- Zod
- React Hook Form dependency included for production form expansion
- Lucide React
- Vitest
- Vercel-compatible deployment

## Architecture

The app uses sample data in `lib/sample-data.ts` for launch content, while user-owned actions sync to Supabase when credentials are configured. Supabase clients live in `lib/supabase`, and the database contract is documented in `supabase/schema.sql`. The matching algorithm is isolated in `lib/matching.ts`, and validation schemas live in `lib/validation.ts`.

Protected routes are grouped under `app/(app)` and wrapped by a shared app shell with desktop sidebar and mobile bottom navigation. Middleware protects those routes when Supabase environment variables are configured. Without Supabase variables, the app remains demoable locally.

## Environment Variables

Copy `.env.example` to `.env.local` and fill values as needed:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never commit real credentials.

## Local Installation

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. Add the values from Project Settings to `.env.local`.
3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. Run `supabase/seed.sql` in the SQL editor for fictional demo data.
5. Create a private storage bucket later for profile photos if you want uploaded avatars.

The schema includes RLS policies so students can modify their own private information, authenticated students can read discoverable profiles subject to privacy settings, and user-owned actions are scoped to the signed-in account.

## Groq Setup

Add `GROQ_API_KEY` to `.env.local` and to Vercel environment variables. The assistant route is `app/api/assistant/route.ts`; no Groq key is exposed to client-side code. When no key is configured, the route returns clearly marked mock output for development demos.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run seed
```

`npm run seed` checks Supabase connectivity and points you to `supabase/seed.sql`. For full SQL seeding, paste the seed file into the Supabase SQL editor or wire an approved SQL RPC.

## Deployment

Deploy on Vercel:

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add Supabase and Groq environment variables.
4. Run the Supabase schema and seed SQL.
5. Deploy.

## Known Limitations

- Some launch-content screens keep a local fallback so the app remains usable if Supabase is not configured.
- Messaging is represented by a “Start Conversation” placeholder.
- Legal pages are placeholders and should be reviewed before public launch.
- Sample Stony Brook content is not official and must not be presented as guaranteed policy.

## Future Improvements

- Supabase storage-backed avatars
- Direct messaging
- Approved campus calendar feed integration
- Email verification enforcement
- End-to-end tests with Playwright
- Analytics and recommendation tuning

## Safety And Privacy Notes

Meet new people in public campus locations, avoid sharing financial or sensitive personal information, report suspicious behavior, and independently verify housing, ride-sharing, employment, and marketplace-like arrangements. UniBridge does not implement marketplace features in this MVP.
