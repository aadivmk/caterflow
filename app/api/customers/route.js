import { NextResponse } from "next/server";
import { buildSeed } from "@/lib/data/seed";
import { getUser } from "@/lib/mongodb/auth";
import { COLLECTIONS, getDb } from "@/lib/mongodb/client";
import { isMongoConfigured } from "@/lib/mongodb/config";
import { fromDoc, toDoc } from "@/lib/mongodb/mappers";
import { fieldErrorsFrom } from "@/lib/validations/common";
import { customerSchema } from "@/lib/validations/customer";

/** GET /api/customers: see /api/bookings for how the two data modes behave. */
export async function GET(request) {
  if (!isMongoConfigured) {
    return NextResponse.json({ source: "demo", customers: buildSeed().customers });
  }
  if (!(await getUser(request))) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    const db = await getDb();
    const docs = await db.collection(COLLECTIONS.customers).find({}).sort({ name: 1 }).toArray();
    return NextResponse.json({ source: "mongodb", customers: docs.map(fromDoc) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** POST /api/customers: validates and (in MongoDB mode) creates a customer. */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid customer details.", fieldErrors: fieldErrorsFrom(parsed.error) },
      { status: 400 },
    );
  }

  if (!isMongoConfigured) {
    return NextResponse.json({
      persisted: false,
      note: "Local mode stores data in the browser. Set NEXT_PUBLIC_DATA_MODE=mongodb to save through this API.",
      customer: parsed.data,
    });
  }

  if (!(await getUser(request))) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    const db = await getDb();
    const now = new Date().toISOString();
    const customer = {
      ...parsed.data,
      id: crypto.randomUUID(),
      isDemo: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection(COLLECTIONS.customers).insertOne(toDoc(customer));
    return NextResponse.json({ persisted: true, customer }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
