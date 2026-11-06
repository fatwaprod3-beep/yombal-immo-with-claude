import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '../../../../db';
import { users } from '../../../../db/schema';
import { getCurrentUser, checkPassword, hashPassword } from '../../../auth';
import { tooManyAttempts } from '../../../../lib/auth-limits';
import { logSecurity } from '../../../../lib/security';
export const dynamic = 'force-dynamic';
const schema = z.object({ current: z.string().min(1).max(200), next: z.string().min(8).max(200) });
// Changement de mot de passe : l'ancien est obligatoire.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: 'Connexion nécessaire.' }, { status: 401 });
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Origine refusée.' }, { status: 403 });
  const p = schema.safeParse(await request.json().catch(() => ({})));
  if (!p.success) return Response.json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
  if (await tooManyAttempts('password:' + user.userId)) return Response.json({ error: 'Trop d’essais. Réessayez dans 15 minutes.' }, { status: 429 });
  const db = getDb();
  const row = (await db.select().from(users).where(eq(users.id, user.userId)).limit(1))[0];
  if (!row || !(await checkPassword(p.data.current, row.passwordSalt, row.passwordHash))) return Response.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 });
  const { salt, hash } = await hashPassword(p.data.next);
  await db.update(users).set({ passwordSalt: salt, passwordHash: hash }).where(eq(users.id, user.userId));
  await logSecurity('admin_action', { userId: user.userId, email: user.email, request, detail: 'Mot de passe modifié par l’utilisateur' }).catch(() => {});
  return Response.json({ ok: true });
}
