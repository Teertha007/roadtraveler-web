import { NextResponse } from "next/server";
import { isProduction, isVercel, supabaseConfigured, useLocalDb } from "@/lib/env";

export async function GET() {
  // Always reflect live env (avoid stale static snapshot on Vercel).
  void process.env.VERCEL;
  void process.env.SESSION_SECRET;
  void process.env.NEXT_PUBLIC_SUPABASE_URL;
  void process.env.SUPABASE_SERVICE_ROLE_KEY;
  void process.env.ALLOW_LOCAL_DB;
  const mode = useLocalDb() ? "local-json" : supabaseConfigured() ? "supabase" : "unconfigured";
  const sessionOk = Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) || !isVercel();
  const ready = mode !== "unconfigured" && sessionOk;
  return NextResponse.json(
    {
      ok: ready,
      mode,
      demoLogin: mode === "local-json",
      sessionSecret: sessionOk,
      production: isProduction(),
      vercel: isVercel(),
    },
    { status: ready ? 200 : 503 }
  );
}
