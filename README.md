# RoadTraveler Web

USA roadside discovery / camping / RVing travel social app — **Next.js 16.4.3 (App Router)** + optional **Supabase**.

## Production vs local

| Mode | When | Storage |
|---|---|---|
| **Local JSON** | `ALLOW_LOCAL_DB=1` and no Supabase keys (dev only) | `%LOCALAPPDATA%/roadtraveler-web/db.json` |
| **Supabase** | URL + service role key set (required on Vercel) | `app_state` JSONB row + `uploads` Storage bucket |

Vercel refuses to boot without Supabase (`src/lib/env.ts`). Uploads go to Storage when configured, otherwise a data-URL fallback.

## Local development

```bash
npm i
cp .env.example .env.local
# Keep ALLOW_LOCAL_DB=1 for the local JSON DB (or fill in Supabase keys)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo login:** `teertha` / `roadtraveler`

Useful scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run build
npm start
```

## Production (Supabase + Vercel)

### 1. Create a free Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a project.
2. In **SQL Editor**, run in order:
   - `supabase/schema.sql`
   - `supabase/seed.sql`
3. From **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose to the client)

### 2. Set env on Vercel

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Required (server only) |
| `SESSION_SECRET` | Required (signed cookies; min 16 chars) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL, e.g. `https://your-app.vercel.app` |
| `ALLOW_LOCAL_DB` | **Do not set** on Vercel |

See `.env.example` and `DEPLOY.md`. Production has no public demo password — use Sign up.

### 3. Deploy

```bash
npx vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard and redeploy after env is set.

Short checklist: **[DEPLOY.md](./DEPLOY.md)**.

## Stack

- Next.js 16 / React 19 / TypeScript / Tailwind CSS v4
- `@supabase/supabase-js` (when configured)
- Leaflet / Google Maps loaders for map views
