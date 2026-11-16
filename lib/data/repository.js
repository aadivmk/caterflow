/**
 * The single contract the UI uses to read and write data.
 *
 * Components and hooks never touch localStorage or MongoDB directly. They
 * call a Repository, and `getRepository()` decides which implementation to
 * use from the environment variables. Moving from local mode to MongoDB is a
 * configuration change, not a rewrite.
 *
 * Both `LocalRepository` and `MongoRepository` provide these methods. Because
 * the project is plain JavaScript, the contract is documented here as a JSDoc
 * typedef rather than enforced by a compiler.
 *
 * @typedef {Object} Repository
 * @property {import("@/types").DataMode} mode "local" or "mongodb".
 * @property {() => Promise<import("@/types").AppData>} loadAll Reads every collection and the settings.
 * @property {(collection: import("@/types").CollectionKey, record: object) => Promise<void>} upsert
 *   Inserts a record, or replaces the one with the same id.
 * @property {(collection: import("@/types").CollectionKey, id: string) => Promise<void>} remove
 *   Deletes one record by id.
 * @property {(settings: import("@/types").BusinessSettings) => Promise<void>} saveSettings
 *   Saves the business settings.
 * @property {() => Promise<import("@/types").AppData>} resetDemoData
 *   Deletes all records and restores the bundled demo dataset.
 */

export {};
