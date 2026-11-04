// Applique les migrations Drizzle (dossier drizzle/) à la base Turso.
// Lancé automatiquement avant chaque build Vercel.
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

const url = process.env.TURSO_DATABASE_URL || (process.env.VERCEL ? '' : 'file:local.db');
if (!url) {
  console.warn('⚠ TURSO_DATABASE_URL manquant : migrations ignorées. Ajoutez la base Turso dans Vercel puis redéployez.');
  process.exit(0);
}
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
client.close();
console.log('Base de données à jour.');
