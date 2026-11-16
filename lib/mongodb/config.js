/**
 * Public switch for the data store. MONGODB_URI itself is a server-only secret
 * and is never exposed to the browser; this flag only tells the UI that the
 * app should talk to the MongoDB-backed API instead of localStorage.
 *
 * NEXT_PUBLIC_DATA_MODE=mongodb  -> MongoDB mode (sign-in required)
 * anything else                  -> local mode (browser localStorage)
 */
export const isMongoConfigured = process.env.NEXT_PUBLIC_DATA_MODE === "mongodb";

export const TOKEN_KEY = "caterflow:token";
export const EMAIL_KEY = "caterflow:email";
