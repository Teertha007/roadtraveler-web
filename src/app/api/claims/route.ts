import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const body = await request.json();
    if (!body.business_email) return fail(new Error("Business email is required."));
    return ok(await store.createClaim(userId, body), 201);
  } catch (error) {
    return fail(error, 500);
  }
}
