import { NextResponse } from "next/server";

export function ok(data: unknown, status = 200) {
  const count = Array.isArray(data) ? data.length : undefined;
  return NextResponse.json({ success: true, count, data }, { status });
}

export function fail(error: unknown, fallback = 400) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  const status = message === "Sign in required." ? 401 : fallback;
  return NextResponse.json({ success: false, error: message }, { status });
}
