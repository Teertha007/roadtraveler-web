# Deploy checklist

RoadTraveler is deployable on **Vercel + Supabase**. Local JSON DB is for development only.

## 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. **SQL Editor** → run `supabase/minimal.sql` (required: `app_state` + RLS + `uploads` bucket)
3. Confirm Storage bucket **`uploads`** exists and is **Public**
4. **Project Settings → API** → copy Project URL and **`service_role`** key (server only)

First cloud boot seeds sample content **without** a public demo password. Create an account via Sign up.

## 2. Vercel environment variables

| Variable | Required |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | yes (server only — never expose) |
| `SESSION_SECRET` | yes (min 16 chars; random hex) |
| `NEXT_PUBLIC_APP_URL` | yes (e.g. `https://your-app.vercel.app`) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | optional — Mapbox dark map on `/map` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | optional — if set, overrides Mapbox; else Mapbox; else free Leaflet |
| `ALLOW_LOCAL_DB` | **never** on Vercel |

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Ship

```bash
npm run typecheck
npm run build
npx vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard, add the env vars, and redeploy.

## 4. Verify

- `GET /api/health` → `{ "ok": true, "mode": "supabase", "sessionSecret": true }`
- Sign up a new user (no public demo login in production)

## Local (no cloud)

```bash
cp .env.example .env.local   # keep ALLOW_LOCAL_DB=1
npm i && npm run dev
```

Demo (local only): `teertha` / `roadtraveler`
