import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Base Supabase (PostgreSQL). Utiliser l’URL du pooler « Transaction » (port 6543)
// pour Vercel ; prepare:false est requis par ce mode.
let db: PostgresJsDatabase<typeof schema> | undefined;

export function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
}

export function getDb() {
  if (db) return db;
  const url = databaseUrl();
  if (!url) throw new Error("Base de données non configurée : définissez DATABASE_URL (Supabase).");
  const client = postgres(url, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 10 });
  db = drizzle(client, { schema });
  return db;
}
