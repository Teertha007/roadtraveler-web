function truthy(v: string | undefined) {
  return v === "1" || v === "true" || v === "yes";
}

export function isVercel() {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
}

export function isProduction() {
  return process.env.NODE_ENV === "production" || isVercel();
}

/** True only when URL + service role are set (anon key alone is never enough). */
export function supabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return Boolean(url && key && !url.includes("your-project") && !url.includes("mock") && !key.includes("your-"));
}

/** Local JSON DB is only for development machines — never on Vercel. */
export function useLocalDb() {
  if (isVercel()) return false;
  if (supabaseConfigured()) return false;
  if (isProduction() && !truthy(process.env.ALLOW_LOCAL_DB)) return false;
  return true;
}

export function assertDbReady() {
  if (useLocalDb() || supabaseConfigured()) return;
  throw new Error(
    "Database is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see DEPLOY.md), or set ALLOW_LOCAL_DB=1 for local-only development."
  );
}

/** HMAC secret for signed session cookies. Required on Vercel. */
export function sessionSecret() {
  const secret = process.env.SESSION_SECRET || "";
  if (secret.length >= 16) return secret;
  if (isVercel()) {
    throw new Error("SESSION_SECRET must be set on Vercel (min 16 characters). See DEPLOY.md.");
  }
  // Local-only fallback so `npm run dev` works without extra setup.
  return "local-dev-session-secret";
}

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || (isVercel() ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
}
