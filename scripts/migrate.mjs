// Étape exécutée avant chaque build.
// - Le schéma Supabase est appliqué une fois depuis drizzle/ (RUN_MIGRATIONS=1 pour l’appliquer au build).
// - Vérifie que la base répond, sans jamais afficher le mot de passe.
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
if (!url) {
  console.warn('⚠ DATABASE_URL manquant : vérification ignorée.');
  process.exit(0);
}
const hide = value => value.replace(/:\/\/([^:]+):[^@]+@/, '://$1:***@');

if (process.env.DB_PROBE === '1') {
  // Teste les deux grappes du pooler Supabase pour trouver la bonne adresse.
  const parsed = new URL(url);
  const region = (parsed.hostname.match(/aws-\d-(.+)\.pooler\.supabase\.com/) || [])[1];
  for (const prefix of region ? ['aws-0', 'aws-1', 'aws-2'] : [null]) {
    const candidate = new URL(url);
    if (prefix) candidate.hostname = `${prefix}-${region}.pooler.supabase.com`;
    const client = postgres(candidate.toString(), { prepare: false, max: 1, connect_timeout: 8 });
    try {
      const rows = await client`select count(*)::int as n from yombal_users`;
      console.log(`DB_PROBE OK ${hide(candidate.toString())} (comptes : ${rows[0].n})`);
    } catch (error) {
      console.log(`DB_PROBE ÉCHEC ${hide(candidate.toString())} : ${error.message}`);
    } finally {
      await client.end({ timeout: 2 }).catch(() => {});
    }
  }
}

if (process.env.RUN_MIGRATIONS === '1') {
  const client = postgres(process.env.DATABASE_URL_DIRECT || url, { prepare: false, max: 1 });
  await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
  await client.end();
  console.log('Migrations appliquées.');
}
