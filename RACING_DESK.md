# Racing Desk

This module turns the app into a market-making style racing desk rather than a tips page.

## Core platform

- Vercel hosts the Next.js app and serverless route handlers.
- Supabase is the core database, auth, and operational data store.
- Betfair is the core execution and live market API.
- Punting Form is the core race-card and form-data API.

## What it does

- Scores every runner with a broad signal factory.
- Converts those signals into private probabilities.
- Blends private probabilities with live market priors.
- Applies uncertainty haircuts before staking.
- Sizes positions with fractional Kelly and race-level exposure caps.

## Environment

The page works immediately in demo mode.

To wire live data:

- `BETFAIR_APP_KEY`
- Optional instead of `BETFAIR_APP_KEY`: `BETFAIR_DELAY_APP_KEY` or `BETFAIR_LIVE_APP_KEY`
- `BETFAIR_SESSION_TOKEN`
- `PUNTING_FORM_AUTH_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- Optional: `PUNTING_FORM_AUTH_HEADER`
- Optional: `PUNTING_FORM_AUTH_SCHEME`
- Optional: `PUNTING_FORM_BASE_URL`

See [.env.example](/Users/timdickinson/Dropbox/Ai/Code%20Review/webapp/livestock-app/.env.example).

## Current status

The provider adapters are implemented, and the server route is ready to accept live credentials.
The final production step is venue/race mapping plus a historical warehouse to populate the full Benter/Simons feature set from real data snapshots.

## Supabase schema

Use [supabase/racing_schema.sql](/Users/timdickinson/Dropbox/Ai/Code%20Review/webapp/livestock-app/supabase/racing_schema.sql) for the dedicated racing tables.

## Vercel cron scaffolds

- [src/app/api/racing-desk/cron/cards/route.ts](/Users/timdickinson/Dropbox/Ai/Code%20Review/webapp/livestock-app/src/app/api/racing-desk/cron/cards/route.ts)
- [src/app/api/racing-desk/cron/market-snapshots/route.ts](/Users/timdickinson/Dropbox/Ai/Code%20Review/webapp/livestock-app/src/app/api/racing-desk/cron/market-snapshots/route.ts)

## Provider diagnostics

- [src/app/api/racing-desk/providers/betfair/route.ts](/Users/timdickinson/Dropbox/Ai/Code%20Review/webapp/livestock-app/src/app/api/racing-desk/providers/betfair/route.ts)
