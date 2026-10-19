import { ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  const user = await store.me(await getUserId());
  return ok(user);
}
