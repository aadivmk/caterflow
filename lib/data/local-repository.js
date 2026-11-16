import { LOCAL_STORAGE_KEY } from "@/lib/constants";

import { buildSeed } from "./seed";

/**
 * Local development mode: all data lives in this browser's localStorage.
 * Methods are async so the interface matches the MongoDB implementation.
 */
export class LocalRepository {
  mode = "local";

  read() {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const seed = buildSeed();
      this.write(seed);
      return seed;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.settings || !Array.isArray(parsed.bookings)) throw new Error("shape");
      return parsed;
    } catch {
      throw new Error(
        "The data saved in this browser could not be read. Reset the demo data to start again.",
      );
    }
  }

  write(data) {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch {
      throw new Error("Could not save. Browser storage is full or blocked.");
    }
  }

  async loadAll() {
    return this.read();
  }

  async upsert(collection, record) {
    const data = this.read();
    const list = data[collection];
    const index = list.findIndex((r) => r.id === record.id);
    if (index >= 0) list[index] = record;
    else list.push(record);
    this.write(data);
  }

  async remove(collection, id) {
    const data = this.read();
    data[collection] = data[collection].filter((r) => r.id !== id);
    this.write(data);
  }

  async saveSettings(settings) {
    const data = this.read();
    data.settings = settings;
    this.write(data);
  }

  async resetDemoData() {
    const seed = buildSeed();
    this.write(seed);
    return seed;
  }
}
