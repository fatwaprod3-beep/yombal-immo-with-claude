import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Turso (libSQL) is SQLite-compatible: the existing Drizzle schema, queries,
// batches and migrations work unchanged. Locally, a file database is used.
let client: Client | undefined;
let db: LibSQLDatabase<typeof schema> | undefined;

export function getDb() {
  if (db) return db;
  const url = process.env.TURSO_DATABASE_URL || (process.env.NODE_ENV !== "production" ? "file:local.db" : "");
  if (!url) {
    throw new Error("Base de données non configurée : définissez TURSO_DATABASE_URL et TURSO_AUTH_TOKEN.");
  }
  client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  db = drizzle(client, { schema });
  return db;
}
