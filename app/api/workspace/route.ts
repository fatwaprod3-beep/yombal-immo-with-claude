import {subscriptionFor} from '../../../lib/subscription-server';
import {freeLimitExceeded} from '../../../lib/free-limits';
import {requiredProFeature} from '../../../lib/billing';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '../../auth';
import { getDb } from '../../../db';
import { workspaces,directories } from '../../../db/schema';
import { emptyState, type State } from '../../../lib/model';
import { applyMutation } from '../../../lib/validation';
import { z } from 'zod';
import { getWorkspace } from '../../../lib/spaces';
export const dynamic = 'force-dynamic';
function json(value: unknown, status = 200) { return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } }); }
export async function GET(request:Request) {
  const user = await getCurrentUser(); if (!user) return json({ error: 'Connectez-vous pour retrouver votre espace.' }, 401);
  try { const {row,spaceId,directory}=await getWorkspace(user,new URL(request.url).searchParams.get('space')||undefined); return json({state:JSON.parse(row.data),revision:row.revision,spaceId,spaces:directory.spaces,subscription:await subscriptionFor(user.userId)}); }
  catch (error) { console.error('Workspace read failed', error instanceof Error ? error.message : 'unknown'); return json({ error: 'Votre espace est momentanément indisponible. Réessayez dans un instant.' }, 503); }
}
export async function POST(request: Request) {
  const user = await getCurrentUser(); if (!user) return json({ error: 'Connectez-vous pour enregistrer vos données.' }, 401);
  const origin = request.headers.get('origin'); if (origin && origin !== new URL(request.url).origin) return json({ error: 'Origine non autorisée.' }, 403);
  try {
    if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Format de requête invalide.' }, 415);
    const body = await request.text(); if (body.length > 2200000) return json({ error: 'Fichier trop volumineux.' }, 413);
    const parsed = z.object({ revision: z.number().int().nonnegative(), spaceId:z.string().max(100).optional(), mutation: z.unknown() }).strict().parse(JSON.parse(body)); const {row,key,spaceId,directory} = await getWorkspace(user,parsed.spaceId);
    if (row.revision !== parsed.revision) return json({ error: 'Votre espace a changé sur un autre appareil. Les données ont été actualisées ; vérifiez puis réessayez.' }, 409);
    const current=JSON.parse(row.data) as State;const feature=requiredProFeature(parsed.mutation as {action?:string;data?:unknown},current.profile);if(feature&&!(await subscriptionFor(user.userId)).isPro)return json({error:'Cette fonction demande Yombal Pro.',code:'PRO_REQUIRED',feature},402);
    const next = applyMutation(current, parsed.mutation);
    const limit=freeLimitExceeded(current,next);if(limit&&!(await subscriptionFor(user.userId)).isPro)return json({error:limit==='tenants'?'La version gratuite comprend 7 locataires. Passez à Pro pour continuer.':'La version gratuite comprend 6 biens ou logements. Passez à Pro pour continuer.',code:'PRO_REQUIRED',feature:limit},402);
    const changed = await getDb().update(workspaces).set({ data: JSON.stringify(next), revision: row.revision + 1, updatedAt: new Date().toISOString() }).where(and(eq(workspaces.userId, key), eq(workspaces.revision, row.revision))).returning({ revision: workspaces.revision });
    if (!changed.length) return json({ error: 'Une modification vient d’être enregistrée sur un autre appareil. Actualisez puis réessayez.' }, 409);
    if((parsed.mutation as {action?:string})?.action==='profile'){const index=directory.spaces.findIndex(s=>s.id===spaceId);try{const fresh=(await getDb().select().from(directories).where(eq(directories.userId,user.userId)).limit(1))[0];if(fresh){const dir=JSON.parse(fresh.data);if(dir.spaces?.[index]){dir.spaces[index].name=next.profile.company||'Mon patrimoine';dir.spaces[index].mode=next.profile.mode;}await getDb().update(directories).set({data:JSON.stringify(dir)}).where(and(eq(directories.userId,user.userId),eq(directories.data,fresh.data)));}}catch{console.error('Space label update pending');}}return json({ state: next, revision: changed[0].revision });
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: 'Vérifiez les champs : ' + error.issues.slice(0, 3).map(issue => issue.path.join('.') + ' — ' + issue.message).join(' ; ') }, 400);
    if (error instanceof SyntaxError) return json({ error: 'Le fichier ne contient pas des données valides.' }, 400);
    return json({ error: error instanceof Error && !/D1|SQL|binding|database/i.test(error.message) ? error.message : 'L’enregistrement a échoué. Vos données actuelles sont conservées.' }, 400);
  }
}
