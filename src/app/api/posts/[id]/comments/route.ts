import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    return ok(await store.getComments(id));
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const { id } = await ctx.params;
    const body = await request.json();
    if (!body.content || !String(body.content).trim()) return fail(new Error("Comment cannot be empty."));
    return ok(await store.addComment(userId, id, body.content), 201);
  } catch (error) {
    return fail(error, 500);
  }
}
