import { ok } from "@/lib/http";
import { clearUserId } from "@/lib/session";

export async function POST() {
  await clearUserId();
  return ok({ ok: true });
}
