import { NextResponse } from "next/server";
import { z } from "zod";
import { checkPassword, signToken } from "@/lib/mongodb/auth";
import { USERS_COLLECTION, getDb } from "@/lib/mongodb/client";
import { isMongoConfigured } from "@/lib/mongodb/config";

const schema = z.object({ email: z.string().trim().min(1), password: z.string().min(1) });

/** POST /api/auth/login: checks the password hash and returns an access token. */
export async function POST(request) {
  if (!isMongoConfigured) {
    return NextResponse.json({ error: "Sign-in is only available in MongoDB mode." }, { status: 400 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  try {
    const db = await getDb();
    // email is validated as a plain string, so operator objects cannot be injected.
    const user = await db
      .collection(USERS_COLLECTION)
      .findOne({ email: parsed.data.email.toLowerCase() });
    if (!user || !(await checkPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
    }
    return NextResponse.json({ token: await signToken(user), email: user.email });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
