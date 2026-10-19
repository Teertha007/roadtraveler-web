import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const { id } = await ctx.params;
    return ok(await store.removeStop(userId, id));
  } catch (error) {
    return fail(error, 500);
  }
}
