import "server-only";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB || "caterflow";

/** Collection names. Property names match the app's CollectionKey values. */
export const COLLECTIONS = {
  customers: "customers",
  menuItems: "menuItems",
  menus: "menus",
  bookings: "bookings",
  calculations: "savedCalculations",
};
export const SETTINGS_COLLECTION = "businessSettings";
export const USERS_COLLECTION = "users";

async function ensureIndexes(db) {
  await Promise.all([
    db.collection(USERS_COLLECTION).createIndex({ email: 1 }, { unique: true }),
    // userId scopes every collection to its owner — index it for fast per-user reads.
    db.collection(COLLECTIONS.customers).createIndex({ userId: 1, phone: 1 }),
    db.collection(COLLECTIONS.bookings).createIndex({ userId: 1, eventDate: 1 }),
    db.collection(COLLECTIONS.bookings).createIndex({ userId: 1, customerId: 1 }),
    db.collection(COLLECTIONS.bookings).createIndex({ userId: 1, status: 1 }),
    db.collection(COLLECTIONS.menuItems).createIndex({ userId: 1 }),
    db.collection(COLLECTIONS.menus).createIndex({ userId: 1 }),
    db.collection(COLLECTIONS.calculations).createIndex({ userId: 1 }),
    db.collection(SETTINGS_COLLECTION).createIndex({ userId: 1 }),
  ]);
}

/**
 * Returns the shared Db. The connection is created once and cached on
 * globalThis so hot reloads and serverless invocations reuse it.
 */
export async function getDb() {
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
  if (!globalThis.__caterflowDb) {
    globalThis.__caterflowDb = (async () => {
      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db(dbName);
      await ensureIndexes(db);
      return db;
    })();
  }
  try {
    return await globalThis.__caterflowDb;
  } catch (e) {
    globalThis.__caterflowDb = undefined;
    throw e;
  }
}
