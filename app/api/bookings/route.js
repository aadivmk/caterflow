import { NextResponse } from "next/server";
import { prepareBooking } from "@/lib/bookings/prepare";
import { buildSeed } from "@/lib/data/seed";
import { getUser } from "@/lib/mongodb/auth";
import { COLLECTIONS, getDb } from "@/lib/mongodb/client";
import { isMongoConfigured } from "@/lib/mongodb/config";
import { fromDoc, toDoc } from "@/lib/mongodb/mappers";
import { normalizePhone } from "@/lib/utils";

/**
 * GET /api/bookings
 * MongoDB mode: returns the bookings collection (send the access token as
 * "Authorization: Bearer <token>").
 * Local mode: the server cannot read a browser's localStorage, so this returns
 * the bundled demo bookings and says so in the "source" field.
 */
export async function GET(request) {
  if (!isMongoConfigured) {
    return NextResponse.json({ source: "demo", bookings: buildSeed().bookings });
  }
  if (!(await getUser(request))) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    const db = await getDb();
    const docs = await db.collection(COLLECTIONS.bookings).find({}).sort({ eventDate: 1 }).toArray();
    return NextResponse.json({ source: "mongodb", bookings: docs.map(fromDoc) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * POST /api/bookings
 * Validates a booking with the same schema and pricing rules as the app.
 * MongoDB mode: links or creates the customer, then inserts the booking.
 * Local mode: returns the validated booking with "persisted: false".
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const result = prepareBooking(body, "create");
  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, fieldErrors: result.fieldErrors },
      { status: 400 },
    );
  }
  const draft = result.data;

  if (!isMongoConfigured) {
    return NextResponse.json({
      persisted: false,
      note: "Local mode stores data in the browser. Set NEXT_PUBLIC_DATA_MODE=mongodb to save through this API.",
      booking: draft,
    });
  }

  if (!(await getUser(request))) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  try {
    const db = await getDb();
    const now = new Date().toISOString();

    // Associate the booking with an existing customer by phone, or create one.
    const customers = await db.collection(COLLECTIONS.customers).find({}, { projection: { phone: 1 } }).toArray();
    let customerId = customers.find(
      (c) => normalizePhone(c.phone) === normalizePhone(draft.customerPhone),
    )?._id;

    if (!customerId) {
      customerId = crypto.randomUUID();
      await db.collection(COLLECTIONS.customers).insertOne({
        _id: customerId,
        name: draft.customerName,
        phone: draft.customerPhone,
        email: draft.customerEmail,
        address: "",
        notes: "",
        isDemo: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    const { customerName, customerPhone, customerEmail, menuId, ...event } = draft;
    void customerName;
    void customerPhone;
    void customerEmail;
    const booking = {
      ...event,
      id: crypto.randomUUID(),
      customerId,
      menuId: menuId || null,
      isDemo: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection(COLLECTIONS.bookings).insertOne(toDoc(booking));
    return NextResponse.json({ persisted: true, booking }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
