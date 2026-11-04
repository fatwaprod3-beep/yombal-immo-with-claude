// Applique les migrations (dossier drizzle/) à la base Supabase avant chaque build.
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

// Les migrations passent de préférence par la connexion directe (sans pooler).
const url = process.env.DATABASE_URL_DIRECT || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
if (!url) {
  console.warn('⚠ DATABASE_URL manquant : migrations ignorées. Ajoutez la base Supabase puis redéployez.');
  process.exit(0);
}
const client = postgres(url, { prepare: false, max: 1 });
await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
await client.end();
console.log('Base de données à jour.');
