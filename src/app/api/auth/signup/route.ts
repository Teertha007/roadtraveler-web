import { fail, ok } from "@/lib/http";
import { setUserId } from "@/lib/session";
import { store } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await store.signup({
      username: body.username || "",
      display_name: body.display_name || body.username || "",
      password: body.password || "",
    });
    await setUserId(user.id);
    return ok(user, 201);
  } catch (error) {
    return fail(error);
  }
}
