import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, signToken } from "@/lib/mongodb/auth";
import { USERS_COLLECTION, getDb } from "@/lib/mongodb/client";
import { isMongoConfigured } from "@/lib/mongodb/config";
import { emailAddress } from "@/lib/validations/common";

const schema = z.object({
  email: emailAddress,
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/** POST /api/auth/register: creates a users document and returns an access token. */
export async function POST(request) {
  if (!isMongoConfigured) {
    return NextResponse.json({ error: "Sign-in is only available in MongoDB mode." }, { status: 400 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  try {
    const db = await getDb();
    const now = new Date().toISOString();
    const user = {
      _id: crypto.randomUUID(),
      email,
      passwordHash: await hashPassword(parsed.data.password),
      fullName: "",
      role: "manager",
      createdAt: now,
      updatedAt: now,
    };
    await db.collection(USERS_COLLECTION).insertOne(user);
    return NextResponse.json({ token: await signToken(user), email }, { status: 201 });
  } catch (e) {
    if (e?.code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
