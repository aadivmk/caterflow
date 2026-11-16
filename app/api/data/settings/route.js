import { NextResponse } from "next/server";
import { getUser } from "@/lib/mongodb/auth";
import { saveSettings } from "@/lib/mongodb/store";

/** PUT /api/data/settings  body: the business settings, scoped to the signed-in user. */
export async function PUT(request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const settings = await request.json().catch(() => null);
  if (!settings || typeof settings.id !== "string") {
    return NextResponse.json({ error: "Settings with a string id are required." }, { status: 400 });
  }
  try {
    await saveSettings(settings, user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
