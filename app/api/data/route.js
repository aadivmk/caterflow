import { NextResponse } from "next/server";
import { getUser } from "@/lib/mongodb/auth";
import { loadAll } from "@/lib/mongodb/store";

/** GET /api/data: every collection plus the settings scoped to the signed-in user. */
export async function GET(request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    return NextResponse.json(await loadAll(user.id));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
