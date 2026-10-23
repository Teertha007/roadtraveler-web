import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const body = await request.json();
    return ok(await store.toggleBookmark(userId, body.post_id));
  } catch (error) {
    return fail(error, 500);
  }
}
