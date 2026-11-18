import { apiUrl } from "@/lib/api-url";
import { clearSession, getSession } from "@/lib/mongodb/session";

async function call(path, options = {}) {
  const session = getSession();
  if (!session) throw new Error("Sign in required.");
  const response = await fetch(apiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) clearSession();
  if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
  return body;
}

/**
 * MongoDB implementation of the Repository. A browser cannot connect to
 * MongoDB, so every call goes to the Route Handlers under /api/data, which
 * read and write the database on the server.
 */
export class MongoRepository {
  mode = "mongodb";

  loadAll() {
    return call("/api/data");
  }

  async upsert(collection, record) {
    await call(`/api/data/${collection}`, { method: "PUT", body: JSON.stringify(record) });
  }

  async remove(collection, id) {
    await call(`/api/data/${collection}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async saveSettings(settings) {
    await call("/api/data/settings", { method: "PUT", body: JSON.stringify(settings) });
  }

  resetDemoData() {
    return call("/api/data/reset", { method: "POST" });
  }
}
