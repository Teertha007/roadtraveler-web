import crypto from "crypto";
import { cookies } from "next/headers";
import { isVercel, sessionSecret } from "@/lib/env";

const NAME = "rt_session";
const MAX_AGE_MS = 60 * 60 * 24 * 30 * 1000;

function sign(userId: string) {
  const exp = Date.now() + MAX_AGE_MS;
  const payload = `${userId}.${exp}`;
  const sig = crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verify(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expStr, sig] = parts;
  if (!userId || !expStr || !sig) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  const payload = `${userId}.${expStr}`;
  const expected = crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return userId;
}

export async function getUserId() {
  const jar = await cookies();
  const raw = jar.get(NAME)?.value;
  if (!raw) return null;
  return verify(raw);
}

export async function setUserId(id: string) {
  const jar = await cookies();
  jar.set(NAME, sign(id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(MAX_AGE_MS / 1000),
    secure: isVercel(),
  });
}

export async function clearUserId() {
  const jar = await cookies();
  jar.delete(NAME);
}
