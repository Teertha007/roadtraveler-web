import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const { id } = await ctx.params;
    const body = await request.json();
    if (!body.title) return fail(new Error("Stop title is required."));
    return ok(await store.addStop(userId, id, body), 201);
  } catch (error) {
    return fail(error, 500);
  }
}
