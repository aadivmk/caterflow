import { NextResponse } from "next/server";
import { getUser } from "@/lib/mongodb/auth";
import { resetDemoData } from "@/lib/mongodb/store";

/** POST /api/data/reset: deletes this user's data and restores the demo dataset. */
export async function POST(request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    return NextResponse.json(await resetDemoData(user.id));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
