import { NextResponse } from "next/server";
import { z } from "zod";
import { checkPassword, getUser, hashPassword } from "@/lib/mongodb/auth";
import { USERS_COLLECTION, getDb } from "@/lib/mongodb/client";
import { isMongoConfigured } from "@/lib/mongodb/config";

const patchSchema = z.object({
  fullName: z.string().max(80).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "New password must be at least 6 characters").optional(),
});

/** GET /api/auth/profile – returns the signed-in user's public fields. */
export async function GET(request) {
  if (!isMongoConfigured) {
    return NextResponse.json({ error: "MongoDB mode only." }, { status: 400 });
  }
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    const db = await getDb();
    const doc = await db.collection(USERS_COLLECTION).findOne({ _id: user.id });
    if (!doc) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({
      id: doc._id,
      email: doc.email,
      fullName: doc.fullName ?? "",
      role: doc.role,
      createdAt: doc.createdAt,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** PATCH /api/auth/profile – update fullName and/or password. */
export async function PATCH(request) {
  if (!isMongoConfigured) {
    return NextResponse.json({ error: "MongoDB mode only." }, { status: 400 });
  }
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { fullName, currentPassword, newPassword } = parsed.data;

  try {
    const db = await getDb();
    const doc = await db.collection(USERS_COLLECTION).findOne({ _id: user.id });
    if (!doc) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const updates = { updatedAt: new Date().toISOString() };

    if (fullName !== undefined) {
      updates.fullName = fullName.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Enter your current password to set a new one." },
          { status: 400 },
        );
      }
      const ok = await checkPassword(currentPassword, doc.passwordHash);
      if (!ok) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }
      updates.passwordHash = await hashPassword(newPassword);
    }

    await db.collection(USERS_COLLECTION).updateOne({ _id: user.id }, { $set: updates });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
