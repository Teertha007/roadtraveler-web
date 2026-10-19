import { fail, ok } from "@/lib/http";
import { setUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await store.login(body.username || "", body.password || "");
    await setUserId(user.id);
    return ok(user);
  } catch (error) {
    return fail(error);
  }
}
