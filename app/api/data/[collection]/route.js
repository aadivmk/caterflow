import { NextResponse } from "next/server";
import { getUser } from "@/lib/mongodb/auth";
import { isCollectionKey, removeRecord, upsertRecord } from "@/lib/mongodb/store";

async function guard(request, params) {
  const user = await getUser(request);
  if (!user) {
    return { response: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  const { collection } = await params;
  if (!isCollectionKey(collection)) {
    return { response: NextResponse.json({ error: "Unknown collection." }, { status: 404 }) };
  }
  return { collection, userId: user.id };
}

/** PUT /api/data/:collection  body: the record. Inserts or replaces by id, scoped to this user. */
export async function PUT(request, { params }) {
  const { collection, userId, response } = await guard(request, params);
  if (response) return response;
  const record = await request.json().catch(() => null);
  if (!record || typeof record.id !== "string" || record.id.length === 0) {
    return NextResponse.json({ error: "A record with a string id is required." }, { status: 400 });
  }
  try {
    await upsertRecord(collection, record, userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** DELETE /api/data/:collection?id=... */
export async function DELETE(request, { params }) {
  const { collection, userId, response } = await guard(request, params);
  if (response) return response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });
  try {
    await removeRecord(collection, id, userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
