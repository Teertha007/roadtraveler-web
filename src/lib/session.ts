import { cookies } from "next/headers";

const NAME = "rt_session";

export async function getUserId() {
  const jar = await cookies();
  return jar.get(NAME)?.value ?? null;
}

export async function setUserId(id: string) {
  const jar = await cookies();
  jar.set(NAME, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

export async function clearUserId() {
  const jar = await cookies();
  jar.delete(NAME);
}
