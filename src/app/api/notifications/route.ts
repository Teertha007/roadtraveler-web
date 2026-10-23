import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return ok([]);
    return ok(await store.notifications(userId));
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST() {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    return ok(await store.markNotificationsRead(userId));
  } catch (error) {
    return fail(error, 500);
  }
}
