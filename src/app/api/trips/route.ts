import { fail, ok } from "@/lib/http";
import { getUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    return ok(await store.tripsFor(userId));
  } catch (error) {
    return fail(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return fail(new Error("Sign in required."));
    const body = await request.json();
    return ok(await store.createTrip(userId, body.title || "New trip"), 201);
  } catch (error) {
    return fail(error, 500);
  }
}
