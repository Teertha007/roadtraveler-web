import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const { id } = await ctx.params;
    const body = await request.json();
    const status = body.status === "going" ? "going" : "interested";
    return ok(await store.rsvp(userId, id, status));
  } catch (error) {
    return fail(error, 500);
  }
}
