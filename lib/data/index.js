import { isMongoConfigured } from "@/lib/mongodb/config";

export const dataMode = isMongoConfigured ? "mongodb" : "local";

let repository = null;

/**
 * Returns the active data store. The implementation is loaded on demand, so
 * only the one in use is downloaded by the browser.
 */
export async function getRepository() {
  if (repository) return repository;
  if (dataMode === "mongodb") {
    const { MongoRepository } = await import("./mongodb-repository");
    repository = new MongoRepository();
  } else {
    const { LocalRepository } = await import("./local-repository");
    repository = new LocalRepository();
  }
  return repository;
}
